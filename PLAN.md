# Storefront — full build plan (plumbing + design)

This replaces the earlier Phase 1 prompt. Same build, with the design layer folded in.

Read Phase 0 and do it yourself. Phase 1, 1.5 and 2 contain blocks you paste into
Claude Code verbatim — they're marked `PASTE THIS`.

---

## Phase 0 — Setup evening (you, not Claude)

Nothing below works until these five exist. Roughly one evening.

1. **Node.js 22.12 or newer** — nodejs.org, LTS installer. Impeccable requires 22.12+;
   older versions will fail the install. Verify in a terminal: `node -v`
2. **Git** — git-scm.com. Verify: `git -v`
3. **GitHub account** — free. This is what gives Claude access to your code.
4. **Claude Code** — install per claude.com/product/claude-code, sign in with your
   existing Claude account.
5. **An empty project folder** on your PC, e.g. `C:\projects\storefront`. Open a
   terminal in it and run `git init`.

Do **not** create Supabase, Mollie, Vercel or Sentry accounts yet. Claude Code will
walk you through each one at the moment it's actually needed.

**One thing worth doing early:** buy the domain, once the brand name is settled. Email
deliverability improves with domain age, and you'll want DNS access ready when the
transactional email setup arrives in Phase 3.6.

---

## How to run this — looping vs checkpointing

Claude Code can work autonomously for long stretches, but a loop is only safe where it has
an automatic way to know it succeeded. Structure the work so that's true where possible,
and accept manual checkpoints where it isn't.

### Two files that make every session start smart

Put both in the repo root, in Phase 1, before anything else:

- **`PLAN.md`** — this document. Every session then has the full context: the decisions
  already made, what's deliberately excluded, and why.
- **`CLAUDE.md`** — the standing rules, kept short so they're always followed: never match
  products by title, never show a key before it's persisted, never edit `.env`, never
  deploy without being asked, stop and ask before anything destructive or anything that
  costs money, explain changes in plain language.

Without these, every new session re-litigates decisions that took this whole conversation
to reach.

### Loop these

Anything with a pass/fail signal a machine can check:

- **Test-driven work — the best case.** Write the tests first (order state machine,
  fulfilment failures, webhook idempotency, discount and VAT calculation), then let it loop
  until green. These are the parts that lose money when wrong, which is exactly why they
  deserve the strictest signal.
- Scaffolding, boilerplate, repetitive CRUD pages
- Type errors, lint, dependency updates
- Applying a settled design system to the remaining pages, once one page is approved

Practical settings: run with edits auto-accepted rather than full bypass, cap the run with
`--max-turns` so a confused loop stops instead of spiralling, and pre-approve only the
narrow commands the task needs (`--allowedTools "Edit,Bash(npm test)"`) rather than opening
up the shell.

### Never loop these

- **The design pass.** Taste is the input; I am the loop.
- **Legal wording.** Terms, privacy, refund policy.
- **Anything touching live credentials, real payments, or the live supplier account.**
- **Security decisions** — what's exposed, what's encrypted, what's public.
- **The first run against the real supplier.** Watch every call.

### Guardrails that make more autonomy safe

- Do **not** use `bypassPermissions` / `--dangerously-skip-permissions` on this repo. It
  grants full unattended system access, and this repo holds credentials that spend real
  money.
- Add `PreToolUse` hooks that hard-block: edits to `.env*`, force pushes, deploy commands,
  and any write to the live database.
- Never let a loop run against production. Sandbox and local only.
- Git commit before starting any long autonomous run, so reverting is one command.
- Review the diff before merging. Even where I can't judge every line, I can see the
  shape — and anything touching keys, money or auth gets read properly.

### Mobile is the primary device, not a variant

Traffic will come from TikTok and Instagram, so most buyers arrive on a phone. Design and
review every page at phone width first, then widen. A layout that works on a laptop and
"also works" on mobile is backwards for this shop.

Non-negotiable on small screens:

- **The key on the confirmation page must have a copy button.** A long key string on a
  narrow screen overflows or wraps badly, and selecting text with a thumb is close to
  impossible. This is the most important moment in the entire transaction — it cannot be
  fiddly. Same on the order lookup result.
- **Tap targets at least 44px**, especially the terms and withdrawal-waiver checkboxes.
  A consent checkbox that's hard to hit is a consent checkbox people mis-tap.
- **Correct keyboards on inputs** — `type="email"` for the email field, numeric where
  numeric.
- **Sticky buy bar** on product pages (already in Phase 3.7).
- **Nothing horizontally scrollable.** Long keys, order numbers and prices all have to fit
  or wrap deliberately.
- Test on a real phone, not just the browser's device simulator. Vercel preview URLs open
  on a phone — use them.

Tablet needs no separate design; it falls out of doing phone and desktop properly.

### Deliberately not using an agent orchestration harness

Ruflo (formerly Claude Flow) and similar swarm/meta-harness frameworks are **out of scope
for this project**, decided rather than overlooked. Reasons, so nobody reopens it:

- They write their own `CLAUDE.md` and `.claude/` config into the workspace, fighting the
  standing-rules file that keeps this build safe.
- They solve agent coordination throughput. My constraint is my own review capacity, which
  is fixed — multiplying output makes payments code less safe, not more.
- Heavy churn on a dependency the business would sit on top of.
- Nothing they offer covers a gap here: Dependabot and Strix cover security, Prisma covers
  migrations, Sentry covers observability.

Revisit only once the shop is live and boring. A harness is a reasonable thing to add to a
working system and a bad thing to build a first one inside.

### The honest limit

I'm not a developer, so an unattended overnight run on a payments codebase means waking up
to changes I can't fully evaluate. Loops are for the parts where a test says "correct."
Everywhere else, the checkpoint isn't friction — it's the only review this project gets.

---

## Phase 0.5 — Supplier facts (mostly answered from the docs)

The public CodesWholesale documentation answers most of what we needed. Below is what the
API actually does, then the short list still to confirm with support. Verify everything in
the *current* docs and in the sandbox — some of what follows comes from older published
versions, and **the API is now v3 — v1 and v2 are no longer available.**

### What we know

**Auth.** OAuth 2.0 client credentials grant. You POST `grant_type=client_credentials` with
your client ID and secret and get a bearer token with an `expires_in`. Store the token in
the database (not in session) and refresh it when it expires. Two separate environments:
`sandbox.codeswholesale.com` and `api.codeswholesale.com`. Build and test entirely against
sandbox.

**Product identity.** `productId` is a UUID, stable, and separate from the human-readable
name and `identifier`. This confirms the rule already in the Phase 1 prompt: everything is
built against the UUID, never against the title. Your wrong-key problem was almost certainly
title matching, and this is what kills it.

**Product data** includes platform, regions (array), languages, images, and a live
`quantity` for stock.

