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

  await expect(page.getByRole("main")).toHaveCSS("max-width", "1280px");
});

test("[FR-WB-13] the Frox font loads", async ({ page }) => {
  await page.goto("/");

  const weights = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts]
      .filter(({ family, status }) => family.includes("Poppins") && status === "loaded")
      .map(({ weight }) => weight);
  });

  expect(weights).toEqual(expect.arrayContaining(["400", "600"]));
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-family", /Poppins/);
});

test("[NFR-10] text scales with the user's font size", async ({ page }) => {
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveCSS("font-size", "28px");

  await page.addStyleTag({ content: "html { font-size: 200%; }" });

  await expect(heading).toHaveCSS("font-size", "56px");
});

for (const [colorScheme, canvas] of [
  ["light", "rgb(245, 245, 250)"],
  ["dark", "rgb(31, 33, 40)"],
] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ colorScheme });

    test("[FR-WB-13] follows the operating system setting", async ({ page }) => {
      await page.goto("/");

      await expect(page.locator("body")).toHaveCSS("background-color", canvas);
    });

    test("[NFR-9] a real browser finds no WCAG 2.2 AA violations", async ({ page }) => {
      await page.goto("/");

      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      expect(violations).toEqual([]);
    });
  });
}
