-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "costCentsSnapshot" INTEGER,
ADD COLUMN     "costSnapshotAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ShopSettings" ADD COLUMN     "lowBalanceThresholdCents" INTEGER,
ADD COLUMN     "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maintenanceModeEnabledAt" TIMESTAMP(3),
ADD COLUMN     "maintenanceModeEnabledBy" TEXT,
ADD COLUMN     "maintenanceModeReason" TEXT;

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "marginMultiplier" DOUBLE PRECISION,
    "minAbsoluteMarginCents" INTEGER,
    "priceFloorCents" INTEGER,
    "roundingStyle" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);
