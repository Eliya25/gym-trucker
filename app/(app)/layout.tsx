import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-5">
            <Link
              href="/workouts"
              className="text-lg font-bold text-emerald-400"
            >
              🏋️ יומן אימונים
            </Link>
            <Link
              href="/workouts"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              אימונים
            </Link>
            <Link
              href="/templates"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              תוכניות
            </Link>
            <Link
              href="/exercises"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              תרגילים
            </Link>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-500 transition-colors hover:text-red-400"
            >
              התנתק
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24">
        {children}
      </main>
    </>
  );
}
