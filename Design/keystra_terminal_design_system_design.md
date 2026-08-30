# Keystra Terminal Design System

## Visual Identity
A high-density, immersive gaming portal aesthetic inspired by modern terminal interfaces.

## Colors
The palette is built on a "Terminal Dark" foundation with high-contrast functional accents.

### Surface & Background
- **Surface**: `#121317` (Deep charcoal base)
- **Surface Dim**: `#121317`
- **Surface Bright**: `#38393e`
- **Container Lowest**: `#0d0e12`
- **Container Low**: `#1a1b20`
- **Container**: `#212226`
- **Container High**: `#2b2c31`
- **Container Highest**: `#36373c`

### Brand & Accents
- **Primary**: `#66fcf1` (Electric Cyan)
- **Secondary**: `#45a29e` (Muted Teal)
- **Outline**: `#1f2833`
- **Outline Variant**: `#0b0c10`

### Text on dark surfaces (gap-fill, not in the Stitch export)
The export defines no on-surface / body-text color at all — only the primary
button's own text (`#0b0c10` on cyan). **On Surface**: `#E6E7EA` (corrected
by the storefront owner, 2026-08-23 — pure white on the near-black
`#121317` surface causes edge vibration/halation over longer runs of text;
this off-white sits close enough to white to still read as body text but
without that effect).

### Semantic — Error (corrected by the storefront owner, 2026-08-23)
Not in the Stitch export, and not Tailwind's default red — that read as too
bright and too saturated against this palette. **Error**: `#B3564C` (a
muted, darkened brick red — desaturated enough to sit quietly next to the
cyan/teal accents instead of competing with them, but still unambiguously
"red" for form validation and other error states). This is a semantic
color, separate from Primary/Secondary — it never substitutes for either
and neither substitutes for it.

### Primary cyan — usage rule (revised, storefront owner, 2026-08-24)
Widened from the first version of this rule (2026-08-23), which read as too
strict — cyan is an **attention color**, not only a transaction color. It's
now sanctioned for six specific things:

1. The one accent word/line in a hero headline (not the whole headline).
2. The primary call-to-action of a screen — a real buy action (add to cart,
   checkout submit, pay) **or**, on a page with no buy action of its own
   (e.g. the homepage), that page's one primary forward action (e.g.
   "Browse the full range").
