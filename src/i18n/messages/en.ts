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
    titleDefault: "Keystra",
    titleTemplate: "%s — Keystra",
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
    home: "Keystra",
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
    adminLogin: "Admin login",
    adminVerify: "Verify",
    admin: "Admin",
    adminOrders: "Orders",
    adminProducts: "Products",
    adminKillSwitch: "Kill switch",
    adminPricing: "Pricing rule",
  },

  languageToggle: {
    ariaLabel: "Language",
  },

  nav: {
    brand: "Keystra",
    skipToContent: "Skip to content",
    mainNavigation: "Main navigation",
    shop: "Shop",
    cart: "Cart",
    cartWithCount: (count: number) => `Cart, ${count} item${count === 1 ? "" : "s"}`,
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
    // Hero headline is two separately-styled runs, not one string — the
    // second one is DESIGN.md's "one accent word/line" in cyan. The
    // Stitch reference's own slogan, restored at the storefront owner's
    // request (2026-08-24) — it reads as excited relative to PRODUCT.md's
    // documented calm/direct voice, flagged once; kept as the owner's
    // deliberate call, not a default.
    heroLine: "Unlock your next",
    heroAccent: "adventure",
    heroSubtext:
      "Bought from one distributor and sold directly by Keystra — never a marketplace listing from someone else.",
    redeemsOn: "Redeems on",
    trendingNow: "Trending now",
    viewAll: "View all",
    // Placeholder-only — see DESIGN.md "Activity module". Not a claim of
    // real, live sales data; must become real order activity (or be
    // removed) before a real launch.
    recentActivityTitle: "Recent activity",
    recentActivityPurchased: (product: string) => `Purchased ${product}`,
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
    inStock: "In stock",
    redemptionTitle: "Redemption instructions",
    redemptionBody:
      "You'll get your key on this page and by email right after payment.",
    howToRedeem: "How to redeem this",
    regionTitle: "Region and delivery",
    regionBody: (region: string) =>
      `This item is region-locked to ${region}. Delivery is electronic, right after payment is confirmed.`,
    withdrawalLinkLabel: "Right of withdrawal & refunds",
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
    orderSummaryTitle: "What you're ordering",
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
    // Its own label + copy button, same treatment as the key — this is
    // deliberately not folded into one sentence with the status. That
    // used to read as plain text with nothing to copy, and the key's
    // bordered box + copy button made the KEY look like "the code to
    // save" instead. A customer typed the key into order lookup's
    // "Order number" field because of exactly that visual mix-up.
    orderNumberLabel: "Order number",
    statusLabel: (status: string) => `Status: ${status}`,
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
    orderIdHint:
      "Not the key — the order number is on your confirmation page and in your confirmation email.",
    email: "Email address",
    notFound: "No order found with that combination.",
    search: "Search",
    searching: "Searching…",
  },

  copyButton: {
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
    entityLabel: "Trade name",
    traderLabel: "Legal name",
    emailLabel: "Email",
    responseTimeLabel: "Response time",
    responseTimeValue: (days: number) =>
      `We aim to reply within ${days} business days. [TE BEVESTIGEN DOOR JURIST: is a stated response time an acceptable stand-in for a phone number under Belgian consumer-information law for a one-person business with no call desk?]`,
    companyNumberLabel: "Company registration number",
    vatNumberLabel: "VAT number",
    addressLabel: "Address",
    toFollow: "To follow.",
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

  // Phase 3.5 admin panel. Same catalog as the rest of the site — this
  // isn't customer-facing, but "no component reads a hardcoded string"
  // never had a backstage exception.
  admin: {
    wordmark: "Keystra Admin",
    login: {
      title: "Admin login",
      intro: "Single admin account. Two-factor required.",
      email: "Email address",
      password: "Password",
      submit: "Continue",
      submitting: "Checking…",
    },
    verify: {
      title: "Enter your code",
      intro: "6-digit code from your authenticator app.",
      code: "Code",
      submit: "Verify",
      submitting: "Verifying…",
    },
    dashboard: {
      title: "Admin",
      loggedInAs: (email: string) => `Logged in as ${email}.`,
      logout: "Log out",
      nav: {
        orders: "Orders",
        products: "Products",
        killSwitch: "Kill switch",
        pricing: "Pricing",
      },
      balance: {
        title: "Supplier balance",
        mockProvider: "Not applicable — the mock fulfilment provider is active, not CodesWholesale.",
        error: "Could not reach the supplier to check the balance.",
        low: (amount: string) => `Low: ${amount} left.`,
        ok: (amount: string) => `${amount} available.`,
        noThreshold: "No low-balance threshold set yet — see the kill switch page.",
      },
    },
    orders: {
      title: "Orders",
      filterLabel: "Status",
      filterAll: "All statuses",
      filterFrom: "From",
      filterTo: "To",
      applyFilters: "Filter",
      columnId: "Order",
      columnEmail: "Email",
      columnTotal: "Total",
      columnStatus: "Status",
      columnDate: "Placed",
      noResults: "No orders match this filter.",
      view: "View",
      detailTitle: (id: string) => `Order ${id}`,
      backToList: "Back to orders",
      itemsTitle: "Items",
      riskTitle: "Risk check",
      riskScore: "Risk score",
      riskThreshold: (threshold: number) => `threshold ${threshold}`,
      riskCheckFailed: "Risk check failed",
      holdReason: "Hold reason",
      holdReasonText: (reason: string) =>
        reason === "high_risk_score"
          ? "High risk score"
          : reason === "risk_check_failed"
            ? "Risk check failed (fail closed)"
            : reason === "fulfilment_failed"
              ? "Fulfilment failed"
              : reason,
      eventLogTitle: "Event log",
      noEvents: "No events recorded for this order yet.",
      resolveTitle: "This order is held — resolve it",
      resolveNote: "Note (optional)",
      retry: "Retry fulfilment",
      refund: "Refund and close",
      resolveHint:
        "Retry sends it back through fulfilment (for a transient problem, e.g. a supplier timeout). Refund closes the order without delivering a key. Neither issues a real refund yet — Mollie isn't wired up for that (Phase 3.6/3.8); this only records the decision and moves the order's status.",
    },
    products: {
      title: "Products",
      columnTitle: "Product",
      columnCategory: "Category",
      columnRegion: "Region",
      columnCost: "Cost",
      columnPrice: "Price",
      columnMargin: "Margin",
      columnActive: "Active",
      costUnknown: "Unknown",
      refreshCost: "Refresh cost",
      activate: "Activate",
      deactivate: "Pause",
      noProducts: "No products yet.",
      costAsOf: (date: string) => `as of ${date}`,
    },
    killSwitch: {
      title: "Kill switch",
      intro:
        "Three levels, per PLAN.md — none of them require a deploy, in-flight orders are never abandoned, and order lookup keeps working at every level.",
      level1Title: "Level 1 — Pause one product",
      level1Body: "Use the active toggle on the Products page for the specific title that's broken. Everything else keeps selling.",
      level1Link: "Go to products",
      level2Title: "Level 2 — Pause checkout",
      level2Body:
        "The shop stays browsable and product pages still load, but no new orders can be placed. This is the one you'll use most.",
      level2CurrentlyOpen: "Checkout is open.",
      level2CurrentlyPaused: (by: string, at: string) => `Paused by ${by} at ${at}.`,
      level2Pause: "Pause checkout",
      level2Resume: "Resume checkout",
      level3Title: "Level 3 — Full maintenance",
      level3Body:
        "The whole site goes behind a notice. Reserve this for a security problem — a dark site costs trust a paused checkout doesn't. Order lookup and key retrieval keep working even at this level.",
      level3CurrentlyOff: "Maintenance mode is off.",
      level3CurrentlyOn: (by: string, at: string) => `Enabled by ${by} at ${at}.`,
      level3Enable: "Enable maintenance mode",
      level3Disable: "Disable maintenance mode",
      reasonLabel: "Reason (recorded in the event log)",
      balanceThresholdTitle: "Low-balance warning threshold",
      balanceThresholdLabel: "Warn when supplier balance drops below (€)",
      balanceThresholdSave: "Save threshold",
    },
    pricing: {
      title: "Pricing rule",
      notAppliedWarning:
        "Not applied yet. Saving these values only stores them — nothing repricing anything reads them until the repricing run itself is built. No product's price changes because of this screen.",
      marginMultiplierLabel: "Margin multiplier (e.g. 1.35 = cost + 35%)",
      minAbsoluteMarginLabel: "Minimum absolute margin (€)",
      priceFloorLabel: "Price floor (€)",
      roundingStyleLabel: "Rounding style (e.g. end_99)",
      save: "Save",
      savedAt: (date: string) => `Last saved ${date}.`,
      neverSaved: "Never saved.",
    },
    errors: {
      invalidCredentials: "Invalid email or password.",
      invalidCode: "Invalid code.",
      challengeExpired: "Your session expired. Log in again.",
      accountLocked: (minutes: number) =>
        `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      accountLockedNoTime: "Too many failed attempts. Try again later.",
      ipThrottled: "Too many attempts from this connection. Try again later.",
      unexpected: "Something went wrong. Please try again.",
    },
  },
} as const;

export default en;
export type Messages = typeof en;
