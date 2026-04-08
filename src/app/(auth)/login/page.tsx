"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();

  return (
    <section className="w-full max-w-3xl space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
          Authentication
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Login
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
          Placeholder login route for Stak.
        </p>
      </div>
      <Card>
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--foreground)]">Routes</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Dashboard
            </button>
          </div>
        </div>
      </Card>
    </section>
  );
}
