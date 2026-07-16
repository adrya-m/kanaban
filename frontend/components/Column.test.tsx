import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { afterEach, describe, it, expect, vi } from "vitest";
import { Column } from "./Column";

afterEach(cleanup);

const column = { id: "col-1", title: "To Do", cardIds: ["card-1"] };
const cards = [
  {
    id: "card-1",
    title: "Existing card",
    details: "Details",
    label: "none" as const,
    dueDate: null,
    archived: false,
  },
];

function renderColumn(overrides: Partial<Parameters<typeof Column>[0]> = {}) {
  return render(
    <DndContext>
      <Column
        column={column}
        boardId="sundance-renovations"
        cards={cards}
        visibleCount={cards.length}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onEditCard={vi.fn()}
        onDeleteCard={vi.fn()}
        onArchiveCard={vi.fn()}
        onRestoreCard={vi.fn()}
        {...overrides}
      />
    </DndContext>,
  );
}

describe("Column", () => {
  it("renders column title and cards", () => {
    renderColumn();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Existing card")).toBeInTheDocument();
  });

  it("shows empty state when there are no cards", () => {
    renderColumn({ cards: [], visibleCount: 0 });
    expect(screen.getByTestId("empty-col-1")).toBeInTheDocument();
  });

  it("saves renamed column title on blur", async () => {
    const onRename = vi.fn();
    const user = userEvent.setup();
    renderColumn({ onRename });

    await user.click(screen.getByTestId("column-title-col-1"));
    const input = screen.getByTestId("rename-input-col-1");
    await user.clear(input);
    await user.type(input, "Ready");
    await user.tab();

    expect(onRename).toHaveBeenCalledWith("col-1", "Ready");
  });

  it("adds a card via the form", async () => {
    const onAddCard = vi.fn();
    const user = userEvent.setup();
    renderColumn({ onAddCard });

    await user.click(screen.getByTestId("add-card-col-1"));
    await user.type(screen.getByLabelText("Card title"), "New card");
    await user.click(screen.getByRole("button", { name: "Add card" }));

    expect(onAddCard).toHaveBeenCalledWith(
      "col-1",
      "New card",
      "",
      "none",
      null,
    );
  });
});
