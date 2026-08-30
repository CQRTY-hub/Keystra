"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginTotp, type LoginActionState } from "@/lib/actions/admin-auth-actions";
import { getMessages } from "@/i18n";

const initialState: LoginActionState = { error: null };

export function VerifyForm() {
  const t = getMessages();
  const [state, formAction, pending] = useActionState(loginTotp, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <Input
        id="code"
        name="code"
        type="text"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        autoComplete="one-time-code"
        label={t.admin.verify.code}
        required
        autoFocus
      />
      {state.error && (
        <p role="alert" className="text-body-md text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? t.admin.verify.submitting : t.admin.verify.submit}
      </Button>
    </form>
  );
}
