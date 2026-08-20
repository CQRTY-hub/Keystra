# Standing rules

Read PLAN.md first for full context. These are the rules that apply to every
session regardless of what phase we're in.

1. **Never match a product by title.** Always the supplier product ID
   (`Product.supplierProductId`). If you catch yourself matching on a name
   anywhere, stop and say so.
2. **Never show or email a key before it's written to the database.** The
   `DeliveredKey` row is created first; only then does anything read it back
   out to display or send.
3. **Never write to `EventLog` directly.** Always through
   `src/lib/event-log.ts`'s `logEvent()`. It's the one place that redacts
   key-shaped fields before anything reaches the database or Sentry.
4. **Never log a full key value.** Not in `EventLog`, not in the email stub,
   not in application logs, not in Sentry once it exists.
5. **Never edit `.env*` files.** Tell the owner what to add and why; they
   paste it in themselves.
6. **Never deploy unless asked.** No `vercel deploy`, no pushing to a branch
   that auto-deploys, without an explicit go-ahead in the conversation.
7. **Stop and ask before anything destructive or anything that costs money.**
   Dropping data, force-pushing, rotating credentials, creating paid
   resources, running a migration against a database that already has real
   orders in it.
8. **Explain every change in plain language.** The owner reads code but
   doesn't write it. Say what changed and what to click to check it — don't
   assume familiarity with the stack.
9. **The order status state machine is the only way `Order.status` moves.**
   Go through `src/lib/order-state-machine.ts` (`assertTransition`), never a
   raw `prisma.order.update({ data: { status } })`.
10. **The kill switch is a database flag, not an env var.** Checkout must
    check `isCheckoutEnabled()` before taking payment. Stopping sales must
    never require a deploy.
11. **No real supplier or payment credentials until Phase 3.** Everything
    before that runs against `MockFulfillmentProvider` and the Mollie stub.

If a rule here conflicts with something asked in chat, say so before acting —
don't silently pick one.
