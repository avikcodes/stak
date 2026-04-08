import Link from "next/link";
import { ArrowRight, CheckCircle2, Plus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const activityItems = [
  {
    title: "Landing page stack drafted",
    meta: "Today - 10:24 AM",
    tone: "ready",
    avatar: "LP",
  },
  {
    title: "Queue processing resumed",
    meta: "13 min ago - In progress",
    tone: "active",
    avatar: "QP",
  },
  {
    title: "Billing rules reviewed",
    meta: "Yesterday - Needs approval",
    tone: "pending",
    avatar: "BR",
  },
  {
    title: "Shared component library updated",
    meta: "Yesterday - Completed",
    tone: "ready",
    avatar: "UI",
  },
] as const;

const quickActions = [
  "Start blank stack",
  "Import from template",
  "Open queue view",
  "Review drafts",
] as const;

const previewRows = [
  "Stack name: Launch ready",
  "Sources: 4 connected",
  "Status: Approved for queue",
  "Owner: Stak Studio",
] as const;

function TonePill({ tone }: { tone: (typeof activityItems)[number]["tone"] }) {
  const styles = {
    ready: "bg-[rgba(16,185,129,0.12)] text-[#047857]",
    active: "bg-[rgba(59,130,246,0.12)] text-[#1d4ed8]",
    pending: "bg-[rgba(245,158,11,0.14)] text-[#92400e]",
  } as const;

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", styles[tone])}>
      {tone === "ready" ? "Ready" : tone === "active" ? "In progress" : "Pending"}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(248,250,252,0.72))] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-[linear-gradient(135deg,rgba(15,19,28,0.92),rgba(12,17,26,0.76))] sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            New Stack
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            A calm workspace for creating, reviewing, and sending stacks through
            the queue without visual noise.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/history"
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-white/70 px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--border)] hover:bg-white dark:bg-white/5 dark:hover:bg-white/[0.08]"
          >
            Preview
          </Link>
          <Link
            href="/queue"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] shadow-[0_12px_30px_rgba(18,18,18,0.15)] transition hover:scale-[1.01] hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Create Stack
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
                Activity
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                Recent Stacks
              </h2>
            </div>
            <span className="text-xs text-[var(--muted)]">Updated moments ago</span>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="divide-y divide-[var(--border)]">
              {activityItems.map((item) => (
                <Link
                  key={item.title}
                  href="/queue"
                  className="flex items-start gap-3 px-5 py-4 transition hover:bg-[rgba(255,255,255,0.62)] dark:hover:bg-white/5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e2e8f0,#f8fafc)] text-xs font-semibold text-[#0f172a] shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                    {item.avatar}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate text-sm font-medium text-[var(--foreground)]">
                        {item.title}
                      </h3>
                      <TonePill tone={item.tone} />
                    </div>
                    <p className="text-xs text-[var(--muted)]">{item.meta}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
                Snapshot
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                Workspace health
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-white/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] dark:bg-white/5">
                <p className="text-xs text-[var(--muted)]">Stacks used</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">2/3</p>
              </div>
              <div className="rounded-[22px] bg-white/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] dark:bg-white/5">
                <p className="text-xs text-[var(--muted)]">Queue depth</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">08</p>
              </div>
            </div>
          </Card>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
                Workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                Start New Stack
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
                Compose a new stack, review the draft, and move it into the queue
                with one clean flow.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/queue"
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-white/70 px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--border)] hover:bg-white dark:bg-white/5 dark:hover:bg-white/[0.08]"
              >
                Open queue
              </Link>
              <Link
                href="/queue"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] shadow-[0_12px_30px_rgba(18,18,18,0.15)] transition hover:scale-[1.01] hover:opacity-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                Create stack
              </Link>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <Link
              href="/queue"
              className="group overflow-hidden rounded-[32px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(17,24,39,0.96),rgba(31,41,55,0.9))] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] transition hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                    <Sparkles className="h-3.5 w-3.5" />
                    Start New Stack
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    Create a polished starting point
                  </h3>
                  <p className="max-w-md text-sm leading-6 text-white/70">
                    Set up a new stack, keep the flow focused, and move straight
                    into review without any noise.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-white transition group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  Template ready
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  Auto-save on
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  Queue connected
                </span>
              </div>
            </Link>

            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
                    Quick Actions
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    Actions
                  </h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--muted)] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  4 shortcuts
                </span>
              </div>

              <div className="grid gap-2">
                {quickActions.map((action, index) => {
                  const href =
                    index === 0
                      ? "/dashboard"
                      : index === 1
                        ? "/settings"
                        : index === 2
                          ? "/queue"
                          : "/history";

                  return (
                    <Link
                    key={action}
                      href={href}
                      className="flex items-center justify-between rounded-[22px] border border-transparent bg-white/70 px-4 py-3 text-sm text-[var(--foreground)] shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[var(--border)] hover:bg-white dark:bg-white/5 dark:hover:bg-white/[0.08]"
                    >
                      <span>{action}</span>
                      <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
                  Draft Preview
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                  Clean preview state
                </h3>
              </div>
              <span className="rounded-full bg-[rgba(16,185,129,0.12)] px-3 py-1 text-xs font-medium text-[#047857]">
                Auto-saved
              </span>
            </div>
            <div className="rounded-[28px] bg-[linear-gradient(180deg,#0f172a,#111827)] p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>draft.tsx</span>
                <span>v0.8</span>
              </div>
              <div className="mt-4 space-y-3 font-mono text-[13px] leading-6 text-white/85">
                {previewRows.map((row) => (
                  <div key={row} className="flex gap-3">
                    <span className="text-white/35">-</span>
                    <span>{row}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
