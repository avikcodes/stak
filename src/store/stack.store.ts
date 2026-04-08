import { create } from "zustand";

export type StackInput = Readonly<{
  title: string;
  description: string;
  source: string;
}>;

export type StackOutput = Readonly<{
  id: string;
  label: string;
  value: string;
}>;

export type StackState = Readonly<{
  input: StackInput;
  outputs: StackOutput[];
  activeStackId: string | null;
}>;

export type StackActions = Readonly<{
  setInput: (input: Partial<StackInput>) => void;
  setOutputs: (outputs: StackOutput[]) => void;
  setActiveStackId: (stackId: string | null) => void;
  resetStack: () => void;
}>;

export type StackStore = StackState & StackActions;

export const initialStackInput: StackInput = {
  title: "",
  description: "",
  source: "",
};

export const initialStackState: StackState = {
  input: initialStackInput,
  outputs: [],
  activeStackId: null,
};

export const useStackStore = create<StackStore>((set) => ({
  ...initialStackState,
  setInput: (input) =>
    set((state) => ({
      input: {
        ...state.input,
        ...input,
      },
    })),
  setOutputs: (outputs) => set({ outputs }),
  setActiveStackId: (activeStackId) => set({ activeStackId }),
  resetStack: () => set(initialStackState),
}));
