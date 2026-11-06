import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("[FR-WB-15] the home page loads with no sign-in", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(message.text());
  });

  await page.goto("/");

  await expect(page).toHaveTitle("Traverse");
  await expect(page.getByRole("heading", { level: 1, name: "Traverse" })).toBeVisible();
  expect(failures).toEqual([]);
});

test("[FR-WB-13] Tailwind styles reach the browser", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("main")).toHaveCSS("max-width", "672px");
});

test("[NFR-9] a real browser finds no WCAG 2.2 AA violations", async ({ page }) => {
  await page.goto("/");

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(violations).toEqual([]);
});
