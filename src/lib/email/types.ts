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
  | "order_awaiting_code";

export interface EmailMessage {
  to: string;
  template: EmailTemplate;
  orderId: string;
  /**
   * Whether this send includes a delivered key. Deliberately a boolean,
   * not the key itself — the provider layer must never receive, hold, or
   * log the raw value. The template renderer (not built yet) is the only
   * place allowed to read a key out of the database, and only at send time.
   */
  includesKey: boolean;
}

export interface EmailSendResult {
  sent: boolean;
  providerMessageId?: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
}
