"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowRight, GripVertical, Layers3 } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useStackStore } from "@/store/stackStore";
import type { StackDraft, StackStatus } from "@/types/stack";

function StatusPill({ status }: { status: StackStatus }) {
  const styles = {
    draft: "bg-[rgba(100,116,139,0.14)] text-[#475569]",
    ready: "bg-[rgba(14,165,233,0.14)] text-[#0369a1]",
    posted: "bg-[rgba(16,185,129,0.14)] text-[#047857]",
  } as const;

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", styles[status])}>
      {status === "draft" ? "Draft" : status === "ready" ? "Ready" : "Posted"}
    </span>
  );
}

function formatDraftPlatform(platform: string) {
  const labelMap: Record<string, string> = {
    "x-short": "X (Short)",
    "x-thread": "X (Thread)",
    "linkedin-short": "LinkedIn (Short)",
    "linkedin-long": "LinkedIn (Long)",
    threads: "Threads",
    newsletter: "Newsletter",
    instagram: "Instagram",
  };

  return labelMap[platform] ?? platform;
}

function sortByOrder(drafts: readonly StackDraft[]) {
  return [...drafts].sort((left, right) => left.order - right.order);
}

function draftPreviewText(content: string) {
  return content;
}

type RewriteMode = "shorter" | "human" | "persuasive" | "professional";

