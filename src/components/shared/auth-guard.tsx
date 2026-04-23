"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useUserPlanStore, isSubscribed } from "@/store/user-plan.store";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);
  const plan = useUserPlanStore((state) => state.plan);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      router.replace("/login");
      return;
    }

    if (plan && !isSubscribed(plan)) {
      router.replace("/paywall");
    }
  }, [status, plan, pathname, router]);

  if (status === "loading") return null;
  if (status !== "authenticated") return null;
  if (plan && !isSubscribed(plan)) return null;

  return <>{children}</>;
}