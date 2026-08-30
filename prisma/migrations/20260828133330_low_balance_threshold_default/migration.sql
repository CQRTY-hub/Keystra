-- AlterTable
ALTER TABLE "ShopSettings" ALTER COLUMN "lowBalanceThresholdCents" SET DEFAULT 5000;

-- Backfill: a column default only applies to rows inserted after this
-- migration runs. ShopSettings is a singleton (id=1) already seeded
-- before this migration existed, so without this UPDATE the live row
-- would stay NULL — "no threshold configured" — even though the owner
-- explicitly asked for a €50 (5000 cent) default (2026-08-27). Only
-- touches rows that haven't had a threshold set by hand; an admin who
-- already chose a different value on /admin/kill-switch keeps it.
UPDATE "ShopSettings" SET "lowBalanceThresholdCents" = 5000 WHERE "lowBalanceThresholdCents" IS NULL;