function normalizeSpacing(content: string) {
  return content
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function shortenDraft(content: string) {
  const words = normalizeSpacing(content).split(/\s+/).filter(Boolean);
  if (words.length <= 20) {
    return normalizeSpacing(content);
  }

  const nextLength = Math.max(20, Math.round(words.length * 0.7));
  return `${words.slice(0, nextLength).join(" ")}...`;
}

function makeMoreHuman(content: string) {
  const rewritten = normalizeSpacing(content)
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bwill not\b/gi, "won't")
    .replace(/\bwe are\b/gi, "we're")
    .replace(/\byou are\b/gi, "you're")
    .replace(/\bit is\b/gi, "it's")
    .replace(/\bfor example\b/gi, "for instance")
    .replace(/\butilize\b/gi, "use")
    .replace(/\bindividuals\b/gi, "people");

  if (/^(honestly|quick note|here's the thing)/i.test(rewritten)) {
    return rewritten;
  }

  return `Honestly, ${rewritten.charAt(0).toLowerCase()}${rewritten.slice(1)}`;
}

function makeMorePersuasive(content: string) {
  const base = normalizeSpacing(content);
  const lines = base.split("\n").filter(Boolean);
  const firstLine = lines[0] ?? base;

  const strongerOpening = firstLine
    .replace(/is changing/gi, "can change")
    .replace(/is a reminder/gi, "proves")
    .replace(/works best/gi, "works faster");

  const cta = "If you want better results, use this approach today.";
  const body = lines.length > 1 ? lines.slice(1).join("\n") : "";

  return [strongerOpening, body, cta].filter(Boolean).join("\n\n");
}

function makeMoreProfessional(content: string) {
  const base = normalizeSpacing(content);
  const lines = base.split("\n").filter(Boolean);

  if (!lines.length) {
    return base;
  }

  const opening = lines[0]
    .replace(/\bhonestly,\s*/gi, "")
    .replace(/\bbasically,\s*/gi, "")
    .replace(/\bcan't\b/gi, "cannot")
    .replace(/\bwon't\b/gi, "will not")
    .replace(/\bdon't\b/gi, "do not");

  const body = lines.slice(1).join("\n");
  return [opening, body].filter(Boolean).join("\n\n");
}

function rewriteDraftContent(content: string, mode: RewriteMode) {
  switch (mode) {
    case "shorter":
      return shortenDraft(content);
    case "human":
      return makeMoreHuman(content);
    case "persuasive":
      return makeMorePersuasive(content);
    case "professional":
      return makeMoreProfessional(content);
    default:
      return content;
  }
}

function SortableDraftCard({
  draft,
  isActive,
  isEditing,
  draftText,
  onStartEdit,
  onCancelEdit,
  onChangeDraftText,
  onSaveDraft,
  onBlurDraft,
  onCopyDraft,
  copied,
  saveError,
  saveSuccess,
  isBlocked,
  onRewriteDraft,
  isRewriting,
  rewritingMode,
}: {
  draft: StackDraft;
  isActive: boolean;
  isEditing: boolean;
  draftText: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onChangeDraftText: (value: string) => void;
  onSaveDraft: () => void;
  onBlurDraft: () => void;
  onCopyDraft: (mode?: StackStatus) => void;
  copied: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  isBlocked: boolean;
  onRewriteDraft: (mode: RewriteMode) => void;
  isRewriting: boolean;
  rewritingMode: RewriteMode | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: draft.id,
    transition: {
      duration: 220,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "min-h-[300px] rounded-[24px] border border-[var(--border)] bg-[rgb(249,250,251)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]",
        (isDragging || isActive) &&
          "z-10 scale-[1.01] border-[var(--accent)] bg-white shadow-[0_24px_50px_rgba(15,23,42,0.14)]"
      )}
      onClick={() => {
        if (!isEditing && !isBlocked) {
          onStartEdit();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)] shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
              {formatDraftPlatform(draft.platform)}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              Draft {draft.order}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCopyDraft();
            }}
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Copy
          </button>
          {!isEditing && copied ? (
            <span className="text-xs font-medium text-[var(--accent)]">Copied!</span>
          ) : null}
          <StatusPill status={draft.status} />
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Drag ${formatDraftPlatform(draft.platform)} draft ${draft.order}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 min-h-[120px]">
        {isEditing ? (
          <textarea
            autoFocus
            value={draftText}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => onChangeDraftText(event.target.value)}
          onBlur={onBlurDraft}
          className="min-h-[120px] w-full rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
        />
        ) : (
          <p
            className="text-sm leading-6 text-[var(--foreground)]"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              overflow: "hidden",
            }}
          >
            {draftPreviewText(draft.content)}
          </p>
        )}
      </div>

      <div className="mt-4 flex min-h-[40px] flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
          {draft.status === "draft" ? "Draft" : draft.status === "ready" ? "Ready" : "Posted"}
        </span>
        {isEditing ? (
          <>
            <button
              type="button"
              disabled={!draftText.trim()}
              onClick={(event) => {
                event.stopPropagation();
                onSaveDraft();
              }}
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCancelEdit();
              }}
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Cancel
            </button>
            {saveSuccess ? (
              <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
                Saved
              </span>
            ) : null}
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={isBlocked}
              onClick={(event) => {
                event.stopPropagation();
                onStartEdit();
              }}
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCopyDraft("ready");
              }}
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Copy + Ready
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCopyDraft("posted");
              }}
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Copy + Posted
            </button>
          </>
        )}
        {isEditing && saveError ? (
          <span className="w-full text-xs text-red-600">{saveError}</span>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isRewriting}
            onClick={(event) => {
              event.stopPropagation();
              onRewriteDraft("shorter");
            }}
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRewriting && rewritingMode === "shorter" ? "Shorter..." : "Shorter"}
          </button>
          <button
            type="button"
            disabled={isRewriting}
            onClick={(event) => {
              event.stopPropagation();
              onRewriteDraft("human");
            }}
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRewriting && rewritingMode === "human" ? "More human..." : "More human"}
          </button>
          <button
            type="button"
            disabled={isRewriting}
            onClick={(event) => {
              event.stopPropagation();
              onRewriteDraft("persuasive");
            }}
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRewriting && rewritingMode === "persuasive" ? "More persuasive..." : "More persuasive"}
          </button>
          <button
            type="button"
            disabled={isRewriting}
            onClick={(event) => {
              event.stopPropagation();
              onRewriteDraft("professional");
            }}
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRewriting && rewritingMode === "professional"
              ? "More professional..."
              : "More professional"}
          </button>
        </div>
        {isRewriting ? (
          <span className="text-xs text-[var(--muted)]">Rewriting draft...</span>
        ) : null}
      </div>
    </article>
  );
}

