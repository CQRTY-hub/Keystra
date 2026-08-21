import type { Metadata } from "next";
import { MockPaymentContent } from "@/components/shop/MockPaymentContent";
import { getMessages } from "@/i18n";

export const metadata: Metadata = {
  title: getMessages().pageTitles.mockPayment,
  robots: { index: false, follow: false },
};

export default function MockPaymentPage() {
  return <MockPaymentContent />;
}
