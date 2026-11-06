import { defineConfig, devices } from "@playwright/test";

const port = 4173;

export default defineConfig({
  testDir: "test/e2e",
  forbidOnly: true,
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}` },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
  // Serves the static export, because that's what the public demo ships.
  webServer: {
    command: `npx vite preview --outDir out --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
});
