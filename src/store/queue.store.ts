import { create } from "zustand";

export type QueueItem = Readonly<{
  id: string;
  title: string;
  status: "queued" | "processing" | "complete";
  createdAt: string;
}>;

export type QueueState = Readonly<{
  items: QueueItem[];
  selectedItemId: string | null;
  filter: "all" | "queued" | "processing" | "complete";
}>;

export type QueueActions = Readonly<{
  setItems: (items: QueueItem[]) => void;
  setSelectedItemId: (itemId: string | null) => void;
  setFilter: (filter: QueueState["filter"]) => void;
  resetQueue: () => void;
}>;

export type QueueStore = QueueState & QueueActions;

export const initialQueueState: QueueState = {
  items: [],
  selectedItemId: null,
  filter: "all",
};

export const useQueueStore = create<QueueStore>((set) => ({
  ...initialQueueState,
  setItems: (items) => set({ items }),
  setSelectedItemId: (selectedItemId) => set({ selectedItemId }),
  setFilter: (filter) => set({ filter }),
  resetQueue: () => set(initialQueueState),
}));
