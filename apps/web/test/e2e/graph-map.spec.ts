import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const open = async (page: Page) => {
  await page.goto("/", { waitUntil: "networkidle" });
};

const openEmployee = async (page: Page) => {
  await open(page);
  await page.keyboard.press("/");
  await page.keyboard.type("Employee");
  await page.keyboard.press("Enter");
};

test("[FR-WB-1] renders subgraphs and entities from the real schemas", async ({ page }) => {
  await open(page);

  const subgraphs = page.getByRole("navigation", { name: "Subgraphs" });
  await expect(subgraphs.getByRole("button")).toHaveCount(11);
  await expect(subgraphs.getByRole("button", { name: /^mood/ })).toContainText("No owner set");
  await expect(page.getByRole("option", { name: /^Employee\s*entity$/ })).toBeVisible();
});

test("[FR-WB-1] finds a type and opens it by keyboard alone", async ({ page }) => {
  await openEmployee(page);

  const heading = page.getByRole("heading", { level: 2, name: "Employee" });
  await expect(heading).toBeFocused();
  await expect(page.getByRole("row", { name: /^details/ })).toContainText("employees, family");
});

test("[FR-WB-1] moves through results with the arrow keys", async ({ page }) => {
  await open(page);
  await page.keyboard.press("/");
  await page.keyboard.type("employee");

  await page.keyboard.press("ArrowDown");
  const second = page.getByRole("option", { selected: true }).locator("span").first();
  const name = await second.textContent();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { level: 2, name: name ?? "" })).toBeFocused();
});

test("[FR-WB-1] follows a field's type by keyboard", async ({ page }) => {
  await openEmployee(page);

  await page.getByRole("button", { name: "Details", exact: true }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { level: 2, name: "Details" })).toBeFocused();
});

test("[FR-WB-1] filters types to one subgraph, and shows an empty state", async ({ page }) => {
  await open(page);
  const count = await page.getByRole("option").count();

  await page.getByRole("button", { name: /^mood/ }).click();
  await expect(page.getByRole("option", { name: /Hobby/ })).toHaveCount(0);
  expect(await page.getByRole("option").count()).toBeLessThan(count);

  await page.getByRole("combobox").fill("zzzz");
  await expect(page.getByText(/No types match/)).toBeVisible();
});

test("[FR-WB-1] fits a phone without sideways scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openEmployee(page);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
});

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ colorScheme });

    test("[NFR-9] an open type has no WCAG 2.2 AA violations", async ({ page }) => {
      await openEmployee(page);

      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      expect(violations).toEqual([]);
    });
  });
}
