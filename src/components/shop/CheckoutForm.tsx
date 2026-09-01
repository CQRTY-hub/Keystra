"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { formatPriceCents } from "@/lib/currency";
import { COUNTRIES } from "@/lib/countries";
import { WITHDRAWAL_WAIVER_TEXT } from "@/lib/consent-text";
import { getMessages } from "@/i18n";

/**
 * Two separate, independently-required checkboxes — terms and the
 * withdrawal-right waiver — both unticked by default (PLAN.md Phase 1
 * point 6). The submit button's wording ("Order with obligation to pay")
 * is required under EU distance-selling rules; it must not say
 * "Continue" or "Confirm" (Appendix, "Checkout and pricing mechanics").
 */
export function CheckoutForm() {
  const { items, totalCents, removeItem } = useCart();
  const router = useRouter();
  const t = getMessages();

  const [email, setEmail] = useState("");
  // Billing details only — see t.checkout.billingHint below. Kept
  // separate from `email` (used for both delivery and login-free order
  // lookup) since they serve entirely different purposes.
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCountry, setCustomerCountry] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    items.length > 0 &&
    email.length > 0 &&
    customerName.length > 0 &&
    customerAddress.length > 0 &&
    customerCountry.length > 0 &&
    termsAccepted &&
    waiverAccepted;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          customerName,
          customerAddress,
          customerCountry,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          termsAccepted,
          withdrawalWaiverAccepted: waiverAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Self-heal a stale cart (PLAN.md non-negotiable: never guess or
        // retry blindly — but a productId the DB no longer has is not
        // something retrying fixes either). Drop exactly what the server
        // flagged and let the shopper resubmit with what's left, instead
        // of a dead-end error that never goes away on its own.
        if (Array.isArray(data.invalidProductIds) && data.invalidProductIds.length > 0) {
          for (const id of data.invalidProductIds) {
            removeItem(id);
          }
          setError(t.checkout.staleItemsRemoved);
        } else {
          setError(data.message ?? t.checkout.genericError);
        }
        return;
      }

      // Deliberately NOT clearing the cart here — the order exists and a
      // payment attempt is starting, but nothing is confirmed yet. If
      // this payment fails or is cancelled, the cart needs to still be
      // there so "Try again" (payment-failed page) actually has
      // something to retry. See MockPaymentContent's pay() for where
      // clear() actually happens — on confirmed payment, not before.
      router.push(data.checkoutUrl);
    } catch {
      setError(t.checkout.connectionError);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    // Removing the last stale item empties the cart as a side effect —
    // without this branch, the plain "cart is empty" message below would
    // silently replace the explanation of why, right as it's shown.
    if (error) {
      return (
        <div>
          <p role="alert" className="text-body-md text-danger">
            {error}
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex items-center text-secondary underline hover:text-primary"
          >
            {t.notFound.backToShop}
          </Link>
        </div>
      );
    }
    return <p className="text-body-md text-secondary">{t.checkout.emptyCart}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-6">
      <Input
        id="email"
        label={t.checkout.email}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      {/* Billing details — invoice only, per PLAN.md Phase 3.6 and the
          storefront owner's own instruction (2026-08-30): a compliant
          Belgian invoice needs a real customer identity, not just an
          email address. Never used for delivery. */}
      <div className="flex flex-col gap-3">
        <h2 className="text-title-sm text-on-surface">{t.checkout.billingTitle}</h2>
        <p className="text-body-md text-secondary">{t.checkout.billingHint}</p>
        <Input
          id="customer-name"
          label={t.checkout.fullName}
          type="text"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          autoComplete="name"
        />
        <Input
          id="customer-address"
          label={t.checkout.address}
          type="text"
          required
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          autoComplete="street-address"
        />
        <Select
          id="customer-country"
          label={t.checkout.country}
          required
          value={customerCountry}
          onChange={(e) => setCustomerCountry(e.target.value)}
          autoComplete="country"
        >
          <option value="" disabled>
            {t.checkout.countryPlaceholder}
          </option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </Select>
      </div>

      {/* PLAN.md, "Mobile is the primary device": 44px minimum tap target,
          especially these two — a consent checkbox that's hard to hit is
          one people mis-tap. The whole row is the label (clicking the
          text toggles the box too); the icon wrapper additionally gives
          the checkbox glyph itself a full 44x44 hit area, not just its
          visible ~16px square. */}
      <label htmlFor="terms" className="flex min-h-11 cursor-pointer items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-5 w-5 accent-secondary"
          />
        </span>
        <span className="text-body-md py-3 text-on-surface">
          {t.checkout.termsPrefix}
          <a
            href="/terms"
            className="text-secondary underline hover:text-primary"
            target="_blank"
            rel="noreferrer"
          >
            {t.checkout.termsLink}
          </a>
          {t.checkout.termsSuffix}
        </span>
      </label>

      <label
        htmlFor="withdrawal-waiver"
        className="flex min-h-11 cursor-pointer items-start gap-3"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center">
          <input
            id="withdrawal-waiver"
            type="checkbox"
            checked={waiverAccepted}
            onChange={(e) => setWaiverAccepted(e.target.checked)}
            className="h-5 w-5 accent-secondary"
          />
        </span>
        <span className="text-body-md py-3 text-on-surface">
          {WITHDRAWAL_WAIVER_TEXT}{" "}
          <a
            href="/withdrawal-waiver?lang=nl"
            className="text-secondary underline hover:text-primary"
            target="_blank"
            rel="noreferrer"
          >
            ({t.checkout.readInDutch})
          </a>
        </span>
      </label>

      {/* Informatieverplichtingen-toetsing.md, finding 2.2: the
          guideline requires the main product characteristics and total
          price to be shown immediately before the order button, without
          the shopper having to leave this page — before this, that list
          only existed on the separate /cart page the shopper had
          already moved past. */}
      <div>
        <h2 className="text-title-sm text-on-surface">{t.checkout.orderSummaryTitle}</h2>
        <ul className="mt-2 flex flex-col gap-1">
          {items.map((item) => (
            <li
              key={item.productId}
              className="text-body-md flex justify-between gap-4 text-on-surface"
            >
              <span>
                {item.title}
                {item.quantity > 1 ? ` × ${item.quantity}` : ""}
              </span>
              <span>{formatPriceCents(item.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-headline-md text-on-surface">
        {t.checkout.total(formatPriceCents(totalCents))}
      </p>

      {error && (
        <p role="alert" className="text-body-md text-danger">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={!canSubmit || submitting}>
        {submitting ? t.checkout.submitting : t.checkout.submit}
      </Button>
    </form>
  );
}
