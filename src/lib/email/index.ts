import type { EmailProvider } from "./types";
import { MockEmailProvider } from "./mock-provider";

export type { EmailProvider, EmailMessage, EmailTemplate, EmailSendResult } from "./types";

/**
 * Same env-driven selection pattern as fulfillment. Only "mock" exists
 * this phase — real providers (Resend/Postmark) arrive in Phase 3.6.
 */
export function getEmailProvider(): EmailProvider {
  const selected = process.env.EMAIL_PROVIDER ?? "mock";

  switch (selected) {
    case "mock":
      return new MockEmailProvider();
    default:
      throw new Error(
        `Unknown EMAIL_PROVIDER "${selected}". Only "mock" is implemented so far.`
      );
  }
}
