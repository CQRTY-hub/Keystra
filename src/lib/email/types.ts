/**
 * Same stub pattern as fulfillment and payments. Phase 3.6 drops in a
 * real transactional provider (Resend/Postmark) behind this interface —
 * the call sites (order confirmation, order held/refunded) should not
 * need to change.
 *
 * Never pass a raw key value into `EmailMessage` fields that get logged.
 * See MockEmailProvider — it logs metadata about a send, never the key.
 */

export type EmailTemplate =
  | "order_confirmation"
  | "order_held"
  | "order_refunded"
  | "order_awaiting_code"
  | "admin_alert";

/**
 * A discriminated union rather than one flat shape with optional fields:
 * order emails and the admin-alert email genuinely carry different data
 * (an order email is always about one Order and never includes free
 * text; an alert — e.g. a circuit breaker tripping, PLAN.md Phase 3.5 —
 * has no order to point at and is exactly free text). Keeping them
 * separate means `orderId`/`includesKey` stay required for every order
 * template instead of quietly becoming optional everywhere.
 */
export type EmailMessage =
  | {
      to: string;
      template: "order_confirmation" | "order_held" | "order_refunded" | "order_awaiting_code";
      orderId: string;
      /**
       * Whether this send includes a delivered key. Deliberately a
       * boolean, not the key itself — the provider layer must never
       * receive, hold, or log the raw value. The template renderer (not
       * built yet) is the only place allowed to read a key out of the
       * database, and only at send time.
       */
      includesKey: boolean;
      /**
       * Whether this send should attach the order's invoice PDF — same
       * boolean-flag reasoning as includesKey, and the same "resolved at
       * send time, not here" split: the PDF itself already exists by
       * this point (src/lib/invoicing, issued at payment confirmation),
       * but attaching bytes to an email is the real provider's job
       * (Phase 3.6, not built yet — MockEmailProvider only logs this
       * flag). False whenever issueInvoiceForOrder() skipped issuing one
       * (e.g. an order placed before checkout captured billing details).
       */
      includesInvoice: boolean;
    }
  | {
      to: string;
      template: "admin_alert";
      subject: string;
      body: string;
    };

export interface EmailSendResult {
  sent: boolean;
  providerMessageId?: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
}
