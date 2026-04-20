import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const MONTHLY_LIMIT = 50;

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function shouldReset(lastResetDate: string | null): boolean {
  if (!lastResetDate) return true;
  const currentMonth = getMonthKey(new Date());
  return lastResetDate !== currentMonth;
}

export type UsageState = Readonly<{
  usedStacks: number;
  lastResetDate: string | null;
}>;

export type UsageActions = Readonly<{
  incrementUsage: () => void;
  resetUsage: () => void;
  checkAndReset: () => void;
}>;

export type UsageStore = UsageState & UsageActions;

const initialState: UsageState = {
  usedStacks: 0,
  lastResetDate: null,
};

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      incrementUsage: () =>
        set((state) => ({
          usedStacks: state.usedStacks + 1,
        })),
      resetUsage: () =>
        set({
          usedStacks: 0,
          lastResetDate: getMonthKey(new Date()),
        }),
      checkAndReset: () => {
        const { lastResetDate, resetUsage } = get();
        if (shouldReset(lastResetDate)) {
          resetUsage();
        }
      },
    }),
    {
      name: "stak-usage-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usedStacks: state.usedStacks,
        lastResetDate: state.lastResetDate,
      }),
    }
  )
);

export function useStackUsage() {
  const usedStacks = useUsageStore((state) => state.usedStacks);
  const checkAndReset = useUsageStore((state) => state.checkAndReset);

  checkAndReset();

  return {
    usedStacks,
    totalLimit: MONTHLY_LIMIT,
    canCreate: usedStacks < MONTHLY_LIMIT,
  };
}
