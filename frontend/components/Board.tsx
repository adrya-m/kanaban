"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { Column } from "./Column";
import { KanbanCard, type CardEditPayload } from "./Card";
import { filterColumnCards } from "@/lib/filter-cards";
import type { Board, BoardId, Card as CardType, CardLabel } from "@/lib/types";

type BoardProps = {
  board: Board;
  boardId: BoardId;
  searchQuery: string;
  showArchived: boolean;
  onRenameColumn: (columnId: string, title: string) => void;
  onMoveColumn: (columnId: string, toIndex: number) => void;
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
  onMoveCard: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    toIndex: number,
  ) => void;
};

function findColumnByCardId(board: Board, cardId: string) {
  return board.columns.find((column) => column.cardIds.includes(cardId));
}

function isCardId(board: Board, id: string) {
  return Boolean(board.cards[id]);
}

export function Board({
  board,
  boardId,
  searchQuery,
  showArchived,
  onRenameColumn,
  onMoveColumn,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onArchiveCard,
  onRestoreCard,
  onMoveCard,
}: BoardProps) {
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    const card = board.cards[id];
    if (card) {
      setActiveCard(card);
      return;
    }
    if (board.columns.some((c) => c.id === id)) {
      setActiveColumnId(id);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    setActiveColumnId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (!isCardId(board, activeId)) {
      const overColumn = board.columns.find((c) => c.id === overId);
      if (!overColumn) return;
      const fromIndex = board.columns.findIndex((c) => c.id === activeId);
      const toIndex = board.columns.findIndex((c) => c.id === overId);
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        onMoveColumn(activeId, toIndex);
      }
      return;
    }

    const cardId = activeId;
    const fromColumn = findColumnByCardId(board, cardId);
    if (!fromColumn) return;

    const overColumn =
      board.columns.find((c) => c.id === overId) ??
      findColumnByCardId(board, overId);
    if (!overColumn) return;

    let toIndex: number;
    if (overColumn.id === overId) {
      toIndex = overColumn.cardIds.length;
    } else {
      toIndex = overColumn.cardIds.indexOf(overId);
      if (toIndex === -1) return;
    }

    if (fromColumn.id === overColumn.id) {
      const fromIndex = fromColumn.cardIds.indexOf(cardId);
      if (fromIndex === toIndex) return;
    }

    onMoveCard(cardId, fromColumn.id, overColumn.id, toIndex);
  }

  const columnIds = board.columns.map((c) => c.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => {
            const allCards = column.cardIds
              .map((id) => board.cards[id])
              .filter(Boolean);
            const cards = filterColumnCards(
              allCards,
              searchQuery,
              showArchived,
            );
            return (
              <Column
                key={column.id}
                column={column}
                boardId={boardId}
                cards={cards}
                visibleCount={cards.length}
                onRename={onRenameColumn}
                onAddCard={onAddCard}
                onEditCard={onEditCard}
                onDeleteCard={onDeleteCard}
                onArchiveCard={onArchiveCard}
                onRestoreCard={onRestoreCard}
              />
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease-out" }}>
        {activeCard ? (
          <div className="rotate-2 opacity-95">
            <KanbanCard
              boardId={boardId}
              card={activeCard}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : activeColumnId ? (
          <div className="w-72 rounded-xl bg-surface-muted p-3 opacity-90 shadow-lg ring-2 ring-accent/30">
            <p className="text-sm font-semibold text-navy">
              {board.columns.find((c) => c.id === activeColumnId)?.title}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
