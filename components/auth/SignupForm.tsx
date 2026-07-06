"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: AuthFormState = { error: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">הרשמה</h1>
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
          autoComplete="new-password"
          dir="ltr"
          minLength={6}
          required
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "נרשם..." : "הירשם"}
      </Button>
      <p className="text-sm text-zinc-500">
        כבר יש לך חשבון?{" "}
        <Link href="/login" className="text-emerald-600 hover:underline">
          התחבר כאן
        </Link>
      </p>
    </form>
  );
}
