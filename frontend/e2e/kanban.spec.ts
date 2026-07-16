import { test, expect } from "@playwright/test";

async function gotoReady(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByTestId("app-ready")).toBeVisible();
}

test.describe("Sundance Renovations board", () => {
  test("loads with dummy cards in all 5 columns", async ({ page }) => {
    await gotoReady(page);
    await expect(page.getByTestId("board-title")).toHaveText("Sundance Renovations");
    await expect(page.getByTestId("column-col-backlog")).toBeVisible();
    await expect(page.getByTestId("column-col-todo")).toBeVisible();
    await expect(page.getByTestId("column-col-progress")).toBeVisible();
    await expect(page.getByTestId("column-col-review")).toBeVisible();
    await expect(page.getByTestId("column-col-done")).toBeVisible();
    await expect(page.getByText("Site assessment")).toBeVisible();
    await expect(page.getByText("Landscaping cleanup")).toBeVisible();
  });

  test("renames a column", async ({ page }) => {
    await gotoReady(page);
    await page.getByTestId("column-title-col-todo").click();
    const input = page.getByTestId("rename-input-col-todo");
    await input.fill("Ready");
    await input.press("Enter");
    await expect(page.getByTestId("column-title-col-todo")).toHaveText(/Ready/);
  });

  test("adds a card to a column", async ({ page }) => {
    await gotoReady(page);
    await page.getByTestId("add-card-col-backlog").click();
    await page.getByLabel("Card title").fill("E2E test card");
    await page.getByLabel("Card details").fill("Added by Playwright");
    await page.getByTestId("column-col-backlog").getByRole("button", { name: "Add card", exact: true }).click();
    await expect(page.getByText("E2E test card")).toBeVisible();
    await expect(page.getByText("Added by Playwright")).toBeVisible();
  });

  test("deletes a card", async ({ page }) => {
    await gotoReady(page);
    const card = page.getByTestId("card-card-1");
    await card.hover();
    await page.getByTestId("delete-card-1").click();
    await expect(page.getByText("Site assessment")).not.toBeVisible();
  });

  test("edits a card", async ({ page }) => {
    await gotoReady(page);
    await page.getByTestId("edit-card-1").click();
    await page.getByTestId("edit-title-card-1").fill("Updated site assessment");
    await page.getByTestId("edit-details-card-1").fill("Revised scope notes");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Updated site assessment")).toBeVisible();
    await expect(page.getByText("Revised scope notes")).toBeVisible();
    await expect(
      page.getByText("Site assessment", { exact: true }),
    ).not.toBeVisible();
  });

  test("drags a card to another column", async ({ page }) => {
    await gotoReady(page);
    const source = page.getByTestId("card-card-2");
    const targetColumn = page.getByTestId("column-col-todo");
    const sourceBox = await source.boundingBox();
    const targetBox = await targetColumn.boundingBox();
    if (!sourceBox || !targetBox) throw new Error("Missing bounding boxes");

    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + 80,
      { steps: 20 },
    );
    await page.mouse.up();

    await expect(
      page.getByTestId("column-col-todo").getByText("Select flooring"),
    ).toBeVisible();
    await expect(
      page.getByTestId("column-col-backlog").getByText("Select flooring"),
    ).not.toBeVisible();
  });

  test("searches cards", async ({ page }) => {
    await gotoReady(page);
    await page.getByTestId("search-input").fill("flooring");
    await expect(page.getByText("Select flooring")).toBeVisible();
    await expect(page.getByText("Site assessment")).not.toBeVisible();
  });

  test("persists board after reload", async ({ page }) => {
    await gotoReady(page);
    await page.getByTestId("board-title").click();
    await page.getByTestId("board-title-input").fill("My House Reno");
    await page.getByTestId("board-title-input").press("Enter");
    await page.waitForTimeout(700);
    await page.reload();
    await expect(page.getByTestId("app-ready")).toBeVisible();
    await expect(page.getByTestId("board-title")).toHaveText("My House Reno");
  });
});

test.describe("Vacations in Europe board", () => {
  test("switches to vacation board with Europe-themed cards", async ({ page }) => {
    await gotoReady(page);
    await page.getByTestId("board-tab-vacations-europe").click();
    await expect(page.getByTestId("board-title")).toHaveText("Vacations in Europe");
    await expect(page.getByText("Paris long weekend")).toBeVisible();
    await expect(page.getByText("Amsterdam canal cruise")).toBeVisible();
    await expect(page.getByText("Wishlist")).toBeVisible();
    await expect(page.getByText("Packing")).toBeVisible();
  });

  test("keeps separate data per board after switching", async ({ page }) => {
    await gotoReady(page);
    await page.getByTestId("board-title").click();
    await page.getByTestId("board-title-input").fill("Custom Reno Board");
    await page.getByTestId("board-title-input").press("Enter");
    await page.getByTestId("board-tab-vacations-europe").click();
    await expect(page.getByTestId("board-title")).toHaveText("Vacations in Europe");
    await page.getByTestId("board-tab-sundance-renovations").click();
    await expect(page.getByTestId("board-title")).toHaveText("Custom Reno Board");
  });
});
