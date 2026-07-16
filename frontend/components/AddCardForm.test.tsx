import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect, vi } from "vitest";
import { AddCardForm } from "./AddCardForm";

afterEach(cleanup);

describe("AddCardForm", () => {
  it("submits title and details", async () => {
    const onAdd = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<AddCardForm boardId="sundance-renovations" onAdd={onAdd} onCancel={onCancel} />);

    await user.type(screen.getByLabelText("Card title"), "New task");
    await user.type(screen.getByLabelText("Card details"), "Task details");
    await user.click(screen.getByRole("button", { name: "Add card" }));

    expect(onAdd).toHaveBeenCalledWith("New task", "Task details", "none", null);
  });

  it("does not submit without a title", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<AddCardForm boardId="sundance-renovations" onAdd={onAdd} onCancel={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Add card" }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancel is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<AddCardForm boardId="sundance-renovations" onAdd={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
