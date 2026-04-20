"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  Layers3,
  Menu,
  Plus,
  Settings2,
  Clock3,
} from "lucide-react";
import { Card } from "@/components/ui";
import { signOut } from "@/features/auth/auth";
import { useAuthStore, useStackUsage } from "@/store";
import { cn } from "@/lib/utils";

type NavItem = Readonly<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}>;

const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "New Stack", icon: Plus },
  { href: "/queue", label: "Queue", icon: Layers3 },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

const footerNav: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings2 },
];

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const router = useRouter();
  const active =
    pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <button
      type="button"
      onClick={() => router.push(item.href)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition",
        active
          ? "bg-white text-[var(--foreground)] shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
          : "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--foreground)]"
      )}
    >
      <item.icon
        className={cn(
          "h-4 w-4 shrink-0 transition",
          active ? "text-[var(--foreground)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"
        )}
      />
      <span className="flex-1">{item.label}</span>
    </button>
  );
}

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const resetAuth = useAuthStore((state) => state.resetAuth);
  const { usedStacks, totalLimit } = useStackUsage();

  const currentTitle = useMemo(() => {
    if (pathname === "/queue") return "Queue";
    if (pathname === "/history") return "History";
    if (pathname === "/settings") return "Settings";
    return "New Stack";
  }, [pathname]);

  const userLabel = user?.email ?? "Account";
  const userInitials = useMemo(() => {
    const source = user?.email ?? "A";
    return source
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "A";
  }, [user?.email]);

  async function handleLogout() {
    await signOut();
    resetAuth();
    router.push("/login");
  }

  return (
    <div className="min-h-[calc(100vh-0px)] bg-[#f5f3ee] text-[var(--foreground)] dark:bg-[#0a0d14]">
      <div className="mx-auto flex w-full max-w-[1600px] gap-0 px-3 py-3 sm:px-4 sm:py-4 lg:h-screen lg:overflow-hidden">
        <aside className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:pr-3">
          <div className="flex h-full w-full flex-col rounded-[30px] border border-[var(--border)] bg-[color:rgba(255,255,255,0.84)] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:bg-[color:rgba(15,19,28,0.78)]">
            <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--foreground)] text-sm font-semibold text-[var(--background)] shadow-[0_12px_26px_rgba(15,23,42,0.16)]">
                S
              </span>
              <div>
                <p className="text-sm font-semibold tracking-[0.2em]">STAK</p>
                <p className="text-xs text-[var(--muted)]">Workspace</p>
              </div>
            </Link>

            <div className="mt-6 grid gap-1">
              {primaryNav.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </div>

            <div className="mt-auto space-y-3 pt-6">
              <div className="h-px bg-[var(--border)]" />
              <div className="grid gap-1">
                {footerNav.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
          <div className="lg:hidden">
            <Card className="flex items-center justify-between rounded-[28px] px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen((open) => !open)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-[var(--foreground)] shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-sm font-semibold tracking-[0.2em]">STAK</p>
                  <p className="text-xs text-[var(--muted)]">{currentTitle}</p>
                </div>
              </div>
              <Link
                href="/history"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                <Bell className="h-4 w-4" />
              </Link>
            </Card>
          </div>

          <div className="hidden items-center justify-end gap-3 lg:flex">
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--muted)] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                Usage: {usedStacks} / {totalLimit} stacks
              </div>
              <Link
                href="/history"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                <Bell className="h-4 w-4" />
              </Link>
              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[var(--border)] bg-white px-2 py-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dbeafe,#bae6fd)] text-xs font-semibold text-[#0f172a]">
                    {userInitials}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
                </summary>
                <div className="absolute right-0 top-[calc(100%+10px)] z-10 w-56 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dbeafe,#bae6fd)] text-xs font-semibold text-[#0f172a]">
                      {userInitials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">
                        {userLabel}
                      </p>
                      <p className="text-xs text-[var(--muted)]">Workspace menu</p>
                    </div>
                  </div>
                  <Link className="block rounded-2xl px-3 py-2 text-sm hover:bg-white" href="/settings">
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-2xl px-3 py-2 text-left text-sm hover:bg-white"
                  >
                    Sign out
                  </button>
                </div>
              </details>
            </div>
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto rounded-[32px] border border-[var(--border)] bg-[color:rgba(255,255,255,0.78)] shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:bg-[color:rgba(15,19,28,0.72)]">
            <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] p-3">
            <div className="flex h-full flex-col rounded-[30px] border border-[var(--border)] bg-[color:rgba(255,255,255,0.92)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
              <div className="flex items-center justify-between px-2 py-2">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--foreground)] text-sm font-semibold text-[var(--background)]">
                    S
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-[0.2em]">STAK</p>
                    <p className="text-xs text-[var(--muted)]">Workspace</p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-xs"
                >
                  Close
                </button>
              </div>
              <div className="mt-5 grid gap-1">
                {primaryNav.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
              <div className="mt-auto space-y-3 pt-6">
                <div className="h-px bg-[var(--border)]" />
                <div className="grid gap-1">
                  {footerNav.map((item) => (
                    <NavLink key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
