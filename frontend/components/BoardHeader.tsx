"use client";

import { useState } from "react";
import type { BoardId } from "@/lib/types";

type BoardOption = { id: BoardId; title: string };

type BoardHeaderProps = {
  title: string;
  subtitle: string;
  boardId: BoardId;
  boards: BoardOption[];
  searchQuery: string;
  darkMode: boolean;
  showArchived: boolean;
  canUndo: boolean;
  persistenceMode: "supabase" | "local";
  onBoardChange: (id: BoardId) => void;
  onTitleChange: (title: string) => void;
  onSearchChange: (query: string) => void;
  onToggleDarkMode: () => void;
  onToggleArchived: () => void;
  onUndo: () => void;
};

export function BoardHeader({
  title,
  subtitle,
  boardId,
  boards,
  searchQuery,
  darkMode,
  showArchived,
  canUndo,
  persistenceMode,
  onBoardChange,
  onTitleChange,
  onSearchChange,
  onToggleDarkMode,
  onToggleArchived,
  onUndo,
}: BoardHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  function saveTitle() {
    const trimmed = editTitle.trim();
    if (trimmed) onTitleChange(trimmed);
    else setEditTitle(title);
    setIsEditingTitle(false);
  }

  return (
    <header className="border-b border-border bg-surface px-4 py-4 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-2">
            {boards.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onBoardChange(b.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  boardId === b.id
                    ? "bg-primary text-white"
                    : "border border-border text-navy hover:bg-background"
                }`}
                data-testid={`board-tab-${b.id}`}
              >
                {b.title}
              </button>
            ))}
          </div>
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setEditTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              className="w-full rounded border border-primary/30 bg-surface px-2 py-1 text-2xl font-bold text-navy focus:border-primary focus:outline-none"
              autoFocus
              aria-label="Board title"
              data-testid="board-title-input"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditTitle(title);
                setIsEditingTitle(true);
              }}
              className="text-left text-2xl font-bold text-navy hover:text-primary"
              data-testid="board-title"
            >
              {title}
            </button>
          )}
          <p className="mt-1 text-sm text-gray">{subtitle}</p>
          <p className="mt-1 text-xs text-gray" data-testid="persistence-mode">
            {persistenceMode === "supabase"
              ? "Saved to Supabase (shared across devices)"
              : "Saved on this device only"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cards..."
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-navy placeholder:text-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-48"
            aria-label="Search cards"
            data-testid="search-input"
          />
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-navy transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="undo-button"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onToggleArchived}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              showArchived
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-border text-navy hover:bg-background"
            }`}
            data-testid="toggle-archived"
          >
            {showArchived ? "Hide archived" : "Show archived"}
          </button>
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-navy transition-colors hover:bg-background"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="toggle-dark-mode"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </header>
  );
}
