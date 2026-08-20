import type { Metadata } from "next";
import { MockPaymentContent } from "@/components/shop/MockPaymentContent";

export const metadata: Metadata = {
  title: "Mock payment",
  robots: { index: false, follow: false },
};

export default function MockPaymentPage() {
  return <MockPaymentContent />;
}
