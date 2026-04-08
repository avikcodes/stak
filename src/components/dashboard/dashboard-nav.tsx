import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/queue", label: "Queue" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
] as const;

export function DashboardNav() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_20px_60px_rgba(18,18,18,0.06)] backdrop-blur">
      <p className="px-2 pb-3 text-xs font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
        Dashboard
      </p>
      <nav className="grid gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
