import type { Metadata } from "next";
import { PaymentFailedContent } from "@/components/shop/PaymentFailedContent";
import { getMessages } from "@/i18n";

export const metadata: Metadata = {
  title: getMessages().pageTitles.paymentFailed,
  robots: { index: false, follow: false },
};

export default function PaymentFailedPage() {
  return <PaymentFailedContent />;
}
