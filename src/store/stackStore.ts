import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Stack, StackHistoryEntry } from "@/types/stack";

export type StackStoreState = Readonly<{
  stacks: Stack[];
  currentStack: Stack | null;
  history: StackHistoryEntry[];
}>;

export type StackStoreActions = Readonly<{
  createStack: (stack: Stack) => void;
  duplicateStack: (stack: Stack) => Stack;
  setStacks: (stacks: Stack[]) => void;
  updateStack: (id: string, data: Partial<Stack>) => void;
  deleteStack: (id: string) => void;
  setCurrentStack: (stack: Stack | null) => void;
  restoreHistoryEntry: (entry: StackHistoryEntry) => void;
}>;

export type StackStore = StackStoreState & StackStoreActions;

export const initialStackStoreState: StackStoreState = {
  stacks: [],
  currentStack: null,
  history: [],
};

function createHistoryEntry(stack: Stack): StackHistoryEntry {
  return {
    id: stack.id,
    title: stack.title,
    drafts: stack.drafts,
    createdAt: new Date(),
  };
}

function stackFromHistoryEntry(entry: StackHistoryEntry): Stack {
  const platformValues = Array.from(new Set(entry.drafts.map((draft) => draft.platform)));
  const inputContent = entry.drafts.map((draft) => draft.content).join("\n\n");

  return {
    id: entry.id,
    title: entry.title,
    inputContent,
    platforms: platformValues,
    tone: "professional",
    brandVoice: "",
    drafts: entry.drafts,
    status: "draft",
    createdAt: entry.createdAt,
  };
}

function cloneDraftsForReuse(stack: Stack, stackId: string): Stack["drafts"] {
  return stack.drafts.map((draft, index) => ({
    ...draft,
    id: `${stackId}-draft-${index + 1}`,
  }));
}

function duplicateStackWithNewIds(stack: Stack): Stack {
  const id = `stack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date();
  const drafts = cloneDraftsForReuse(stack, id);

  return {
    ...stack,
    id,
    title: `${stack.title} Copy`,
    drafts,
    status: "draft",
    createdAt,
  };
}

export const useStackStore = create<StackStore>()(
  persist(
    (set) => ({
      ...initialStackStoreState,
      createStack: (stack) =>
        set((state) => ({
          stacks: [...state.stacks, stack],
          history: [...state.history, createHistoryEntry(stack)],
        })),
      duplicateStack: (stack) => {
        const duplicate = duplicateStackWithNewIds(stack);

        set((state) => ({
          stacks: [...state.stacks, duplicate],
          history: [...state.history, createHistoryEntry(duplicate)],
          currentStack: duplicate,
        }));

        return duplicate;
      },
      setStacks: (stacks) => set({ stacks }),
      updateStack: (id, data) =>
        set((state) => {
          const updatedStacks = state.stacks.map((stack) =>
            stack.id === id ? { ...stack, ...data } : stack
          );
          const updatedStack = updatedStacks.find((stack) => stack.id === id);

          return {
            stacks: updatedStacks,
            currentStack:
              state.currentStack?.id === id
                ? { ...state.currentStack, ...data }
                : state.currentStack,
            history: updatedStack
              ? [...state.history, createHistoryEntry(updatedStack)]
              : state.history,
          };
        }),
      deleteStack: (id) =>
        set((state) => ({
          stacks: state.stacks.filter((stack) => stack.id !== id),
          currentStack: state.currentStack?.id === id ? null : state.currentStack,
          history: state.history.filter((entry) => entry.id !== id),
        })),
      setCurrentStack: (stack) => set({ currentStack: stack }),
      restoreHistoryEntry: (entry) =>
        set((state) => {
          const restoredStack = stackFromHistoryEntry(entry);
          const nextStacks = state.stacks.some((stack) => stack.id === restoredStack.id)
            ? state.stacks.map((stack) =>
                stack.id === restoredStack.id ? restoredStack : stack
              )
            : [...state.stacks, restoredStack];

          return {
            stacks: nextStacks,
            currentStack: restoredStack,
          };
        }),
    }),
    {
      name: "stak-stack-store",
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if (key === "createdAt" && typeof value === "string") {
            return new Date(value);
          }

          return value;
        },
      }),
      partialize: (state) => ({
        stacks: state.stacks,
        currentStack: state.currentStack,
        history: state.history,
      }),
    }
  )
);
