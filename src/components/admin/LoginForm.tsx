"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginPassword, type LoginActionState } from "@/lib/actions/admin-auth-actions";
import { getMessages } from "@/i18n";

const initialState: LoginActionState = { error: null };

export function LoginForm() {
  const t = getMessages();
  const [state, formAction, pending] = useActionState(loginPassword, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <Input id="email" name="email" type="email" label={t.admin.login.email} required autoFocus />
      <Input
        id="password"
        name="password"
        type="password"
        label={t.admin.login.password}
        required
        autoComplete="current-password"
      />
      {state.error && (
        <p role="alert" className="text-body-md text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? t.admin.login.submitting : t.admin.login.submit}
      </Button>
    </form>
  );
}