**Pricing is tiered by quantity.** Products carry price bands (`from` / `to` / `value`) —
buying one costs more per unit than buying ten. This matters for the pricing rule in
Phase 3.5: the cost basis is not a single number, so decide which band the margin rule
computes against. Use the band you actually buy at, which for one-key-at-a-time
fulfilment is the top band.

**Three code types come back, and only one is a plain key:**
- `CODE_TEXT` — a normal text key.
- `CODE_IMAGE` — the key is an image, delivered Base64-encoded with a `fileName`. The
  storefront needs a real image delivery path, not a text field.
- `CODE_PREORDER` — **the order succeeded but there is no code yet.** You get a link to
  retrieve the code later. Money taken, order valid, key arrives afterwards.

That third one is why the order state machine has an `awaiting_code` state. It is not an
error and must not be handled as one.

**Decision: no preorders at launch.** Preorder behaviour is switchable per product, and it
stays off. Out-of-stock titles are simply not sold. The `awaiting_code` path still gets
built and tested, because a preorder code type can appear if a product's status changes
between listing and ordering — but nothing is deliberately sold that can't be delivered
immediately. Revisit only once the shop has a track record.

**Balance and low-balance alerts.** Account details expose the current balance including
credit. There's a low-balance notification when credit drops below a threshold you set, and
the balance check runs on every fulfilment. Wire that alert to yourself before launch —
running dry mid-day is a silent outage.

**No postbacks in the v3 API — correction.** Earlier notes assumed a postback URL for
product changes. The published v3 endpoint list contains no webhook or postback endpoint;
that appears to be a feature of their shop plugins, not the API. **Catalogue sync is
polling**, exactly as support described: `GET /v3/products` with `updatedSince`, on a
schedule. Design for that, not for push.

**Endpoints worth using that weren't in the earlier notes:**

- `GET /v3/orders/{orderId}/invoice` — the supplier invoice per order, programmatically.
  Pull it automatically on every order and file it; that's my purchase-side bookkeeping
  handled without downloading anything by hand.
- `GET /v3/codes/{codeId}` — fetch an ordered code separately. This is the retrieval path
  for a code that wasn't available at order time.
- `GET /v3/platforms`, `/v3/regions`, `/v3/territory`, `/v3/languages` — reference data.
  **The shop's platform and region filters should be built from these, cached locally, not
  hardcoded.** Hardcoding a region list is how you end up selling a region you can't supply.
- `GET /v3/products/{productId}/description` and `GET /v3/productImages/{id}` — product
  copy and images for product pages.
- `GET /v3/orders` — order history, useful for reconciling my records against theirs.

**No complaint endpoint appears in the v3 list**, despite support saying one exists. Follow
up before building that part.

**Token lifetime is dynamic — read `expires_in`, never hardcode.** Support said 60 minutes,
but the documentation's own example response shows 1158 seconds, because re-requesting
returns the existing token with its *remaining* life. Always store the token together with
the expiry derived from the `expires_in` in that response, and refresh only when it has
actually passed. A hardcoded 60 minutes will hand you an expired token mid-order.

**Credentials:** the client_id and client_secret in the documentation examples are shared
demo values. Generate my own at app.codeswholesale.com under the API tab. Sandbox and live
are separate hosts — `sandbox.codeswholesale.com` and `api.codeswholesale.com` — and both
go in `.env.local`, never in code.

**Risk scoring is available over the API.** Confirmed by support: `POST /v3/security`
returns a numeric `riskScore`. Call it before fulfilment and use it to drive the risk-based
holds in Phase 3.6 — a high score sends the order to `held` for my manual review instead of
delivering a key. This is a supplier-provided fraud signal I'd otherwise have to build
myself; use it.
above a threshold, with 1.5 as their suggested value.

**Auth and rate limits — confirmed by support.** Token lifetime is 60 minutes, and
requesting a new token while one is still valid returns the same token with its remaining
life. So: store the token, reuse it, only request a new one once it has actually expired.
Limits that matter:

- `/oauth/token` — 50 requests per 5 minutes per IP. With caching this is about one call
  per hour, nowhere near the limit.
- `GET /v3/products` (full price list) — 400 per 10 minutes.
- `GET /v3/products/{productId}` — 600 per 5 minutes.

Their recommended pattern, which matches the plan: **keep the catalogue cached locally and
refresh periodically using the `createdSince` and `updatedSince` parameters** rather than
pulling the full list. That cuts both request count and payload size, and means the shop
never queries the supplier on a page view.

**Sandbox** is public — no activation needed, demo credentials are in the documentation,
test catalogue and test codes only.

### Faulty keys — confirmed terms, and the decision they force

A bad key goes through a support form with screenshots. Confirmed by support: **reportable
up to 1 year from purchase**, and **CodesWholesale has up to 14 business days to provide a
solution**, though most cases resolve sooner. There is also a **separate complaint API** —
ask for those docs before building this part.

The one-year window is generous. The 14 business days is the problem: that's three calendar
weeks, and no customer waits three weeks for a key that doesn't work. So there's a policy
decision to make before launch, and it's a business decision, not a technical one:

- **Resolve for the customer immediately** — refund or replace within hours — and carry the
  supplier claim yourself in the background. Costs money when a claim is rejected, but it's
  the only answer that keeps a new shop's reputation intact.
- **Make the customer wait** for the supplier verdict. Cheaper, and reputationally fatal
  for a shop nobody has heard of yet.

Take the first. Price the margin so that carrying it is survivable, and treat supplier
reimbursement as recovery rather than as the customer's timeline. Note this cuts against
CodesWholesale's own advice not to refund before they respond — that advice optimises for
their exposure, not for my reputation.

Consequences already reflected in the plan:
- The four-screenshot evidence policy stays, and is now also a supplier requirement.
- The support widget must never resolve a faulty-key claim. Never.
- Keys must never be duplicated or re-issued from my own database. One key, one order.
- Track open supplier claims in the admin: what was claimed, when, and whether the
  reimbursement ever arrived. Otherwise money quietly leaks.

### Still to confirm

- Documentation for the separate complaint API.
- Whether a low-balance notification can post back to me automatically.

**Deliverable:** sandbox credentials (public — just take them from the docs). Then we design
`CodesWholesaleProvider` against the sandbox rather than against assumptions.

---

## Phase 1 — The shop (plumbing, deliberately unstyled)

Open Claude Code in the empty folder and paste everything between the lines.

---
PASTE THIS
---

I'm building a webshop that sells digital game keys. I'm the owner, not a developer —
I can read code and approve changes, but I don't write it. Explain every change in plain
language, and stop and ask me before doing anything destructive or anything that costs money.

## What we're building in this phase

A working storefront with a complete checkout flow, where the supplier connection is a
**stand-in that returns fake keys**. I don't have my supplier's API documentation yet, and I
don't want a real supplier wired in until the rest is proven. Design it so the real supplier
can be dropped in later without rewriting the shop.

