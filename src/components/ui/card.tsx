import { cn } from "@/lib/utils";

type CardProps = Readonly<{
  className?: string;
  children: React.ReactNode;
}>;

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(18,18,18,0.06)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
