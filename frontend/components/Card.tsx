"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCardLabels, getLabelConfig } from "@/lib/labels";
import type { Card as CardType, CardLabel, BoardId } from "@/lib/types";

export type CardEditPayload = {
  title: string;
  details: string;
  label: CardLabel;
  dueDate: string | null;
};

type KanbanCardProps = {
  boardId: BoardId;
  card: CardType;
  onEdit: (cardId: string, payload: CardEditPayload) => void;
  onDelete: (cardId: string) => void;
  onArchive?: (cardId: string) => void;
  onRestore?: (cardId: string) => void;
};

function formatDueDate(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function KanbanCard({
  boardId,
  card,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
}: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDetails, setEditDetails] = useState(card.details);
  const [editLabel, setEditLabel] = useState<CardLabel>(card.label);
  const [editDueDate, setEditDueDate] = useState(card.dueDate ?? "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: card.archived });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const labelConfig = getLabelConfig(card.label, boardId);
  const cardLabels = getCardLabels(boardId);

  function startEditing() {
    setEditTitle(card.title);
    setEditDetails(card.details);
    setEditLabel(card.label);
    setEditDueDate(card.dueDate ?? "");
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditTitle(card.title);
    setEditDetails(card.details);
    setEditLabel(card.label);
    setEditDueDate(card.dueDate ?? "");
    setIsEditing(false);
  }

  function saveEditing() {
    const trimmed = editTitle.trim();
    if (!trimmed) {
      cancelEditing();
      return;
    }
    onEdit(card.id, {
      title: trimmed,
      details: editDetails.trim(),
      label: editLabel,
      dueDate: editDueDate || null,
    });
    setIsEditing(false);
  }

  function handleFormKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") cancelEditing();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border bg-surface p-3 shadow-sm transition-all duration-200 hover:border-accent/40 hover:shadow-md ${
        card.archived
          ? "border-dashed border-gray/40 opacity-60"
          : "border-border"
      } ${isDragging ? "z-10 scale-[1.02] opacity-50 shadow-lg ring-2 ring-accent/30" : "animate-drop-in"}`}
      data-testid={`card-${card.id}`}
    >
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveEditing();
          }}
          onKeyDown={handleFormKeyDown}
          className="flex flex-col gap-2 pr-14"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm font-semibold text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
            aria-label="Card title"
            data-testid={`edit-title-${card.id}`}
          />
          <textarea
            value={editDetails}
            onChange={(e) => setEditDetails(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-md border border-border bg-surface px-2 py-1 text-xs text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Card details"
            data-testid={`edit-details-${card.id}`}
          />
          <div className="flex gap-2">
            <select
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value as CardLabel)}
              className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-navy focus:border-primary focus:outline-none"
              aria-label="Card label"
              data-testid={`edit-label-${card.id}`}
            >
              {cardLabels.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-navy focus:border-primary focus:outline-none"
              aria-label="Due date"
              data-testid={`edit-due-${card.id}`}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-secondary/90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-md px-2 py-1 text-xs text-gray transition-colors hover:text-navy"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div
          className={`pr-14 ${card.archived ? "" : "cursor-grab active:cursor-grabbing"}`}
          {...(card.archived ? {} : { ...attributes, ...listeners })}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {card.label !== "none" && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${labelConfig.pill} ${labelConfig.pillDark}`}
              >
                {labelConfig.name}
              </span>
            )}
            {card.archived && (
              <span className="rounded-full bg-gray/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray">
                Archived
              </span>
            )}
          </div>
          <h3 className="mt-1 text-sm font-semibold text-navy">{card.title}</h3>
          {card.details && (
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray">
              {card.details}
            </p>
          )}
          {card.dueDate && (
            <p className="mt-2 text-[11px] font-medium text-primary">
              Due {formatDueDate(card.dueDate)}
            </p>
          )}
        </div>
      )}
      {!isEditing && (
        <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={startEditing}
            onPointerDown={(e) => e.stopPropagation()}
            className="rounded p-0.5 text-gray hover:bg-primary/10 hover:text-primary"
            aria-label={`Edit ${card.title}`}
            data-testid={`edit-${card.id}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
          </button>
          {card.archived ? (
            onRestore && (
              <button
                type="button"
                onClick={() => onRestore(card.id)}
                onPointerDown={(e) => e.stopPropagation()}
                className="rounded p-0.5 text-gray hover:bg-primary/10 hover:text-primary"
                aria-label={`Restore ${card.title}`}
                data-testid={`restore-${card.id}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.989L16.44 3.9a.75.75 0 00-1.204-.882l-1.32 1.873V1.5a.75.75 0 00-1.5 0v4.757a.75.75 0 001.5 0V6.56l1.036-1.47a7 7 0 011.135 3.715z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )
          ) : (
            <>
              {onArchive && (
                <button
                  type="button"
                  onClick={() => onArchive(card.id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="rounded p-0.5 text-gray hover:bg-amber-50 hover:text-amber-600"
                  aria-label={`Archive ${card.title}`}
                  data-testid={`archive-${card.id}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M3 3.5A1.5 1.5 0 014.5 2h11A1.5 1.5 0 0117 3.5v2.879a2.5 2.5 0 00-.732 1.767l-.81 2.426a1 1 0 01-.95.69H5.492a1 1 0 01-.95-.69l-.81-2.426A2.5 2.5 0 003 6.38V3.5zM4.5 5h11v-.5a.5.5 0 00-.5-.5h-10a.5.5 0 00-.5.5V5z" />
                    <path d="M6 12.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm.5 2.5a.5.5 0 000 1h5a.5.5 0 000-1h-5z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(card.id)}
                onPointerDown={(e) => e.stopPropagation()}
                className="rounded p-0.5 text-gray hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete ${card.title}`}
                data-testid={`delete-${card.id}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
