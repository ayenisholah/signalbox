import { expect, test, type Page } from "@playwright/test";

// Every URL here is relative, so the same tests run on a local build and on the public site.

// Next prefetches the home link without a trailing slash. GitHub Pages redirects that, and
// `vite preview` answers 404, so only the local run lets it through.
const isLocalQuirk = (url: string): boolean =>
  process.env.DEMO_URL === undefined && new URL(url).pathname === process.env.BASE_PATH;

const watchFailures = (page: Page): string[] => {
  const failures: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400 && !isLocalQuirk(response.url())) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => failures.push(`failed ${request.url()}`));
  return failures;
};

test("[FR-WB-15] loads the map with no sign-in, and every asset under the site's path", async ({
  page,
}) => {
  const failures = watchFailures(page);

  await page.goto("./", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1, name: "Traverse" })).toBeVisible();
  await page.keyboard.press("/");
  await page.keyboard.type("Employee");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: "Employee" })).toBeFocused();
  expect(failures).toEqual([]);
});

test("[FR-WB-15] loads the design's fonts and styles", async ({ page }) => {
  await page.goto("./", { waitUntil: "networkidle" });

  const poppins = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts]
      .filter(({ family }) => family.includes("Poppins"))
      .some(({ status }) => status === "loaded");
  });
  expect(poppins).toBe(true);
});

test("[FR-WB-15] opens the impact check directly, and composes in its worker", async ({ page }) => {
  const failures = watchFailures(page);
  const workers: string[] = [];
  page.on("worker", (worker) => workers.push(worker.url()));

  await page.goto("impact", { waitUntil: "networkidle" });

  await expect(page.getByText("The draft composes.")).toBeVisible();
  expect(workers).toHaveLength(1);
  expect(failures).toEqual([]);
});

test("[FR-WB-15] keeps its links inside the site", async ({ page, baseURL }) => {
  await page.goto("./", { waitUntil: "networkidle" });

  await page.getByRole("link", { name: "Impact check" }).click();

  await expect(page.getByText("The draft composes.")).toBeVisible();
  expect(page.url().startsWith(baseURL ?? "missing")).toBe(true);
});
