import { logEvent } from "@/lib/event-log";
import type { EmailMessage, EmailProvider, EmailSendResult } from "./types";

/**
 * Doesn't send anything. Logs what would have been sent — metadata only,
 * never a key value, never even the presence of one beyond the boolean
 * already on EmailMessage — so the checkout flow can be built and tested
 * end to end before a real provider (Resend/Postmark, Phase 3.6) exists.
 */
export class MockEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<EmailSendResult> {
    await logEvent({
      orderId: message.template === "admin_alert" ? undefined : message.orderId,
      eventType: "email.send_attempted",
      payload:
        message.template === "admin_alert"
          ? { to: message.to, template: message.template, subject: message.subject, provider: "mock" }
          : {
              to: message.to,
              template: message.template,
              includesKey: message.includesKey,
              provider: "mock",
            },
    });

    return { sent: true, providerMessageId: `mock_email_${Date.now()}` };
  }
}