## Stack (already decided — don't propose alternatives)

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL via Supabase, using Prisma
- Deployed on Vercel
- Payments: Mollie (not yet connected — stub it this phase, same pattern as fulfillment)
- Errors: Sentry

## Rendering — server-first, and keep it that way

Every public page must arrive as real HTML from the server. Product pages rendered only in
the browser are invisible to social share scrapers and unreliable for search crawlers, and
the Open Graph tags have to be in the server response or a shared link renders as a blank
card.

- Default to server components. `"use client"` goes as **low in the tree as possible** —
  on the individual interactive component, never on a layout or a page wrapper. If you're
  about to mark a layout as a client component, stop and tell me why.
- Product and shop pages: statically generated with revalidation, not client-fetched.
- Order confirmation, order lookup, cart and admin are dynamic and must be `noindex`.
  Never cache a page that can contain a key.
- **Revalidate product pages after each catalogue sync** (the scheduled `updatedSince` pull),
  rather than relying on a short time-based cache. This is a money issue as much as an SEO
  one: a stale cached price means selling below cost, and stale stock means selling
  something I can't deliver.
- Prices and availability must be re-checked server-side at checkout, before payment,
  regardless of what the cached page said.



Fulfillment must sit behind one interface with two implementations:

```
interface FulfillmentProvider {
  checkAvailability(productId: string): Promise<{ available: boolean; price: number }>
  orderKey(productId: string, orderId: string): Promise<KeyResult>
}
```

