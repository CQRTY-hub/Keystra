"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function OrderLookupForm() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setNotFound(false);

    try {
      const res = await fetch("/api/order-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      });
      const data = await res.json();

      if (data.found) {
        router.push(`/order/confirmation/${data.orderId}`);
      } else {
        setNotFound(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <Input
        id="order-id"
        label="Bestelnummer"
        required
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
      />
      <Input
        id="lookup-email"
        label="E-mailadres"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      {notFound && (
        <p role="alert" className="text-sm text-red-700">
          Geen bestelling gevonden met deze combinatie.
        </p>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Bezig..." : "Zoeken"}
      </Button>
    </form>
  );
}