3. Section icons (a small glyph next to a section heading, e.g. "Trending
   Now").
4. Usernames inside an activity/social-proof module (e.g. "Recent Items").
5. An active filter's indicator (the filter is currently applied).
6. The one recurring status indicator — the in-stock dot on a product card.

It still does **not** appear on plain links, plain labels, plain body text,
borders, icon-button hover states, or tag backgrounds — those stay
**Secondary** `#45a29e`. The boundary that matters isn't "only money" any
more, it's "only where the eye should land first" — spread across a whole
page's worth of ordinary text and it still reads as neon and stops meaning
anything.

## Typography (Inter)
High-density scale optimized for readability in compact layouts.

- **Display**: 36px / 42px (Bold) — addition, storefront owner, 2026-08-24. Not in the Stitch export, which topped out at Headline MD. Added for one job only: a page's hero headline, which needs more weight than this otherwise-dense, compact scale gives it. At most once per page; every other heading stays Headline MD or smaller.
- **Headline MD**: 24px / 32px (Bold)
- **Title SM**: 14px / 20px (Medium)
- **Body MD**: 14px / 20px (Regular)
- **Label Caps**: 10px / 16px (Bold, Uppercase)

## Spacing & Radii
- **Margin Container**: 24px
- **Gutter**: 16px
- **Roundness**: `ROUND_FOUR` (4px radius for all components)

## Component Specifications

### Buttons
- **Primary**: Background `#66fcf1`, Text `#0b0c10`, 4px radius. A screen's one buy action, or — where there isn't one — its one primary forward action. See the usage rule above; still not every button that happens to submit a form.
- **Secondary**: Container background, `#45a29e` border and text. Everything else (search, ordinary navigation, "view all" links styled as buttons).
- **Icon Button**: Ghost style, `#45a29e` hover state (corrected — was `#66fcf1` in the original export; icon buttons aren't the buy action).
- **Interaction**: Scale 95% on active, smooth opacity transitions.

### Cards
- **Product Card**: Surface-container background, 1px border (`#1f2833`), subtle hover translation.
- **Content Density**: Compact padding (12px), stacked layout.
- **Product image (addition, storefront owner, 2026-08-23)**: fixed 1:1 aspect-ratio frame, `object-fit: cover`, `#1a1b20` (Container Low) fill behind the image, same 4px radius and `#1f2833` border as the card. Supplier boxart arrives in inconsistent aspect ratios and quality — every card gets the same frame regardless of what the image itself looks like, so the grid stays uniform even when the art doesn't. Until a real image exists for a product, the frame renders as its Container Low fill with the category name centered in Label Caps — never a stretched or invented placeholder photo.

### Inputs
- **Search Bar**: Deep surface background (`#0d0e12`), subtle border, placeholder text in `#45a29e`.

### Labels & Badges
- **Tag Label**: Small uppercase text, `#45a29e` text on Container background (corrected — was a `#66fcf1/10` cyan tint in the original export), 2px radius.
- **Status Indicator**: One recurring indicator, the in-stock dot on a product card, in `#66fcf1` (corrected — was plural "Status Indicators" for both "New" and "Live" states in the original export; only this one keeps cyan). Any other state (e.g. a "New" tag) uses the Tag Label style above, not cyan.
- **Cart item-count badge** (addition, storefront owner, 2026-08-24): small circular badge on the header's cart icon, `#45a29e` background, Container Lowest text, Label Caps. Kept to Secondary rather than added as a seventh cyan use — it's a passive count, not one of the six things the cyan usage rule names. Worth revisiting if it turns out to need more visual weight in practice.

### Page title band (addition, storefront owner, 2026-08-24)
Every page except the homepage opens with this instead of a bare `<h1>` —
`src/components/PageTitleBand.tsx`. Same background as the homepage hero
(the abstract dark art, `HomeHeroArt`), same container treatment
(`rounded-keystra`, `#1f2833` border), at a fraction of the height: `24px`
horizontal / `20px` vertical padding, versus the hero's `32–40px`. Holds
that page's one `<h1>` in Headline MD — never Display, that stays the
homepage hero's alone — and optionally one small element beside it (e.g. a
language toggle). This is the one element meant to recur on literally
every non-homepage page, so a new page gets it by wrapping its title in
`<PageTitleBand>` the same way every other page does, rather than
rendering its own `<h1>`.

### Ambient background layer — animation-ready structure (addition, storefront owner, 2026-08-24)
The dark gradient behind both the homepage hero and every page title band —
`src/components/HomeHeroArt.tsx` — is built as its **own layer**, not a
background painted onto whatever container holds the text. This is a
deliberate structural commitment ahead of Phase 2's "Animated banners"
(PLAN.md), made now so that work can slot in later without rebuilding
either component. **Nothing here is animated yet — no motion, no animation
library.** The commitment is the shape of the code, not its behavior.

The contract, at both call sites (the hero in `src/app/page.tsx`, and
`PageTitleBand`):

- An outer container: `position: relative`, `overflow-hidden`, the
  `rounded-keystra` / `#1f2833` border.
- `HomeHeroArt` as its first child: `position: absolute; inset: 0`,
  `aria-hidden`, stacked at `z-0`.
- The actual content (heading, subtext, button) as a sibling right after
  it, in its own wrapper: `position: relative`, stacked at `z-10`.

That z-0 / z-10 split is the seam Phase 2 animates against — a transform,
opacity, or background-position change on `HomeHeroArt` itself, never on
the shared outer container, so motion can never reflow or visually
disturb the text sitting on top of it. It also means the hero and the
bands can end up animated differently (PLAN.md: bands get less movement
than the hero, or none) without duplicating the component — that's a prop
or a variant on `HomeHeroArt` when Phase 2 actually gets there, not
something to build now.

One current limitation, noted for whoever picks Phase 2 up: today's art is
a single flat `background-image` (two radial gradients plus a repeating
hairline pattern combined into one layer) — enough for animating the
layer as a whole (a drift, a shimmer, a slow background-position loop),
but PLAN.md's "layered shapes" parallax option would need the gradients
split into separate child layers first. Not done now — flagged so it's an
informed decision later, not a rebuild surprise.

### Activity module (addition, storefront owner, 2026-08-24)
A "recent purchases" panel (name in `#66fcf1`, per the usage rule; item
purchased and timestamp in `#45a29e`, Body MD / Label Caps). **Placeholder
data only as of this addition** — there is no real order-activity feed
behind it yet. Must not ship to a real launch with invented names before
it's wired to real, anonymized order data or removed; see the homepage
implementation comment for the same flag.