- `MockFulfillmentProvider` — this phase. Returns fake keys. Must be able to simulate
  every real case on demand: out of stock, empty balance, timeout, a key returned as a
  Base64 image instead of text, and **a successful order that returns no code yet**
  (CodesWholesale's preorder type — see below).
- `CodesWholesaleProvider` — a stub file with the methods and TODOs, nothing implemented.

Which provider is used is chosen by an environment variable. Nothing else in the app may
know which one is running.

**Products are always identified by supplier product ID, never by game title.** Title
matching caused wrong keys to be sent in my previous setup. If you ever find yourself
matching on a name, stop and tell me.

## Data model

- `Product` — supplier product ID (unique), title, platform, region, price, active flag
- `Order` — status, customer email, total, Mollie payment ID, timestamps
- `OrderItem` — links order to product, quantity, unit price
- `DeliveredKey` — order item, the key value, delivered timestamp, delivery method
- `EventLog` — order ID, event type, raw payload as JSON, timestamp

Order status must be an explicit state machine:
`pending → paid → fulfilling → completed`, with `held`, `awaiting_code` and `refunded` as
side exits. Never let an order skip states.

`awaiting_code` exists because CodesWholesale can accept an order successfully and return
no key yet (their preorder code type). The money is taken, the order is valid, the key
arrives later. This is not an error state and must not be treated as one — the customer
needs a clear "your key is reserved and will arrive" message, and the order must resolve
automatically when the code lands.

Note: preorder products will be switched off at launch, so this should be rare. Build and
test the path anyway — a product's availability can change between listing and ordering,
and an unhandled case here means a paid customer with no key and no explanation.

## Non-negotiable behaviour

1. A key is written to the database **before** it is shown or emailed to the customer.
   If the write fails, the customer must not see the key.
2. If the supplier returns no key, the order goes to `held`, the payment is refunded, and
   the customer is told plainly. Never invent, retry blindly, or silently substitute a key.
3. Every supplier call and every payment webhook writes to `EventLog`, including failures.
   This log is my defence against chargebacks, so it must be complete.
4. Webhooks must be idempotent — the same payment notification arriving twice must never
   deliver two keys.
5. No secrets in the code. Everything in `.env.local`, with a `.env.example` committed.
6. **Withdrawal-right waiver at checkout.** Game keys are digital content, so under EU
   consumer law I lose the right to refuse a refund unless the customer, *before* delivery,
   gives express consent to immediate performance AND acknowledges they thereby lose their
   14-day withdrawal right. Build this as its own dedicated checkbox, separate from the
   terms checkbox, unticked by default. Store the timestamp and the exact wording version
   shown in `EventLog`, and repeat the confirmation in the order confirmation email.
   Without this, every customer can demand a refund for 14 days and keep the key.
7. **No non-essential cookie or script fires before consent.** No analytics, no tracking,
   nothing optional, until the visitor opts in. Rejecting must be exactly as easy as
   accepting. Build the consent gate before any third-party script is added, not after.
8. **A kill switch, checked on every checkout.** A database flag (not an environment
   variable, not a code constant) that stops new orders being accepted. Checkout reads it
   before taking payment. Stopping sales must never require a deploy — a deploy takes
   minutes I won't have. Build the flag and the check now; the admin controls come in
   Phase 3.5.

## Pages needed

- Home — featured products
- Shop — list with filters for platform and region
- Product page — title, price, region, platform, redemption instructions, buy button
- Cart and checkout — email required, terms checkbox
- Order confirmation — shows the key, plus "we've emailed it to you"
- Order lookup — order number + email, no account needed
- Static: terms, privacy, refund policy, contact (placeholder text is fine)

## Visual design in this phase: deliberately none

Build every page **structurally correct and visually plain**. Default Tailwind, no theme,
no colour choices, no hero concepts, no decorative anything. Semantic HTML, correct
heading order, real labels on every form field, visible keyboard focus, responsive down
to mobile.

I am running a separate design pass with a dedicated design skill after this phase, and
anything you invent now will be thrown away. Do not try to make it look good. Do keep the
markup clean enough to restyle:

- All spacing and colour via Tailwind utility classes, never inline styles
- No hard-coded hex values anywhere
- Every repeated element is a component (`ProductCard`, `Button`, `Input`, `Badge`),
  even if it's currently trivial
- Keep layout structure and content structure separate

## How I want you to work

- Set up the project, then **stop and show me it running on localhost** before building features.
- **First commit includes `PLAN.md` and `CLAUDE.md`.** I'll paste the full build plan into
  `PLAN.md`. You write `CLAUDE.md` as a short standing-rules file that every future session
  reads: never match products by title, never show a key before it's persisted, never edit
  `.env*`, never deploy unless asked, stop before anything destructive or anything costing
  money, explain changes in plain language. Keep it short enough to actually be followed.
- Work in small steps. After each one, tell me what changed and what I should click to check it.
- Write a `README.md` I can actually follow, and keep it updated.
- Write tests for the order state machine and the fulfillment failure cases. Those are the
  parts that lose me money if they're wrong.
- Set up Git from the first commit.
- When I need to do something outside the code — create an account, copy a key, change a
  setting — give me exact click-by-click steps and wait for me to confirm.

## What NOT to do this phase

- Don't connect a real supplier or real payment credentials
- Don't add user accounts or passwords
- Don't add an admin dashboard yet
- Don't deploy to production yet
- Don't style anything

Start by explaining your plan and the folder structure you intend to create, and wait for my
go-ahead before writing files.

---
END PASTE
---

**Done when:** you can click through home → product → checkout → confirmation on
localhost, a fake key appears, and the fake failure cases behave correctly. It will
look terrible. That is correct.

---

## Phase 1 (parallel) — Taste homework

Do this while Claude Code is building. It's dead time for you anyway, it takes about an
hour, and Phase 1.5 is blocked without it.

You are **not** finding a design to copy. Impeccable generates the visual directions and
you judge them. What it can't generate is your reaction — so that's what you collect.

**1. What you refuse to look like** (the important half)

3–5 game key shops that read as cheap or untrustworthy to you. One line each on *why* —
the neon, the fake countdown timer, the stock-photo mascot, the seventeen badges, whatever
makes you wince. Blunt is better than diplomatic here.

Shortcut: install the Impeccable Chrome extension and run the detector overlay on each of
them. It names the problems for you, which is much easier than articulating them cold.

**2. What earns your trust**

2–3 sites from any industry that made you think "I'd give these people my card details."
Not necessarily games. Note what did it — the restraint, the clarity of the pricing, the
fact that nothing shouted.

**3. Voice**

Three adjectives for how you want to come across. One for how you never want to.

**What you never need to produce:** hex codes, typefaces, layouts, moodboards, logo ideas.
All of that comes out of Phase 1.5. You supply judgment; the skill supplies craft.

The output of this hour goes straight into PRODUCT.md — items 1, 2 and 3 map onto the
anti-references, trust posture and brand voice fields below.

---

## Phase 1.5 — The design pass

Only start this once Phase 1 works end to end. Designing before the pages exist means
designing a guess.

### Install the design layer

In the project folder terminal:

```
npx impeccable install
```

Then in Claude Code:

```
/impeccable init
```

This installs one skill plus 23 commands, a 59-rule anti-slop detector, and a pre-edit
hook that inspects every UI change. It reads your existing Tailwind config and components
rather than overwriting them — which is why Phase 1 built components even where they
looked pointless.

Optional, worth 10 minutes: install the Impeccable Chrome extension and run the detector
overlay on your three biggest competitors' shops. You'll get a concrete list of what makes
them look cheap, before you decide what you look like.

### Fill in PRODUCT.md — this is the part that matters

`/impeccable init` creates PRODUCT.md and asks you for the brief. Every command reads it
before designing. This is the only place your actual taste enters the system, so don't
rush it. Answer these in your own words:

- **Users** — who is buying, in what state of mind. A 22-year-old on a phone at 23:00
  deciding whether you're a scam is not the same user as a SaaS buyer.
- **Mode** — a storefront is *persuade* on the home and product pages, *operate* on
  checkout and order lookup. Say so explicitly.
- **Brand voice** — three adjectives, and one sentence of what you never sound like.
- **Anti-references** — the strongest field in the file. List by name what you refuse
  to look like: every 2014-era grey-and-neon key shop, glassmorphism, purple gradients,
  countdown timers, fake stock counters, "🔥 HOT DEAL" badges.
- **Trust posture** — you sell a product people expect to be scammed on. Region locks,
  delivery timing and refund policy are design problems, not legal ones. Say that they
  must be visible before purchase, not buried in terms.

Open question you still owe yourself: **the brand name.** CQRTY is the tax entity, not
the shop. Put a working name in PRODUCT.md and change it later — it's one field.

### Run the design

```
/impeccable polish the home page
```

Impeccable deals several complete visual directions against the ones the model would
invent on its own, and the winner takes the build. Pick, then work page by page:
home → product → shop → checkout → confirmation.

Useful commands as you go: `/typeset` for typography, `/distill` when a page has too
much, `/clarify` when something reads confusingly, `/audit` for a production-quality
check, `/impeccable live` to point at elements in the running app and steer them.

### Export the system

```
/impeccable document
```

Writes DESIGN.md in the Google Stitch format. From then on your visual system is portable:
you can pull it into Google Stitch to mock up new pages fast, or push a Stitch-made
direction back into the codebase. Commit DESIGN.md — it's the thing that keeps page nine
looking like page one.

---

## Phase 2 — Motion (later, optional)

Once the design holds up, add Emil Kowalski's design-engineering skills:

```
npx skills add emilkowalski/skill
```

Useful ones for a shop: `animate`, `find-animation-opportunities` (it also tells you what
*not* to animate), `review-animations`. The payoff here is checkout feeling smooth and the
key reveal feeling like an event. It's polish, not foundation — don't do it before Phase 1.5.

### Motion (formerly Framer Motion)

**Naming, so searches don't confuse you:** Framer Motion became an independent project and
was renamed **Motion**. The npm package is `motion`, the React import is `motion/react`.
Docs at motion.dev. Old `framer-motion` installs still work via a re-export, so older
tutorials aren't wrong, just dated. MIT licensed, free commercially — no Framer
subscription, and Framer the design tool is a separate thing entirely.

**Do not install it in Phase 1.** CSS transitions cover most of what a shop needs. Reaching
for an animation library before something demands it is how bundles get fat.

**The cost to weigh:** the React build is 30+ kB gzipped, or roughly 15 kB using
`LazyMotion` with `domAnimation`. My customer is frequently on mobile data deciding whether
I'm a scam. 30 kB to fade in a hero is a bad trade. 30 kB to make checkout feel solid is a
fine one.

**Where motion genuinely earns its place here:**

- **The fulfillment wait** — between `paid` and the key appearing there is a real supplier
  call, several seconds of silence where the customer wonders if they've been robbed. This
  is the highest-anxiety moment in the entire funnel and the single best use of motion on
  the site. Not decoration: reassurance.
- **The key reveal** on the order confirmation page. The one moment worth making feel like
  something happened.
- **State feedback** — item added to cart, discount code accepted or rejected, order moving
  to `held`.

**Where it does not belong:** scroll reveals on product lists, animated heroes, staggered
fade-ins on everything. Impeccable's detector flags these as slop, and they make a shop feel
slower rather than richer.

**Decision procedure:** run `find-animation-opportunities` first and let it tell me where
motion is warranted and where it isn't. Install `motion` only if the answer is yes, and
only for the cases above. Respect `prefers-reduced-motion` everywhere.

**Deliberately skipped:** Taste Skill. Good project, but it overlaps Impeccable almost
entirely, and two anti-slop skills running together give the agent contradictory rules.
Its `brandkit` and `image-to-code` skills are worth revisiting standalone if the brand
identity stalls.

---

## Phase 3 — Real supplier, real payments

Gated on Phase 0.5. Nothing in the shop or the design should need to change — that's the
whole point of how Phase 1 is structured. Order of work:

1. **Implement `CodesWholesaleProvider` against their sandbox.** Same interface, real calls.
   The mock stays in the codebase; the environment variable decides which runs.
2. **Beat it up before trusting it.** Run every failure the mock simulated, against the
   sandbox: out of stock mid-order, empty balance, timeout, image-format key, duplicate
   webhook. It's boring when it's finished, and boring is the goal.
3. **Connect Mollie.** Live credentials, real card and Bancontact test transactions.
4. **Deploy to Vercel.** Sentry live from day one.
5. **Buy from yourself.** Real money, real card, three or four orders including one you
   deliberately break. Fix what you find before anyone else does.

Only flip the environment variable to the real provider once step 2 is genuinely dull.

---

## Phase 3.5 — Admin panel (pricing, VAT, promotions)

A thin version of this has to exist before you take real money — you can't run a shop where
changing a price means asking a developer. Build it the moment Phase 3 starts, not after.

**Rule: I never edit code to run the business.** Everything below is a screen behind a login
only I can reach. If a task requires a deploy, it's built wrong.

### Access

- Single admin login, my email only. No public registration, no roles, no user management.
- Two-factor on the login.
- Every admin action writes to `EventLog` — who, what, before value, after value, when.
  If a price is wrong, I want to see when it changed and to what.

### Pricing — a rule, not 500 numbers

Supplier cost prices move constantly. Hand-editing is not a system.

- **Global pricing rule:** margin multiplier, minimum absolute margin, price floor, and
  rounding style (e.g. always end .99). Supplier cost is tiered by purchase quantity, so
  the rule must state which price band it computes from — for one-key-at-a-time
  fulfilment that's the single-unit band, which is the most expensive one.
- **Per-product override:** for the titles worth attention. An override sticks until I
  clear it and is visibly flagged in the product list.
- **Repricing run:** pulls current supplier costs, applies the rule, and shows me a
  preview of what would change — old price, new price, resulting margin — before anything
  is written. Never silently reprice.
- **Margin guard:** if applying the rule would put a product below the minimum margin,
  it's flagged for review, not published.

### VAT

Game keys are digital services (TBE) for EU VAT, which means destination-based rules.

- Rates live in an **editable table** (country, rate, effective date). Changing a rate is
  a database edit, never a deploy.
- The **rule stays in code**: below the €10,000 EU-wide cross-border B2C threshold, charge
  the Belgian domestic rate; above it (or after opting into OSS voluntarily), charge the
  customer's country rate.
- **Threshold tracker** on the dashboard: cumulative cross-border B2C sales this calendar
  year against €10,000, so crossing it is never a surprise.
- **Location evidence:** capture and store at least two non-contradictory pieces per order
  (billing country, IP-derived country, payment country from Mollie). Store for ten years.
  This must be in the checkout from the first real sale — it cannot be reconstructed later.
- **No B2B, deliberately.** This shop sells to private consumers only. Do not build a VAT
  number field at checkout, VIES validation, or reverse-charge invoicing. Every sale is
  B2C with VAT charged. This is a decision, not an omission — see Phase 3.6 for why.
  Terms should state that the shop sells to consumers.
- **OSS export:** a per-quarter report of sales by destination country and rate, in a
  format my accountant can work from.

Confirm the threshold handling and OSS registration timing with my accountant before launch.
Build the mechanism; don't assume the tax position.

### Promotions and discount codes

- **Discount codes:** code, percentage or fixed amount, minimum order value, usage cap
  (total and per customer), valid from/until, restricted to specific products or platforms,
  active toggle. Usage count visible per code.
- **Promotions:** a sale price on selected products for a date range, with the original
  price shown struck through — and only if it was genuinely the price before. EU pricing
  rules on prior-price claims apply; don't fake a "was" price.
- **Never build:** fake countdown timers, fake stock counters, permanent "sale" states.
  These are already in the PRODUCT.md anti-references and they read as scam to exactly
  the customer who is deciding whether to trust you.
- Discounts apply to the net amount; VAT is calculated after the discount, not before.

### The noodknop — stopping sales when something goes wrong

The flag from Phase 1 gets its controls here. One button isn't enough; three levels, because
the right response to "one product is broken" isn't the same as "everything is broken."

**Level 1 — pause a product.** One title is delivering wrong keys or the supplier has a bad
batch. Everything else keeps selling.

**Level 2 — pause checkout.** The shop stays browsable, product pages still load, but no new
orders can be placed. A clear honest message where the buy button was: sales are temporarily
paused, we expect to be back shortly. This is the one you'll use most.

**Level 3 — full maintenance.** The whole site is behind a notice. Reserve this for a
security problem, because a dark site costs trust that a paused checkout doesn't.

**Rules that make it actually work:**

- Nothing here requires a deploy. Ever. A deploy takes minutes I won't have at the moment
  I need this.
- **In-flight orders are not abandoned.** Pausing stops *new* orders. Anything already paid
  either completes fulfilment or goes to `held` and is refunded automatically. A customer
  who paid during the last thirty seconds before the pause must not be left with nothing —
  that's the exact scenario that produces a chargeback and a public review.
- Order lookup and key retrieval **keep working at every level**, including full
  maintenance. Customers who already bought must always be able to reach their keys.
- Every activation and deactivation writes to `EventLog`, with who and when.
- It has to be reachable from my phone. Problems don't wait until I'm at the desk.

**Automatic circuit breakers — this is the part that actually saves money.** A manual button
only helps when I'm awake; most disasters happen while I'm not. Auto-pause checkout and
alert me when:

- N consecutive fulfilment failures within a short window (start at 3 in 5 minutes, tune
  from real data)
- Supplier balance drops below the threshold that covers pending orders
- The supplier API is unreachable or timing out repeatedly
- Payment succeeds but fulfilment fails more than a set number of times in an hour

Auto-pause is deliberately trigger-happy and only ever *stops* sales. It never resumes them
by itself — resuming is always my decision, after I've looked at what happened.

**Resuming.** A short checklist before the flag goes back off: what failed, is it actually
fixed, were any orders left in `held` or `awaiting_code`, and have those customers been
made whole? Unpausing blind and re-breaking is how a one-hour incident becomes a one-day one.

### Also on the dashboard

- Orders list with status, filterable, and a manual `held` → resolved path
- One-click view of the `EventLog` for any single order (your chargeback defence)
- Products list with cost, price, margin, and active toggle
- Low supplier balance warning

---

## Phase 3.6 — Invoicing, email delivery, and fraud

Three things that are invisible until they cost money. All three ship before the first real
customer.

### Invoicing — the part that fixes an existing problem

On G2A the invoices aren't Belgian-compliant, so every sale gets recreated by hand in
Accountable. On my own shop I control invoice generation, and that manual work disappears
entirely. Build it properly and it's the biggest quality-of-life win in this whole project.

**Requirements:**
- **Sequential invoice numbers with no gaps**, assigned at payment confirmation — not at
  key delivery, since delivery can fail. A gap in the sequence is a bookkeeping problem;
  never delete an invoice.
- All Belgian mandatory invoice fields: my details and ondernemingsnummer/VAT number, the
  customer's details, invoice date, sequential number, description, net amount, VAT rate
  and amount per rate, total. All invoices are B2C with VAT charged — no reverse-charge
  variant exists in this shop.
- **PDF generated automatically** and attached to the order confirmation email.
- **Credit notes for refunds** — their own sequential series. A refund is a credit note,
  never an edited or deleted invoice.
- **Immutable storage.** Once issued, an invoice PDF is never regenerated. Archive them;
  Belgian e-invoice archiving requires a minimum of seven years, and general accounting
  retention is longer — confirm the exact period with my accountant.
- **Export for Accountable** — a monthly and quarterly export (CSV or whatever Accountable
  ingests best) covering sales, VAT per country, and credit notes. Check whether Accountable
  offers an import format or API before designing the export.

**Belgian B2B e-invoicing — why this shop is B2C only.** Since 1 January 2026, structured
electronic invoicing via the Peppol network is mandatory for domestic B2B transactions
between Belgian VAT-registered businesses; a PDF by email is no longer sufficient for those.
Businesses invoicing only private consumers are outside the mandate, though they must still
be able to *receive* structured e-invoices from their own suppliers. Penalties for
non-compliance are graduated, starting around €1,500.

**Decision: this shop sells B2C only.** No VAT number field, no VIES validation, no
reverse-charge invoicing, no Peppol access point. Every sale carries VAT and gets a PDF
invoice. This keeps the whole shop out of the Peppol mandate for a customer segment that
would be a rounding error in a game key business anyway.

Two consequences to keep in mind:
- Say it plainly in the terms — the shop sells to consumers.
- The mandate also covers invoices I *receive*, but my Peppol setup for that is already in
  place. Nothing to do here.

If I ever want B2B later, it's a deliberate project with its own phase, not a checkout
field someone quietly adds.

### Transactional email — the key delivery IS the product

The email carrying the key is not a notification, it's the thing the customer paid for. If
it lands in spam I get a support ticket and, often, a chargeback.

- Use a real transactional email provider (Resend, Postmark or similar). Never send SMTP
  directly from the app server — deliverability will be terrible.
- Configure **SPF, DKIM and DMARC** on the domain before the first real send.
- Use a subdomain for transactional mail, kept separate from anything marketing, so
  promotional sending can never damage delivery of key emails.
- **Never rely on email alone.** The key is always visible on the order confirmation page
  and always retrievable through order lookup. Email is a convenience, not the delivery
  mechanism.
- Emails needed: order confirmation with key and invoice PDF, order held / refund issued
  with credit note, and an order-lookup link that needs no account.
- Log every send and every provider bounce or complaint to `EventLog`.

### Fraud and chargebacks — the way small key shops die

Digital keys are instantly resellable, which makes them a favourite target for stolen cards
and card-testing attacks. On G2A the platform absorbed much of this. On my own shop, a
fraudulent order costs me the key, the money, and a chargeback fee.

- **3D Secure on, always.** It shifts liability. Whatever conversion it costs is cheaper
  than fraud.
- **Velocity rules:** multiple orders from one email, IP or card within minutes; many
  failed payment attempts in sequence (that's card testing, and it can drain a supplier
  balance overnight).
- **Risk-based holds.** High-value orders, or a mismatch between billing country and
  IP country, go to `held` for my manual review *before* fulfilment. I'm already collecting
  those two data points for VAT — reuse them. A delayed key costs a complaint; a
  fraudulently fulfilled key costs real money.
- **A daily spend ceiling** against the supplier balance, so an attack can't empty it
  while I sleep.
- **Chargeback defence is the `EventLog`** plus delivery evidence plus the recorded
  withdrawal-waiver consent. This is why the log has to be complete.
- Never let the support widget or any automation release a held order.

### Also worth doing here

- **Backups.** The `DeliveredKey` table is irreplaceable — a key I sold and can't prove I
  delivered is a guaranteed loss. Turn on Supabase point-in-time recovery and test a
  restore once, so I know it works before I need it.
- **Analytics.** Pick a cookieless option (Plausible or similar) — it sidesteps the consent
  banner problem entirely and keeps the checkout free of tracking friction.
- **Order-lookup self-service.** Customers re-requesting a lost key is the single most
  common support message. Make it self-serve and the volume mostly disappears.

---

## Phase 3.7 — Pre-launch page checklist

Small, cheap items. Do them in one sitting before going live.

**Discoverability and sharing**
- Unique `<title>` and meta description per page, generated from real product data — never
  a template with the shop name repeated
- Open Graph / social share image, so a shared product link doesn't render as a blank card
- `robots.txt` and a sitemap. **Critical:** order confirmation, order lookup and admin
  routes must be `noindex` and disallowed. A key sitting in a Google-indexed confirmation
  page is a real and permanent leak
- **Product structured data** (schema.org Product with price, availability, platform) —
  this is the schema that matters for a shop. Local-business schema is irrelevant; there's
  no physical location

**Navigation and conversion**
- Custom 404 page that routes people back to the shop instead of dead-ending
- Breadcrumbs — genuinely useful with platform and region filters
- Buy action visible without scrolling on product pages, and a sticky buy bar on mobile
- Internal links between related products (same franchise, same platform)

**Trust — the section that matters most for a key shop**
- **FAQ, minimum 5**, answering the questions that actually generate support tickets: how
  do I redeem, how fast do I get my key, what does region lock mean, what if the key
  doesn't work, is this legitimate. Every good answer here is a ticket that never arrives
- **Response time promise** — a stated support turnaround, and one I can actually keep
- **An honest "who runs this" page.** One real person, real name, real photo, based in
  Belgium. Not a stock-photo "team" — a fake team is worse than no team, and buyers in this
  category are specifically scanning for signs of a fly-by-night operation. A named human
  is a stronger trust signal here than any badge
- Delivery timing and region restrictions stated on the product page, before purchase

**Reviews — later, and carefully**
There are none at launch, and that's fine. When they exist: under EU rules, if reviews are
presented as coming from purchasers, that has to be verifiable, and fake or unverified
reviews are an enforcement risk. Wire reviews to actual order IDs or don't display them.

**Analytics: not Google Analytics.** GA requires a consent banner and adds tracking friction
to a checkout where the customer is already deciding whether to trust me. The cookieless
option in Phase 3.6 gives the numbers that matter — traffic, sources, conversion — with no
banner and nothing to disclose. Revisit only if there's a concrete question the simpler tool
can't answer.

**Not applicable here:** maps and directions, local-business schema, case studies. Those
belong to local service businesses, not a digital storefront selling Europe-wide.

---

## Phase 3.8 — Security

"Unhackable" isn't a target. The target is: small attack surface, small blast radius when
something goes wrong, and fast detection. For a one-person shop the realistic threats are
not sophisticated attackers — they're leaked credentials, an unpatched dependency, and my
own admin account.

**Already working in my favour:** Mollie hosts the payment page, so card data never touches
my server. That removes the biggest breach category from this build. Keep it that way —
never accept card details directly, no matter how much smoother it looks.

### The crown jewels, ranked

1. **Delivered keys** — resellable, and a breach means paying for every stolen key.
2. **Supplier API credentials** — someone with these can spend my prepaid balance.
3. **Customer data** — emails, order history, VAT location evidence. A GDPR breach.
4. **Admin access** — leads to all of the above.

### Build rules

**Secrets**
- Never in code, never in the repo. `.env.local` locally, Vercel environment variables in
  production, with sandbox and live credentials fully separate.
- A `.env.example` with placeholder values only, committed. Real values never.
- Rotate supplier and payment credentials on a schedule, and immediately if a laptop is
  lost or a service is compromised.

**Keys at rest**
- Encrypt the key value in `DeliveredKey` at rest — application-level encryption, with the
  encryption key in the environment, not in the database. A database dump alone must not
  yield usable keys.
- Never log a full key. Not in application logs, not in `EventLog` payloads, not in Sentry.
  Truncate or mask.
- **Configure Sentry scrubbing explicitly.** Sentry can capture request bodies and would
  happily record a key or a customer email in an error report. Set up data scrubbing before
  it goes anywhere near production.

**Database**
- Row Level Security enabled on every Supabase table, no exceptions.
- The service role key never reaches the browser. Only server-side code touches it. This is
  the single most common catastrophic Supabase mistake — check it deliberately.
- The browser gets no direct database access at all; everything goes through my own server
  routes.

**Admin account**
- Long unique password from a password manager, plus 2FA — passkey preferred over SMS.
- No public registration route exists. Not hidden, not disabled — absent.
- Login rate-limited and locked after repeated failures, with an alert to me on any failed
  attempt burst and on any successful login from a new device.

**Order lookup — the overlooked one**
Order number plus email is guessable and enumerable, and it returns a resellable key. Treat
it as an authentication endpoint:
- Rate-limit hard, per IP and per email.
- Never reveal whether an order number exists — same response either way.
- Prefer emailing a signed, expiring link over a form that returns the key directly.
- Alert me on repeated failed lookups; that's someone fishing.

**General hardening**
- Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options.
- Rate limiting on checkout, lookup, login and the support widget.
- Input validation server-side on everything, and parameterised queries only — Prisma
  handles this, so don't hand-write raw SQL.
- Keep the dependency list short. Every package is someone else's security record inherited
  into my shop.
- Backups encrypted, and a restore tested once before launch.

### Checks I can actually run — mostly free

- **GitHub Dependabot** — automatic alerts and pull requests for vulnerable dependencies.
  Turn it on when the repo is created, not later.
- **GitHub secret scanning / push protection** — blocks committing a credential by
  accident. Enable whatever my plan offers.
- **`npm audit` in CI** — fail the build on high-severity findings.
- **securityheaders.com and Mozilla Observatory** — free external scans of the live site,
  graded, with specific fixes. Run before launch and after any header change.
- **SSL Labs** — free TLS configuration test.
- **Strix** (github.com/usestrix/strix) — open-source AI penetration testing agents,
  Apache 2.0. Runs against the app dynamically and validates findings with actual
  proofs-of-concept rather than static guesses, covering the OWASP Top 10 plus business
  logic flaws like payment manipulation and rate-limit bypass — which is precisely the
  category of bug that costs a key shop money. Needs Docker and an LLM provider key.
  **Run it only against my own staging environment, never production and never anyone
  else's site.** Best used after Phase 3 works end to end, before going live.
- **A structured review by Claude Code**: point it at the repo and ask for a security
  review against this checklist specifically — secrets handling, RLS coverage, what
  reaches the client bundle, logging of sensitive values, and the auth on every route
  that returns a key. Repeat after any significant change.

A paid penetration test is real security work but overkill before there's revenue. Revisit
once the shop is earning; the free checks above cover the mistakes that actually sink small
shops.

### Detection and response

- Alerts: new-device admin login, failed login bursts, repeated failed order lookups,
  unusual order velocity, supplier balance dropping unexpectedly fast.
- **The noodknop is the incident response.** If something looks wrong, stop sales first and
  investigate second. Lost revenue for an hour is recoverable; leaked keys are not.
- GDPR breach notification is 72 hours — the process is in the legal appendix. Decide now
  who I call, because deciding during an incident is too late.

### Cost and abuse protection — bill shock

Managed hosting removes server misconfiguration as a risk, but not runaway billing. Attack
traffic still costs money, because bandwidth and function invocations are metered. Set all
three of these before the site is publicly reachable:

- **Vercel Spend Management.** Set a spend amount **and explicitly enable the pause option**
  — setting an amount alone only notifies, it does not stop usage. Add SMS or email alerts
  below the cap so I hear about it before it trips.
- **Supabase Spend Cap enabled.** Supabase name attacks and software bugs as exactly the
  scenarios that produce runaway usage. Leaving the cap off is the single biggest billing
  danger on that platform.
- **Cloudflare in front of the domain (free tier).** DDoS protection, WAF, bot filtering
  and rate limiting at the edge. This matters more than the application-level rate limits
  already in the plan: those still cost a function invocation per blocked request, whereas
  Cloudflare drops junk before it reaches Vercel and before it's billable.

Ordering matters — edge blocking first, application rate limits second, spend caps as the
backstop. And the supplier balance ceiling in Phase 3.5 covers the more expensive version of
this problem: compute overspend is a bad month, but automated orders draining prepaid
supplier balance is real inventory gone.

### Deliberately not adding a cybersecurity skills library

Large agent security skill libraries — e.g. mukul975/Anthropic-Cybersecurity-Skills, 754
skills across 26 domains, community-run and **not** affiliated with Anthropic despite the
name — are out of scope. Decided, not overlooked:

- The domains are SOC and incident-response work: malware analysis, memory forensics, SIEM
  triage, Active Directory attacks, Kubernetes, OT/ICS. None of that infrastructure exists
  here.
- The two domains that do touch this stack (web app and API security) are analyst playbooks
  for investigating systems, not guidance for hardening a Next.js checkout. Strix already
  covers testing my own app, and it does it by actually running against staging.
- Pointing Claude Code at hundreds of extra skill definitions in a small repo is context
  noise competing with Impeccable and my standing rules. More skills is not more security.

The checks listed above are proportionate to the actual risk of a one-person shop. Adding a
SOC library would close no gap that exists here.

### The honest weak point

The most likely way this gets breached is not the code. It's my own laptop, a reused
password, or a phishing email that looks like Mollie or CodesWholesale. Password manager,
2FA everywhere, a machine that stays patched, and healthy suspicion of any email asking me
to log in — that's most of the actual risk, and no amount of code review substitutes for it.

---

## Phase 4 — The Claude ops layer

Three separate things, and they don't cost the same or carry the same risk.

**Sentry → bug reports.** Do this in Phase 1, not here — it's listed in the stack for a
reason. When something breaks in production you paste the Sentry link into Claude Code and
it has the stack trace, the failing line, and the fix. Highest value per effort of the three.

**Claude Code with repo access.** This is your maintenance layer and it costs nothing
beyond your subscription. Not a bot running unattended — you open it when something needs
changing. This is already how you'll be working from Phase 1 onward.

**Support chat widget.** Claude API called from your own backend. Cheap, pennies per
conversation. Add it last, once real customers are generating real questions, so you know
what they actually ask. The hard rule:

> It answers questions. It never decides outcomes.

No issuing refunds, no re-sending keys, no judging whether a faulty-key claim is legitimate.
An AI that can be talked into a refund will be, within a week. Safe territory: how to
redeem, what a region lock means, where's my order, does this work on my platform.

Your existing four-screenshot evidence policy for wrong or faulty keys stays a human
decision, always. The widget may *explain* what evidence is needed and *collect* it, which
is genuinely useful and saves you a round trip — but the judgment call and the refund
button remain yours.

**Deliberately not doing:** anything autonomous. Claude watching the site and fixing things
unsupervised sounds appealing and is how people wake up to a broken checkout at 3am.

---

## Appendix — EU legal requirements

Mostly a pre-launch checklist. But three items are **not** end-of-project, and retrofitting
them is either impossible or expensive.

### Build these during Phase 1 — not at the end

**1. The withdrawal-right waiver.** The big one, and the reason this appendix isn't purely
a footer exercise. EU consumers have a 14-day withdrawal right on distance contracts. For
digital content delivered online there's an exception, but only if three things happened
*before* delivery: the consumer gave prior express consent to performance beginning, they
acknowledged that this loses them the withdrawal right, and I confirmed that consent to
them on a durable medium (the order confirmation email).

Get this wrong and every customer can demand a refund within 14 days *and keep a working
key*. That is the single most expensive mistake available in this build.

Implementation: a dedicated checkbox at checkout, unticked, separate from the terms
checkbox, with plain wording. National courts have split on whether waiver language folded
into the Buy button is sufficient — a German court rejected exactly that design. A separate
explicit checkbox satisfies both the strict and lenient readings, so take the strict one.
Log the timestamp and the wording version shown, per order.

**2. Cookie consent gate.** Non-essential cookies and scripts must not fire before opt-in,
and rejecting must be as easy as accepting. This shapes how analytics gets added, so build
the gate first and add scripts behind it.

**3. VAT location evidence.** Covered in Phase 3.5. Two non-contradictory data points per
order, from the first real sale, retained ten years. Cannot be reconstructed later.

### Pre-launch checklist — identity and static pages

**Trader identity, visible and easy to find:**
- Legal entity name (CQRTY) *and* the storefront trade name, if they differ
- Geographic postal address — not a PO box
- Email address and a phone number
- Belgian ondernemingsnummer and the BE VAT number

**Pages:**
- Terms and conditions — already listed in Phase 1's pages. What they specifically need to
  cover for this business, beyond boilerplate:
  - The shop sells to private consumers only, not businesses
  - What is actually being sold: a licence key for third-party software, not the game
    itself, and that redemption is subject to the platform holder's own terms
  - **Region locks and platform restrictions** — stated as a term, and also shown on the
    product page before purchase. Terms are not where a customer should first discover it
  - Delivery method and expected timing, and that keys are delivered electronically
  - The withdrawal-right position: the 14-day right, the digital-content exception, and
    that the customer waived it at checkout by explicit consent
  - The faulty-key procedure: what evidence is required (screenshots), the reporting window,
    and that resolution depends on the supplier — set the expectation honestly here rather
    than in an argument later
  - One key per order, non-transferable, no resale
  - That a key already revealed cannot be returned
  - Belgian law and jurisdiction, my legal entity and ondernemingsnummer
  - **Versioning:** store which version of the terms each order was placed under. When the
    terms change, past orders remain governed by the version in force at the time, and I
    need to be able to prove which that was
- Privacy policy — what data, why, legal basis, retention periods, every processor by name
  (Vercel, Supabase, Mollie, Sentry, the email sender, the Claude API if the support widget
  ships), any transfers outside the EU, data subject rights, and the right to complain to
  the Belgian Gegevensbeschermingsautoriteit / Autorité de protection des données
- Cookie policy
- Refund and withdrawal policy — including the model withdrawal form, and a plain-language
  explanation of why the digital-content exception applies once a key has been revealed
- Contact page

**Checkout and pricing mechanics:**
- Prices shown to consumers include VAT
- The order button must state the payment obligation explicitly — "Bestelling met
  betalingsverplichting" / "Order with obligation to pay". Not "Continue", not "Confirm"
- All pre-contractual information (main characteristics, total price, delivery method,
  region restrictions, platform) shown before the final order step, not after

**Do NOT add an ODR platform link.** The EU's Online Dispute Resolution platform was shut
down on 20 July 2025 and the obligation to link to it was repealed. Many terms-and-
conditions templates and legal text generators still insert it automatically, and pointing
customers at a dead page can now be treated as misleading. If a generated template includes
one, strip it.

### GDPR operations

- A written retention schedule, and the mechanism to actually delete on it
- Processor agreements (DPAs) with each service above
- A breach notification process — 72 hours, so decide now who does what
- Resolve the conflict between erasure requests and the ten-year tax retention on invoice
  data: tax law wins for the invoice, but everything not required for it still goes

### Two things to check rather than assume

- **European Accessibility Act.** It applies to consumer e-commerce, but microenterprises
  are exempt from parts of it. A one-person business very likely falls under that exemption
  — confirm it rather than relying on this line. Build accessibly regardless; Impeccable's
  quality floor covers most of it and it costs nothing to do it right the first time.
- **The wording of every document above.** This appendix lists mechanisms, not text. Have
  the actual terms, privacy policy and refund policy reviewed by a Belgian lawyer or bought
  from a Belgian template service, and run the VAT position past the accountant. I'm
  building the machinery; someone qualified signs off on the words.

Impeccable removes slop. It does not create identity. Run it with a lazy PRODUCT.md and
you get a competent, tasteful, forgettable shop — better than most of your competitors,
and still not *yours*. The hours you spend on PRODUCT.md are the hours that decide whether
this was worth doing.
