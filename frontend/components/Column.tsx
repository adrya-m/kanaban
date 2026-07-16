"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard, type CardEditPayload } from "./Card";
import { AddCardForm } from "./AddCardForm";
import type { Card as CardType, CardLabel, BoardId, Column as ColumnType } from "@/lib/types";

type ColumnProps = {
  column: ColumnType;
  boardId: BoardId;
  cards: CardType[];
  visibleCount: number;
  onRename: (columnId: string, title: string) => void;
  onAddCard: (
    columnId: string,
    title: string,
    details: string,
    label: CardLabel,
    dueDate: string | null,
  ) => void;
  onEditCard: (cardId: string, payload: CardEditPayload) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onArchiveCard: (columnId: string, cardId: string) => void;
  onRestoreCard: (columnId: string, cardId: string) => void;
};

export function Column({
  column,
  boardId,
  cards,
  visibleCount,
  onRename,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onArchiveCard,
  onRestoreCard,
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    attributes: columnAttributes,
    listeners: columnListeners,
    setNodeRef: setColumnRef,
    transform: columnTransform,
    transition: columnTransition,
    isDragging: isColumnDragging,
  } = useSortable({ id: column.id });

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: column.id });

  const columnStyle = {
    transform: CSS.Transform.toString(columnTransform),
    transition: columnTransition,
  };

  function saveTitle() {
    const trimmed = editTitle.trim();
    if (trimmed) {
      onRename(column.id, trimmed);
    } else {
      setEditTitle(column.title);
    }
    setIsEditing(false);
  }

  return (
    <div
      ref={setColumnRef}
      style={columnStyle}
      className={`flex w-72 shrink-0 flex-col rounded-xl bg-surface-muted shadow-sm ring-1 ring-border transition-all duration-200 ${
        isColumnDragging ? "z-20 opacity-70 ring-2 ring-accent/40" : ""
      } ${isOver ? "ring-2 ring-primary/40" : ""}`}
      data-testid={`column-${column.id}`}
    >
      <div className="flex items-start gap-1 rounded-t-xl border-t-4 border-accent px-3 pt-3">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-gray/60 active:cursor-grabbing hover:text-gray"
          aria-label={`Drag column ${column.title}`}
          data-testid={`drag-column-${column.id}`}
          {...columnAttributes}
          {...columnListeners}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M7 4a1 1 0 110-2 1 1 0 010 2zm6-1a1 1 0 100 2 1 1 0 000-2zM7 11a1 1 0 110-2 1 1 0 010 2zm6-1a1 1 0 100 2 1 1 0 000-2zM7 18a1 1 0 110-2 1 1 0 010 2zm6-1a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setEditTitle(column.title);
                  setIsEditing(false);
                }
              }}
              className="w-full rounded border border-primary/30 bg-surface px-2 py-1 text-sm font-semibold text-navy focus:border-primary focus:outline-none"
              autoFocus
              aria-label="Column title"
              data-testid={`rename-input-${column.id}`}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditTitle(column.title);
                setIsEditing(true);
              }}
              className="w-full text-left text-sm font-semibold text-navy hover:text-primary"
              data-testid={`column-title-${column.id}`}
            >
              {column.title}
              <span className="ml-2 text-xs font-normal text-gray">
                {visibleCount}
              </span>
            </button>
          )}
        </div>
      </div>

      <div
        ref={setDropRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 p-3 transition-colors duration-200 ${
          isOver ? "rounded-lg bg-primary/10" : ""
        }`}
      >
        <SortableContext
          items={cards.filter((c) => !c.archived).map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.length === 0 ? (
            <p
              className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-gray"
              data-testid={`empty-${column.id}`}
            >
              No cards yet. Add one below or drag a card here.
            </p>
          ) : (
            cards.map((card) => (
              <KanbanCard
                key={card.id}
                boardId={boardId}
                card={card}
                onEdit={onEditCard}
                onDelete={(cardId) => onDeleteCard(column.id, cardId)}
                onArchive={(cardId) => onArchiveCard(column.id, cardId)}
                onRestore={(cardId) => onRestoreCard(column.id, cardId)}
              />
            ))
          )}
        </SortableContext>
      </div>

      <div className="p-3 pt-0">
        {showAddForm ? (
          <AddCardForm
            boardId={boardId}
            onAdd={(title, details, label, dueDate) => {
              onAddCard(column.id, title, details, label, dueDate);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full rounded-md py-1.5 text-sm text-gray transition-colors hover:bg-background hover:text-secondary"
            data-testid={`add-card-${column.id}`}
          >
            + Add card
          </button>
        )}
      </div>
    </div>
  );
}
