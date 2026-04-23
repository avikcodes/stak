"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useUserPlanStore, isSubscribed } from "@/store/user-plan.store";

type AuthGuardProps = Readonly<{
  children: ReactNode;
}>;

const isDev = true; // 🔥 FORCE DEV MODE
const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/paywall"]);

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);
  const plan = useUserPlanStore((state) => state.plan);

useEffect(() => {
  if (status === "loading") return;

  if (PUBLIC_PATHS.has(pathname)) return;

  if (status !== "authenticated") {
    router.replace("/login");
    return;
  }

  // 🚀 DEV BYPASS — MUST RETURN HERE
  if (isDev) {
    console.log("DEV MODE: skipping paywall");
    return;
  }

  if (!plan || !isSubscribed(plan)) {
    router.replace("/paywall");
  }
}, [status, plan, pathname, router]);

if (status === "loading") return null;

if (status !== "authenticated") return null;

// 🚀 DEV BYPASS
if (isDev) return <>{children}</>;

if (!plan || !isSubscribed(plan)) return null;

return <>{children}</>;