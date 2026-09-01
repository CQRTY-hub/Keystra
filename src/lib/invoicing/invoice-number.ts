import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Gap-free sequential numbering (PLAN.md, Phase 3.6: "no gaps... a gap
 * in the sequence is a bookkeeping problem"). A plain auto-increment
 * column doesn't guarantee this — Postgres burns a value whenever the
 * transaction that would have used it rolls back. This instead reads and
 * increments a single counter row inside the same transaction that
 * creates the Invoice row (see index.ts), so the number is only ever
 * consumed if the invoice it belongs to actually gets written.
 *
 * Runs inside the caller's transaction — takes a `tx` (the transaction
 * client Prisma hands to `$transaction(async (tx) => ...)`), never the
 * top-level `prisma` client, or the read-increment-write below wouldn't
 * be atomic against a concurrent call.
 */
export async function nextInvoiceNumber(
  tx: Prisma.TransactionClient
): Promise<number> {
  const counter = await tx.invoiceCounter.upsert({
    where: { id: 1 },
    create: { id: 1, nextNumber: 2 },
    update: { nextNumber: { increment: 1 } },
  });
  // On the very first call ever, upsert's `create` branch already wrote
  // nextNumber: 2 and this order gets number 1. On every later call,
  // `update` returns the row *after* incrementing — so the number this
  // invoice gets is one less than what's now stored.
  return counter.nextNumber - 1;
}
