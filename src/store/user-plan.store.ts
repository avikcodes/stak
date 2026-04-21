import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlanType = "free" | "pro";

export type UserPlanState = Readonly<{
  plan: PlanType;
}>;

export type UserPlanActions = Readonly<{
  setPlan: (plan: PlanType) => void;
  upgradeToPro: () => void;
}>;

export type UserPlanStore = UserPlanState & UserPlanActions;

export const useUserPlanStore = create<UserPlanStore>()(
  persist(
    (set) => ({
      plan: "free",
      setPlan: (plan) => set({ plan }),
      upgradeToPro: () => set({ plan: "pro" }),
    }),
    {
      name: "stak-user-plan",
    }
  )
);

export function isSubscribed(plan: PlanType): boolean {
  return plan === "pro";
}