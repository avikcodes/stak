export type StackStatus = "draft" | "ready" | "posted";

export type StackDraft = Readonly<{
  id: string;
  platform: string;
  content: string;
  status: StackStatus;
  order: number;
}>;

export type StackHistoryEntry = Readonly<{
  id: string;
  title: string;
  drafts: ReadonlyArray<StackDraft>;
  createdAt: Date;
}>;

export type Stack = Readonly<{
  id: string;
  title: string;
  inputContent: string;
  platforms: ReadonlyArray<string>;
  tone: string;
  brandVoice: string;
  drafts: ReadonlyArray<StackDraft>;
  status: StackStatus;
  createdAt: Date;
}>;
