import type { ProductCategory } from "@prisma/client";

export type { ProductCategory };

export interface ProductSummary {
  /** Internal DB id — used in page URLs. */
  id: string;
  /** The supplier's own product ID. Never match a product by title. */
  supplierProductId: string;
  title: string;
  category: ProductCategory;
  region: string;
  priceCents: number;
  active: boolean;
}
