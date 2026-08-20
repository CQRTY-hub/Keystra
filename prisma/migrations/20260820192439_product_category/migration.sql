-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('game_key', 'gift_card', 'top_up');

-- AlterTable
-- Temporary default so the 8 existing (dev/QA-only) rows get a value —
-- prisma:seed immediately backfills the real per-product category via
-- upsert right after this migration runs. No real orders exist against
-- this dev database; see CLAUDE.md's carve-out for exactly this case.
ALTER TABLE "Product" ADD COLUMN "category" "ProductCategory" NOT NULL DEFAULT 'game_key';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "platform";

-- AlterTable
-- Drop the temporary default — every future insert must specify a
-- category explicitly, matching the Prisma schema (no @default there).
ALTER TABLE "Product" ALTER COLUMN "category" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");
