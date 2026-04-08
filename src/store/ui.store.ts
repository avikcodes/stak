import { create } from "zustand";

export type ModalState = Readonly<{
  createStack: boolean;
  deleteStack: boolean;
  settings: boolean;
}>;

export type UIState = Readonly<{
  loading: boolean;
  sidebarOpen: boolean;
  modals: ModalState;
}>;

export type UIActions = Readonly<{
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setModal: (modal: keyof ModalState, open: boolean) => void;
  resetUI: () => void;
}>;

export type UIStore = UIState & UIActions;

export const initialModalState: ModalState = {
  createStack: false,
  deleteStack: false,
  settings: false,
};

export const initialUIState: UIState = {
  loading: false,
  sidebarOpen: false,
  modals: initialModalState,
};

export const useUIStore = create<UIStore>((set) => ({
  ...initialUIState,
  setLoading: (loading) => set({ loading }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setModal: (modal, open) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modal]: open,
      },
    })),
  resetUI: () => set(initialUIState),
}));
