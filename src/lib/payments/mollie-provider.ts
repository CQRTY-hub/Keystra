import createMollieClient, { Locale, PaymentMethod } from "@mollie/api-client";
import { centsToDecimalString } from "@/lib/currency";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GetPaymentResult,
  PaymentProvider,
  PaymentStatus,
} from "./types";

/**
 * Real Mollie integration (Phase 3), built against Mollie's own docs
 * (docs.mollie.com) and the official @mollie/api-client. Runs against
 * Mollie's TEST mode for now — that's controlled entirely by which API
 * key is in MOLLIE_API_KEY (a "test_..." key), never by anything in this
 * file. Switching to live is: paste a "live_..." key in .env.local. Never
 * done by editing code.
 *
 * ## Payment methods
 * Bancontact, iDEAL, credit/debit cards, and PayPal — the storefront
 * owner's explicit list. Passed as an array to `method`, which shows
 * Mollie's normal hosted method-selection screen but restricted to just
 * these four, rather than every method on the account.
 *
 * ## 3D Secure
 * Not a parameter anywhere in the Payments API — for card payments made
 * through Mollie's hosted Checkout (what createPayment() below uses,
 * via payment.getCheckoutUrl()), Mollie's acquiring itself runs 3D Secure
 * / SCA step-up automatically wherever the card issuer or PSD2 requires
 * it. That's the built-in behaviour of hosted Checkout, not something to
 * switch on — it would only need explicit handling if this integration
 * embedded Mollie Components (tokenised card fields) directly on our own
 * checkout page instead, which it doesn't. Worth a quick look in the
 * Mollie dashboard's payment-method settings once the account exists, but
 * there's no code-level toggle to set here.
 *
 * ## Idempotency / webhook trust
 * Mollie webhooks carry no signature — the body is just `id=tr_xxx`
 * (application/x-www-form-urlencoded). The only trustworthy source of
 * truth is re-fetching the payment from Mollie's own API with our API
 * key, which is exactly what getPayment() below does. See
 * src/app/api/webhooks/mollie/route.ts for how the result is used, and
 * src/lib/webhooks.ts (decideWebhookAction) for the separate,
 * already-tested guard against processing the same order twice.
 *
 * ## customerPaymentEmail (the fraud signal)
 * "The email Mollie actually charged" only exists for some methods.
 * PayPal payments report the PayPal account's email in
 * `payment.details.consumerAccount`. iDEAL and Bancontact report an IBAN
 * in that same field instead — not an email, so it's never reported as
 * one (checked with a plain email-shape test below rather than trusting
 * the method name, since Mollie's own field names for this are not
 * fully consistent across methods and card payments have no equivalent
 * field at all). This matches PLAN.md's framing exactly: "zodra Mollie
 * dat adres levert" (as soon as Mollie provides it) — for card and most
 * iDEAL/Bancontact payments, it simply won't be there, and
 * RiskAssessmentInput.customerPaymentEmail stays undefined, same as
 * today.
 */

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PAYMENT_METHODS = [
  PaymentMethod.bancontact,
  PaymentMethod.ideal,
  PaymentMethod.creditcard,
  PaymentMethod.paypal,
];

function mollieClient() {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MOLLIE_API_KEY is not set. Add it to .env.local (a test_... key from the Mollie dashboard) — see .env.example."
    );
  }
  return createMollieClient({ apiKey });
}

export class MollieProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const client = mollieClient();

    const payment = await client.payments.create({
      amount: {
        currency: input.currency,
        value: centsToDecimalString(input.amountCents),
      },
      description: input.description,
      redirectUrl: input.redirectUrl,
      cancelUrl: input.cancelUrl,
      webhookUrl: input.webhookUrl,
      method: [...PAYMENT_METHODS],
      // Belgian business, English-language storefront. This client's
      // Locale enum has no en_BE (the docs list one for the raw API, but
      // this SDK version's types don't expose it) — en_GB is the closest
      // fit for an English-language checkout in the EU.
      locale: Locale.en_GB,
      metadata: { orderId: input.orderId },
    });

    const checkoutUrl = payment.getCheckoutUrl();
    if (!checkoutUrl) {
      // Only expected for recurring/Apple Pay payments per Mollie's docs
      // — neither applies here, so a missing checkout URL means
      // something is actually wrong, not a case to paper over.
      throw new Error(
        `Mollie payment ${payment.id} was created without a checkout URL.`
      );
    }

    return { molliePaymentId: payment.id, checkoutUrl };
  }

  async getPayment(molliePaymentId: string): Promise<GetPaymentResult> {
    const client = mollieClient();
    // Deliberately not wrapped in try/catch here — the webhook route
    // treats a fetch failure (including "payment not found") as an
    // invalid webhook and responds 400, which is correct: unlike a
    // status this app doesn't handle yet, this means the payment ID
    // itself doesn't check out against Mollie's own records.
    const payment = await client.payments.get(molliePaymentId);

    return {
      status: toPaymentStatus(payment.status),
      payerEmail: extractPayerEmail(payment.details),
    };
  }
}

function toPaymentStatus(mollieStatus: string): PaymentStatus {
  switch (mollieStatus) {
    case "paid":
    case "authorized":
    case "failed":
    case "expired":
    case "canceled":
    case "open":
    case "pending":
      return mollieStatus;
    default:
      // Never silently treated as paid — see the route's own handling
      // of "unknown".
      return "unknown";
  }
}

/**
 * `details` is a different shape per payment method and untyped as
 * `Record<string, unknown> | undefined` by the client (Mollie's API
 * itself doesn't document a single shared schema for it — see this
 * file's header comment). `consumerAccount` is the one field that, for
 * PayPal specifically, is an email address; for other methods it's
 * something else entirely (an IBAN) or absent. Testing its shape rather
 * than branching on the method name keeps this correct even if Mollie
 * adds a method later with the same field holding an email.
 */
function extractPayerEmail(details: unknown): string | undefined {
  if (!details || typeof details !== "object") return undefined;
  const consumerAccount = (details as Record<string, unknown>).consumerAccount;
  if (typeof consumerAccount === "string" && EMAIL_SHAPE.test(consumerAccount)) {
    return consumerAccount;
  }
  return undefined;
}
