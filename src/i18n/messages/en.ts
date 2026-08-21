/**
 * The one message catalog. English only for now (PLAN.md, "Product scope
 * and launch decisions": "Language: English only at launch... build
 * translation-ready from day one"). No component reads a hardcoded
 * string — everything visible to a shopper comes through here, via
 * `getMessages()` in `src/i18n/index.ts`.
 *
 * Adding a second language later means writing a sibling file with this
 * exact shape (TypeScript will point out anything missing) and
 * registering it in `src/i18n/index.ts` — not touching any component.
 *
 * Long-form legal and redemption-guide content is deliberately NOT here
 * — see src/i18n/legal/ and src/i18n/guides/. PLAN.md is explicit that
 * legal content needs to be separate content per language, not strings
 * mixed into general UI copy.
 */
const en = {
  site: {
    titleDefault: "Storefront (working title)",
    titleTemplate: "%s — Storefront (working title)",
    description: "Digital game keys, gift cards and top-up codes.",
  },

  // <title>/metadata strings. Separate from the rest since they're read
  // at module scope in a page's `export const metadata`, not inside a
  // component body — but still shown to a shopper (browser tab, search
  // results, shared links), so they go through the catalog like
  // everything else. Guide page titles aren't here — they come from
  // their own content module (src/i18n/guides/*.en.ts) since the title
  // IS the guide's own heading.
  pageTitles: {
    home: "Storefront (working title)",
    shop: "Shop",
    checkout: "Checkout",
    mockPayment: "Mock payment",
    paymentFailed: "Payment failed",
    orderConfirmed: "Order confirmed",
    trackOrder: "Track your order",
    cookiePreferences: "Cookie preferences",
    guidesIndex: "Redemption guides",
    faq: "FAQ",
    about: "About",
    contact: "Contact",
    terms: "Terms and conditions",
    privacy: "Privacy policy",
    refundPolicy: "Refund policy",
    withdrawalWaiver: "Withdrawal waiver",
    maintenance: "Maintenance",
  },

  languageToggle: {
    ariaLabel: "Language",
  },

  nav: {
    brand: "Storefront (working title)",
    skipToContent: "Skip to content",
    mainNavigation: "Main navigation",
    shop: "Shop",
    cart: "Cart",
    orderLookup: "Track order",
  },

  footer: {
    terms: "Terms",
    privacy: "Privacy",
    refundPolicy: "Refund policy",
    contact: "Contact",
    faq: "FAQ",
    about: "About",
    guides: "Redemption guides",
    cookiePreferences: "Cookie preferences",
  },

  category: {
    game_key: "Game key",
    gift_card: "Gift card",
    top_up: "Top-up",
  },

  home: {
    title: "Digital game keys, gift cards & top-ups",
    intro: "Delivered instantly after payment.",
    browseFullRange: "Browse the full range",
    featured: "Featured",
  },

  shop: {
    title: "Shop",
    filtersLabel: "Filters",
    searchLabel: "Search",
    searchPlaceholder: "Search products…",
    searchButton: "Search",
    categoryLabel: "Category",
    categoryAll: "All categories",
    regionLabel: "Region",
    regionAll: "All regions",
    filterButton: "Filter",
    noResults: "No products found.",
  },

  product: {
    addToCart: "Add to cart",
    addedToCart: "Added to cart.",
    redemptionTitle: "Redemption instructions",
    redemptionBody:
      "You'll get your key on this page and by email right after payment.",
    howToRedeem: "How to redeem this",
    regionTitle: "Region and delivery",
    regionBody: (region: string) =>
      `This item is region-locked to ${region}. Delivery is electronic, right after payment is confirmed.`,
  },

  cart: {
    title: "Cart",
    empty: "Your cart is empty.",
    tableCaption: "Your cart contents",
    productHeader: "Product",
    quantityHeader: "Quantity",
    priceHeader: "Price",
    removeHeader: "Remove",
    quantityLabelFor: (title: string) => `Quantity for ${title}`,
    remove: "Remove",
    total: (amount: string) => `Total: ${amount}`,
    goToCheckout: "Go to checkout",
  },

  checkout: {
    title: "Checkout",
    email: "Email address",
    termsPrefix: "I agree to the ",
    termsLink: "terms and conditions",
    termsSuffix: ".",
    readInDutch: "Read in Dutch",
    total: (amount: string) => `Total: ${amount}`,
    submit: "Order with obligation to pay",
    submitting: "Processing…",
    genericError: "Something went wrong. Please try again.",
    connectionError: "Could not connect. Please try again.",
    emptyCart: "Your cart is empty.",
    staleItemsRemoved:
      "One or more items in your cart are no longer available and were removed. Please review your cart and try again.",
  },

  killSwitch: {
    title: "Checkout is temporarily paused.",
    bodyPrefix: "We'll be back shortly. Orders already placed remain available via ",
    lookupLink: "order lookup",
    bodySuffix: ".",
  },

  mockPayment: {
    title: "Mock payment page",
    body: "This stands in for the real Mollie payment page, which gets connected in Phase 3. No real money is involved.",
    pay: "Pay (mock)",
    paying: "Processing…",
    cancel: "Cancel payment (mock)",
    error: "Something went wrong simulating the payment.",
  },

  paymentFailed: {
    title: "Payment failed or cancelled",
    body: "Your payment didn't go through, or you cancelled it. Nothing was charged, and your order was not placed.",
    retry: "Try again",
    backToCart: "Back to cart",
  },

  confirmation: {
    title: "Thank you for your order",
    orderStatus: (id: string, status: string) => `Order ${id} — status: ${status}`,
    heldBody: (email: string) =>
      `Something went wrong delivering your key. We're looking into it personally and will reach out at ${email}.`,
    awaitingCodeBody: (email: string) =>
      `Your payment is confirmed and your key is reserved. It's not available from the supplier just yet — we'll send it to ${email} as soon as it arrives.`,
    completedEmailedTo: (email: string) => `We've also emailed your key to ${email}.`,
    processing:
      "We're processing your order. This page will show your key as soon as it's ready.",
    keyImageAlt: (title: string) => `Key for ${title}`,
  },

  orderLookup: {
    title: "Track your order",
    intro: "Enter your order number and email address. No account needed.",
    orderId: "Order number",
    email: "Email address",
    notFound: "No order found with that combination.",
    search: "Search",
    searching: "Searching…",
  },

  copyKey: {
    copy: "Copy",
    copied: "Copied!",
    srSuffix: " to clipboard",
  },

  cookieConsent: {
    dialogLabel: "Cookie preferences",
    body: "We only use cookies that are necessary to run the shop, unless you agree to more below.",
    reject: "Reject",
    accept: "Accept",
  },

  cookiePreferencesPage: {
    title: "Cookie preferences",
    intro:
      "Change your mind any time. Withdrawing consent is exactly as easy as giving it.",
    currentStatusLabel: "Current status",
    statusAccepted: "Accepted — non-essential cookies allowed",
    statusRejected: "Rejected — only necessary cookies",
    statusNotSet: "Not yet set",
    acceptButton: "Accept non-essential cookies",
    rejectButton: "Reject non-essential cookies",
    saved: "Saved.",
  },

  guidesIndex: {
    title: "Redemption guides",
    intro: "How to activate what you bought, for every product category we sell.",
  },

  faq: {
    title: "Frequently asked questions",
  },

  about: {
    title: "About",
  },

  contact: {
    title: "Contact",
  },

  terms: {
    title: "Terms and conditions",
    versionLabel: "Version",
  },

  privacy: {
    title: "Privacy policy",
  },

  refundPolicy: {
    title: "Refund policy",
  },

  notFound: {
    title: "Page not found",
    body: "The page you're looking for doesn't exist, or has moved.",
    backToShop: "Back to shop",
  },

  serverError: {
    title: "Something went wrong",
    body: "That's on us, not you. Please try again — if it keeps happening, let us know via the contact page.",
    retry: "Try again",
  },

  api: {
    checkout: {
      invalidRequest: "Invalid request.",
      paused: "Checkout is temporarily paused.",
      productsUnavailable: "One or more products are no longer available.",
      productOutOfStock: (title: string) => `"${title}" is out of stock.`,
      orderDescription: (orderId: string) => `Order ${orderId}`,
    },
  },

  maintenance: {
    title: "Down for maintenance",
    body: "We're offline briefly for a security or technical issue. Already-placed orders and keys remain available.",
    lookupLink: "Track an order",
  },
} as const;

export default en;
export type Messages = typeof en;
