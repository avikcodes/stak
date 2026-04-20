"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { AuthBootstrap } from "./auth-bootstrap";
import { cn } from "@/lib/utils";

const dashboardRoutes = new Set(["/dashboard", "/queue", "/history", "/settings"]);

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showMarketingChrome = pathname === "/";
  const showDashboardShell = dashboardRoutes.has(pathname);

  return (
    <div
      className={cn(
        "min-h-screen",
        showMarketingChrome &&
          "bg-[var(--background)] text-[var(--foreground)]",
        showDashboardShell &&
          "bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_srgb,var(--background)_88%,white)_100%)] text-[var(--foreground)]"
      )}
    >
      <AuthBootstrap />
      {showMarketingChrome ? <SiteHeader /> : null}
      {children}
    </div>
  );
}
