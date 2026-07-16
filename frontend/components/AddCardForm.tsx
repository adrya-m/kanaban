"use client";

import { useState } from "react";
import { getCardLabels } from "@/lib/labels";
import type { BoardId, CardLabel } from "@/lib/types";

type AddCardFormProps = {
  boardId: BoardId;
  onAdd: (
    title: string,
    details: string,
    label: CardLabel,
    dueDate: string | null,
  ) => void;
  onCancel: () => void;
};

export function AddCardForm({ boardId, onAdd, onCancel }: AddCardFormProps) {
  const cardLabels = getCardLabels(boardId);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [label, setLabel] = useState<CardLabel>("none");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, details.trim(), label, dueDate || null);
    setTitle("");
    setDetails("");
    setLabel("none");
    setDueDate("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        placeholder="Card title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-navy placeholder:text-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        autoFocus
        aria-label="Card title"
      />
      <textarea
        placeholder="Details (optional)"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={2}
        className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-navy placeholder:text-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        aria-label="Card details"
      />
      <div className="flex gap-2">
        <select
          value={label}
          onChange={(e) => setLabel(e.target.value as CardLabel)}
          className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-navy focus:border-primary focus:outline-none"
          aria-label="Card label"
        >
          {cardLabels.map((l) => (
            <option key={l.value} value={l.value}>
              {l.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-navy focus:border-primary focus:outline-none"
          aria-label="Due date"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary/90"
        >
          Add card
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-sm text-gray transition-colors hover:text-navy"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
