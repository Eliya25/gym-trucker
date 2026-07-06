"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: AuthFormState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">התחברות</h1>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          אימייל
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          dir="ltr"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          סיסמה
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          required
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "מתחבר..." : "התחבר"}
      </Button>
      <p className="text-sm text-zinc-500">
        אין לך חשבון?{" "}
        <Link href="/signup" className="text-emerald-600 hover:underline">
          הירשם כאן
        </Link>
      </p>
    </form>
  );
}