export default function QueuePage() {
  const currentStack = useStackStore((state) => state.currentStack);
  const updateStack = useStackStore((state) => state.updateStack);
  const setCurrentStack = useStackStore((state) => state.setCurrentStack);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [draftDraftText, setDraftDraftText] = useState<Record<string, string>>({});
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const [saveErrorDraftId, setSaveErrorDraftId] = useState<string | null>(null);
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
  const [rewritingDraftId, setRewritingDraftId] = useState<string | null>(null);
  const [rewritingMode, setRewritingMode] = useState<RewriteMode | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const rewriteTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      if (rewriteTimeoutRef.current) {
        window.clearTimeout(rewriteTimeoutRef.current);
      }
    },
    []
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const drafts = useMemo(() => sortByOrder(currentStack?.drafts ?? []), [currentStack]);

  const draftIds = useMemo(() => drafts.map((draft, index) => draft.id ?? `draft-${index}`), [drafts]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!currentStack || !over || active.id === over.id) {
      return;
    }

    const oldIndex = drafts.findIndex((draft) => draft.id === active.id);
    const newIndex = drafts.findIndex((draft) => draft.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reorderedDrafts = arrayMove(drafts, oldIndex, newIndex).map((draft, index) => ({
      ...draft,
      order: index + 1,
    }));

    updateStack(currentStack.id, { drafts: reorderedDrafts });
    setCurrentStack({ ...currentStack, drafts: reorderedDrafts });
  }

  function handleDraftStatusChange(draftId: string, status: StackStatus) {
    if (!currentStack) {
      return;
    }

    const updatedDrafts = currentStack.drafts.map((draft) =>
      draft.id === draftId ? { ...draft, status } : draft
    );

    const sortedDrafts = sortByOrder(updatedDrafts);

    updateStack(currentStack.id, { drafts: sortedDrafts });
    setCurrentStack({ ...currentStack, drafts: sortedDrafts });
  }

  function clearCopyFeedback() {
    setCopiedDraftId(null);
  }

  function clearSaveFeedback() {
    setSavedDraftId(null);
  }

  function clearPendingSave() {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }

  function clearPendingRewrite() {
    if (rewriteTimeoutRef.current) {
      window.clearTimeout(rewriteTimeoutRef.current);
      rewriteTimeoutRef.current = null;
    }
    setRewritingDraftId(null);
    setRewritingMode(null);
  }

  function copyDraftContent(draftId: string, nextStatus?: StackStatus) {
    const draft = drafts.find((item) => item.id === draftId);

    if (!draft) {
      return;
    }

    const content = editingDraftId === draftId ? draftDraftText[draftId] ?? draft.content : draft.content;

    const copyText = async () => {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        return;
      }

      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.setAttribute("readonly", "true");
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    };

    copyText()
      .then(() => {
        clearCopyFeedback();
        setCopiedDraftId(draftId);

        if (nextStatus === "ready") {
          handleDraftStatusChange(draftId, "ready");
        } else if (nextStatus === "posted") {
          handleDraftStatusChange(draftId, "posted");
        } else if (draft.status === "draft") {
          handleDraftStatusChange(draftId, "ready");
        }

        window.setTimeout(() => {
          clearCopyFeedback();
        }, 1500);
      })
      .catch((error) => {
        console.error("Failed to copy draft:", error);
      });
  }

  function saveDraftText(draftId: string, nextContent: string) {
    if (!currentStack) {
      return;
    }

    const trimmedContent = nextContent.trim();

    if (!trimmedContent) {
      setSaveErrorDraftId(draftId);
      return;
    }

    clearPendingSave();

    const updatedDrafts = currentStack.drafts.map((draft) =>
      draft.id === draftId ? { ...draft, content: trimmedContent } : draft
    );

    const sortedDrafts = sortByOrder(updatedDrafts);

    updateStack(currentStack.id, { drafts: sortedDrafts });
    setCurrentStack({ ...currentStack, drafts: sortedDrafts });
    setSaveErrorDraftId(null);
    setSavedDraftId(draftId);
    setDraftDraftText((current) => {
      const nextState = { ...current };
      delete nextState[draftId];
      return nextState;
    });
    setEditingDraftId(null);

    window.setTimeout(() => {
      clearSaveFeedback();
    }, 1200);
  }

  function cancelDraftEdit(draftId: string) {
    clearPendingSave();
    setSaveErrorDraftId(null);
    setDraftDraftText((current) => {
      const nextState = { ...current };
      delete nextState[draftId];
      return nextState;
    });
    setEditingDraftId(null);
  }

  function startEditingDraft(draft: StackDraft) {
    if (rewritingDraftId) {
      return;
    }

    if (editingDraftId && editingDraftId !== draft.id) {
      return;
    }

    clearPendingSave();
    clearPendingRewrite();
    setSaveErrorDraftId(null);
    setSavedDraftId(null);
    setEditingDraftId(draft.id);
    setDraftDraftText((current) => ({
      ...current,
      [draft.id]: draft.content,
    }));
  }

  function scheduleAutoSave(draftId: string) {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveDraftText(draftId, draftDraftText[draftId] ?? "");
    }, 400);
  }

  function handleRewriteDraft(draftId: string, mode: RewriteMode) {
    if (!currentStack) {
      return;
    }

    if (rewritingDraftId) {
      return;
    }

    if (editingDraftId && editingDraftId !== draftId) {
      return;
    }

    const draft = currentStack.drafts.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    clearPendingSave();
    setSaveErrorDraftId(null);
    setSavedDraftId(null);
    setRewritingDraftId(draftId);
    setRewritingMode(mode);

    rewriteTimeoutRef.current = window.setTimeout(() => {
      const sourceContent =
        editingDraftId === draftId ? draftDraftText[draftId] ?? draft.content : draft.content;
      const rewrittenContent = rewriteDraftContent(sourceContent, mode);

      const updatedDrafts = currentStack.drafts.map((item) =>
        item.id === draftId ? { ...item, content: rewrittenContent } : item
      );

      const sortedDrafts = sortByOrder(updatedDrafts);

      updateStack(currentStack.id, { drafts: sortedDrafts });
      setCurrentStack({ ...currentStack, drafts: sortedDrafts });

      if (editingDraftId === draftId) {
        setDraftDraftText((current) => ({
          ...current,
          [draftId]: rewrittenContent,
        }));
      }

      setRewritingDraftId(null);
      setRewritingMode(null);
      rewriteTimeoutRef.current = null;
    }, 400);
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
              Draft Queue
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              Current stack drafts
            </h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--muted)] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            {drafts.length}
          </span>
        </div>

        {drafts.length ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
          >
            <div className="max-h-[680px] overflow-y-auto px-5 py-4 pr-3">
              <SortableContext items={draftIds} strategy={verticalListSortingStrategy}>
                <div className="grid gap-3">
                  {drafts.map((draft, index) => (
                    <div key={draft.id || index} className="space-y-2">
                      <SortableDraftCard
                        draft={draft}
                        isActive={activeId === draft.id}
                        isEditing={editingDraftId === draft.id}
                        draftText={draftDraftText[draft.id] ?? draft.content}
                        onStartEdit={() => startEditingDraft(draft)}
                        onCancelEdit={() => cancelDraftEdit(draft.id)}
                        onChangeDraftText={(value) =>
                          setDraftDraftText((current) => ({
                            ...current,
                            [draft.id]: value,
                          }))
                        }
                        onSaveDraft={() =>
                          saveDraftText(draft.id, draftDraftText[draft.id] ?? draft.content)
                        }
                        onBlurDraft={() => scheduleAutoSave(draft.id)}
                        onCopyDraft={(nextStatus) => copyDraftContent(draft.id, nextStatus)}
                        copied={copiedDraftId === draft.id}
                        saveError={saveErrorDraftId === draft.id ? "Draft content cannot be empty." : null}
                        saveSuccess={savedDraftId === draft.id}
                        isBlocked={Boolean(
                          (editingDraftId && editingDraftId !== draft.id) || rewritingDraftId
                        )}
                        onRewriteDraft={(mode) => handleRewriteDraft(draft.id, mode)}
                        isRewriting={rewritingDraftId === draft.id}
                        rewritingMode={rewritingMode}
                      />
                      <div className="flex flex-wrap gap-2 px-1">
                        <button
                          type="button"
                          onClick={() => handleDraftStatusChange(draft.id, "ready")}
                          className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          Mark as Ready
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDraftStatusChange(draft.id, "posted")}
                          className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          Mark as Posted
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </div>
          </DndContext>
        ) : (
          <div className="px-5 py-10">
            <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-white/50 p-6 text-center dark:bg-white/5">
              <p className="text-sm font-medium text-[var(--foreground)]">No drafts in queue</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Generate a stack on the dashboard and the drafts will appear here.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        )}
      </Card>

      <Card className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
            Current Stack
          </p>
          <h3 className="mt-2 truncate text-sm font-medium text-[var(--foreground)]">
            {currentStack ? currentStack.title : "No active stack selected"}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {currentStack
              ? `${currentStack.drafts.length} drafts loaded`
              : "Select or generate a stack to populate the queue"}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
      </Card>
    </div>
  );
}
