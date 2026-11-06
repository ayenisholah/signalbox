import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const local = `http://127.0.0.1:${port}`;

// BASE_PATH tests a build served from a subpath, as GitHub Pages does. DEMO_URL tests the public
// site. Both run test/demo, because the other suites use paths from the root.
const basePath = process.env.BASE_PATH ?? "";
const demoUrl = process.env.DEMO_URL;
const isDemo = basePath !== "" || demoUrl !== undefined;

export default defineConfig({
  testDir: isDemo ? "test/demo" : "test/e2e",
  forbidOnly: true,
  reporter: "list",
  use: { baseURL: demoUrl ?? `${local}${basePath}/` },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
  // Serves the static export, because that's what the public demo ships.
  ...(demoUrl === undefined && {
    webServer: {
      command: `npx vite preview --outDir out --base ${basePath}/ --host 127.0.0.1 --port ${port} --strictPort`,
      url: `${local}${basePath}/`,
      reuseExistingServer: false,
    },
  }),
});
