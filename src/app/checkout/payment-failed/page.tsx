import type { Metadata } from "next";
import { PaymentFailedContent } from "@/components/shop/PaymentFailedContent";

export const metadata: Metadata = {
  title: "Payment failed",
  robots: { index: false, follow: false },
};

export default function PaymentFailedPage() {
  return <PaymentFailedContent />;
}
