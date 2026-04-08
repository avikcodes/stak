import Link from "next/link";
import { Card } from "@/components/ui";
import { clsx } from "clsx";

type NavItem = Readonly<{
  href: string;
  label: string;
}>;

type PlaceholderPageProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  links?: NavItem[];
  className?: string;
}>;

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  links = [],
  className,
}: PlaceholderPageProps) {
  return (
    <section className={clsx("w-full max-w-3xl space-y-6", className)}>
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
          {description}
        </p>
      </div>
      <Card>
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--foreground)]">
            Routes
          </p>
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}
