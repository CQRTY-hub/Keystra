import { createInterface } from "node:readline/promises";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/admin/password";
import { generateTotpSecret, totpUri } from "../src/lib/admin/totp";

/**
 * Creates or rotates the single AdminCredential row (PLAN.md, Phase 3.5
 * "Access": "Single admin login, my email only. No public registration").
 * Run locally, by the owner, from a trusted terminal — never a web
 * route, which is exactly why there is no /admin/register page anywhere
 * in this app.
 *
 * Run with: npm run admin:setup
 *
 * Re-running this rotates BOTH the password and the TOTP secret — the
 * old ones stop working the moment this finishes. That's deliberate:
 * there's no "just change the password" half-step, since a compromised
 * password and a compromised TOTP secret are both "start over" events
 * for a single-admin account.
 */

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error(
      "ADMIN_EMAIL is not set. Add it to .env.local (see .env.example) and re-run."
    );
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log(`Setting up the admin account for ${email}.`);
  console.log(
    "This will REPLACE any existing password and 2FA secret — the old ones stop working immediately.\n"
  );
  const password = await rl.question("Choose a password (shown as you type — run this somewhere private): ");
  rl.close();

  if (password.length < 12) {
    console.error("Password must be at least 12 characters. Nothing was changed — run again.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const totpSecret = generateTotpSecret();

  await prisma.adminCredential.upsert({
    where: { id: 1 },
    create: { id: 1, email, passwordHash, totpSecret, failedAttempts: 0, lockedUntil: null },
    update: { email, passwordHash, totpSecret, failedAttempts: 0, lockedUntil: null },
  });

  console.log("\nAdmin credential saved.\n");
  console.log("Add this account to your authenticator app (Google Authenticator, Authy, 1Password, ...) now —");
  console.log("this secret is shown once and is not recoverable from the database afterward:\n");
  console.log(`  Secret (type this in manually):  ${totpSecret}`);
  console.log(`  Or paste this URI if your app supports "add from URI":\n  ${totpUri(email, totpSecret)}\n`);
  console.log(`Log in at /admin/login with ${email} and the password you just chose.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
