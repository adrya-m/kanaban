"use client";

import type { Board } from "@/lib/types";

type BoardPlaceholderProps = {
  board: Board;
};

export function BoardPlaceholder({ board }: BoardPlaceholderProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {board.columns.map((column) => {
        const cards = column.cardIds
          .map((id) => board.cards[id])
          .filter(Boolean);

        return (
          <div
            key={column.id}
            className="flex w-72 shrink-0 flex-col rounded-xl bg-surface-muted shadow-sm ring-1 ring-border"
          >
            <div className="rounded-t-xl border-t-4 border-accent px-3 pt-3">
              <div className="text-sm font-semibold text-navy">
                {column.title}
                <span className="ml-2 text-xs font-normal text-gray">
                  {cards.length}
                </span>
              </div>
            </div>
            <div className="flex min-h-[120px] flex-col gap-2 p-3">
              {cards.length === 0 ? (
                <p className="text-center text-xs text-gray">No cards yet</p>
              ) : (
                cards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-lg border border-border bg-surface p-3 shadow-sm"
                  >
                    <h3 className="text-sm font-semibold text-navy">
                      {card.title}
                    </h3>
                    {card.details && (
                      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray">
                        {card.details}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
