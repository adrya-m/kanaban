import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { afterEach, describe, it, expect, vi } from "vitest";
import { KanbanCard } from "./Card";

afterEach(cleanup);

function renderCard(props: Parameters<typeof KanbanCard>[0]) {
  return render(
    <DndContext>
      <KanbanCard {...props} />
    </DndContext>,
  );
}

describe("KanbanCard", () => {
  const card = {
    id: "card-1",
    title: "Test card",
    details: "Some details",
    label: "none" as const,
    dueDate: null,
    archived: false,
  };

  it("renders card title and details", () => {
    renderCard({ boardId: "sundance-renovations", card, onEdit: vi.fn(), onDelete: vi.fn() });
    expect(screen.getByText("Test card")).toBeInTheDocument();
    expect(screen.getByText("Some details")).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderCard({ boardId: "sundance-renovations", card, onEdit: vi.fn(), onDelete });
    await user.click(screen.getByLabelText("Delete Test card"));
    expect(onDelete).toHaveBeenCalledWith("card-1");
  });

  it("saves edited card title and details", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    renderCard({ boardId: "sundance-renovations", card, onEdit, onDelete: vi.fn() });

    await user.click(screen.getByLabelText("Edit Test card"));
    await user.clear(screen.getByTestId("edit-title-card-1"));
    await user.type(screen.getByTestId("edit-title-card-1"), "Updated title");
    await user.clear(screen.getByTestId("edit-details-card-1"));
    await user.type(
      screen.getByTestId("edit-details-card-1"),
      "Updated details",
    );
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onEdit).toHaveBeenCalledWith("card-1", {
      title: "Updated title",
      details: "Updated details",
      label: "none",
      dueDate: null,
    });
  });
});
