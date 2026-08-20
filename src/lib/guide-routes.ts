import type { ProductCategory } from "@/types/product";

/**
 * The one place mapping a product category to its redemption guide.
 * PLAN.md: "Linkable from every product page" — this is what makes that
 * a one-line lookup instead of a switch statement repeated per page.
 */
export const GUIDE_ROUTES: Record<ProductCategory, string> = {
  game_key: "/guides/steam-keys",
  gift_card: "/guides/gift-cards",
  top_up: "/guides/top-up-codes",
};
