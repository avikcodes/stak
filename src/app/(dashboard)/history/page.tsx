"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useStackStore } from "@/store/stackStore";
import type { StackHistoryEntry } from "@/types/stack";

function formatHistoryTime(createdAt: Date) {
  const date = new Date(createdAt);
  const isToday = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) {
    return `Today - ${time}`;
  }

  const day = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return `${day} - ${time}`;
}

export default function HistoryPage() {
  const history = useStackStore((state) => state.history);
  const currentStack = useStackStore((state) => state.currentStack);
  const restoreHistoryEntry = useStackStore((state) => state.restoreHistoryEntry);
  const deleteStack = useStackStore((state) => state.deleteStack);
  const router = useRouter();

  const [modalOpenFor, setModalOpenFor] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setModalOpenFor(id);
  };

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
    
    // Optimistic update: remove from UI immediately
    deleteStack(id);
    setModalOpenFor(null);
    
    try {
      const res = await fetch(`/api/stacks/${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete draft");
      }
      
      toast.success("Draft deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete draft");
      // Optionally we could restore the item here if needed
    } finally {
      setDeletingId(null);
    }
  };

  const recentHistory = useMemo(
    () =>
      [...history].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      ),
    [history]
  );

  return (
    <div className="space-y-6">
      <Card className="space-y-4 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
              Stack History
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              Past work snapshots
            </h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--muted)] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            {recentHistory.length}
          </span>
        </div>

        {recentHistory.length ? (
          <div className="max-h-[680px] overflow-y-auto">
            <div className="flex flex-col">
              {recentHistory.map((entry) => {
                const isCurrent = currentStack?.id === entry.id;

                return (
                  <div
                    key={`${entry.id}-${entry.createdAt.toString()}`}
                    onClick={() => {
                      restoreHistoryEntry(entry);
                      router.push("/queue");
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 text-left transition hover:bg-[rgb(249,250,251)] last:border-0 dark:hover:bg-white/5",
                      isCurrent && "bg-[rgb(249,250,251)] dark:bg-white/5"
                    )}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                        <span className="truncate">{entry.title}</span>
                        {isCurrent && (
                          <span className="rounded-full bg-[rgba(14,165,233,0.14)] px-2 py-0.5 text-[10px] font-medium text-[#0369a1]">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {formatHistoryTime(entry.createdAt)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm text-[var(--muted)]">
                        {entry.drafts.length} drafts
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, entry.id)}
                        disabled={deletingId === entry.id}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
                        aria-label="Delete draft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-5 py-10">
            <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-white/50 p-6 text-center dark:bg-white/5">
              <p className="text-sm font-medium text-[var(--foreground)]">No history yet</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Every created or updated stack will appear here automatically.
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
            Snapshot source
          </p>
          <h3 className="mt-2 truncate text-sm font-medium text-[var(--foreground)]">
            {currentStack ? currentStack.title : "No active stack selected"}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {currentStack
              ? `${currentStack.drafts.length} drafts in the current workspace`
              : "Create or select a stack to capture more history"}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
      </Card>

      {/* Delete Confirmation Modal */}
      {modalOpenFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-xl dark:bg-[#0f172a] border border-[var(--border)] animate-in zoom-in-95 duration-200">
            <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">Delete Draft</h3>
            <p className="mb-6 text-sm text-[var(--muted)]">
              Are you sure you want to delete this draft? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpenFor(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition"
                disabled={!!deletingId}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(modalOpenFor)}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
                disabled={!!deletingId}
              >
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
