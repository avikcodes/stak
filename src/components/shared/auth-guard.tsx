"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useUserPlanStore, isSubscribed } from "@/store/user-plan.store";

type AuthGuardProps = Readonly<{
  children: ReactNode;
}>;

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/paywall"]);

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);
  const plan = useUserPlanStore((state) => state.plan);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (PUBLIC_PATHS.has(pathname)) {
      return;
    }

    if (status !== "authenticated") {
      router.replace("/login");
      return;
    }

    if (!isSubscribed(plan)) {
      router.replace("/paywall");
    }
  }, [status, plan, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  if (!isSubscribed(plan)) {
    return null;
  }

  return <>{children}</>;
}