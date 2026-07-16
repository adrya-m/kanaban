import { describe, it, expect } from "vitest";
import { boardReducer } from "./board-reducer";
import { dummyBoard } from "./dummy-data";
import type { Board } from "./types";

const emptyColumnBoard: Board = {
  id: "sundance-renovations",
  title: "Test Board",
  columns: [
    { id: "col-a", title: "A", cardIds: ["card-1"] },
    { id: "col-b", title: "B", cardIds: [] },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Only card",
      details: "Move me",
      label: "none",
      dueDate: null,
      archived: false,
    },
  },
};

describe("boardReducer", () => {
  it("renames a column", () => {
    const result = boardReducer(dummyBoard, {
      type: "RENAME_COLUMN",
      columnId: "col-todo",
      title: "Ready",
    });
    expect(result.columns.find((c) => c.id === "col-todo")?.title).toBe(
      "Ready",
    );
  });

  it("sets board title", () => {
    const result = boardReducer(dummyBoard, {
      type: "SET_BOARD_TITLE",
      title: "My Renovation",
    });
    expect(result.title).toBe("My Renovation");
  });

  it("moves a column", () => {
    const result = boardReducer(dummyBoard, {
      type: "MOVE_COLUMN",
      columnId: "col-done",
      toIndex: 0,
    });
    expect(result.columns[0].id).toBe("col-done");
  });

  it("edits a card", () => {
    const result = boardReducer(dummyBoard, {
      type: "EDIT_CARD",
      cardId: "card-1",
      title: "Updated assessment",
      details: "New scope notes",
      label: "urgent",
      dueDate: "2026-08-01",
    });
    expect(result.cards["card-1"]).toMatchObject({
      id: "card-1",
      title: "Updated assessment",
      details: "New scope notes",
      label: "urgent",
      dueDate: "2026-08-01",
    });
  });

  it("archives a card", () => {
    const result = boardReducer(dummyBoard, {
      type: "ARCHIVE_CARD",
      columnId: "col-backlog",
      cardId: "card-1",
    });
    expect(result.cards["card-1"].archived).toBe(true);
  });

  it("adds a card to a column", () => {
    const newCard = {
      id: "card-new",
      title: "New task",
      details: "Details here",
      label: "none" as const,
      dueDate: null,
      archived: false,
    };
    const result = boardReducer(dummyBoard, {
      type: "ADD_CARD",
      columnId: "col-backlog",
      card: newCard,
    });
    expect(result.cards["card-new"]).toEqual(newCard);
    expect(result.columns.find((c) => c.id === "col-backlog")?.cardIds).toContain(
      "card-new",
    );
  });

  it("deletes a card from a column", () => {
    const result = boardReducer(dummyBoard, {
      type: "DELETE_CARD",
      columnId: "col-backlog",
      cardId: "card-1",
    });
    expect(result.cards["card-1"]).toBeUndefined();
    expect(
      result.columns.find((c) => c.id === "col-backlog")?.cardIds,
    ).not.toContain("card-1");
  });

  it("moves a card within the same column", () => {
    const board: Board = {
      id: "sundance-renovations",
      title: "Test",
      columns: [
        { id: "col-1", title: "Col", cardIds: ["a", "b", "c"] },
      ],
      cards: {
        a: { id: "a", title: "A", details: "", label: "none", dueDate: null, archived: false },
        b: { id: "b", title: "B", details: "", label: "none", dueDate: null, archived: false },
        c: { id: "c", title: "C", details: "", label: "none", dueDate: null, archived: false },
      },
    };
    const result = boardReducer(board, {
      type: "MOVE_CARD",
      cardId: "a",
      fromColumnId: "col-1",
      toColumnId: "col-1",
      toIndex: 2,
    });
    expect(result.columns[0].cardIds).toEqual(["b", "c", "a"]);
  });

  it("moves a card across columns", () => {
    const result = boardReducer(dummyBoard, {
      type: "MOVE_CARD",
      cardId: "card-1",
      fromColumnId: "col-backlog",
      toColumnId: "col-todo",
      toIndex: 1,
    });
    expect(
      result.columns.find((c) => c.id === "col-backlog")?.cardIds,
    ).not.toContain("card-1");
    const todoIds = result.columns.find((c) => c.id === "col-todo")?.cardIds;
    expect(todoIds?.[1]).toBe("card-1");
  });

  it("moves a card to an empty column", () => {
    const result = boardReducer(emptyColumnBoard, {
      type: "MOVE_CARD",
      cardId: "card-1",
      fromColumnId: "col-a",
      toColumnId: "col-b",
      toIndex: 0,
    });
    expect(result.columns.find((c) => c.id === "col-a")?.cardIds).toEqual([]);
    expect(result.columns.find((c) => c.id === "col-b")?.cardIds).toEqual([
      "card-1",
    ]);
  });
});
