import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ImpactPage from "../src/app/impact/page.tsx";

describe("impact page", () => {
  it("[FR-WB-2] loads the real demo schemas and query into the workbench", () => {
    vi.stubGlobal(
      "Worker",
      class {
        postMessage = vi.fn();
        terminate = vi.fn();
      },
    );

    render(<ImpactPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Impact check" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "employees" })).toBeTruthy();
    const operations = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Operations" });
    expect(operations.value).toContain("employees");
    vi.unstubAllGlobals();
  });
});
