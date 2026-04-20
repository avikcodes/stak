import { create } from "zustand";
import { defaultTemplates, type Template } from "@/types/template";

export type TemplateState = Readonly<{
  templates: Template[];
}>;

export type TemplateActions = Readonly<{
  loadTemplates: () => void;
  getTemplateById: (id: string) => Template | undefined;
}>;

export type TemplateStore = TemplateState & TemplateActions;

export const initialTemplateState: TemplateState = {
  templates: [...defaultTemplates],
};

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  ...initialTemplateState,
  loadTemplates: () => set({ templates: [...defaultTemplates] }),
  getTemplateById: (id) => get().templates.find((template) => template.id === id),
}));
