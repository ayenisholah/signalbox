import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "../src/app/page.tsx";
import { siteDescription, siteName } from "../src/site.ts";
import { expectNoAxeViolations } from "./axe.ts";

describe("home page", () => {
  it("[FR-WB-13] names the product and describes it", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1, name: siteName })).toBeTruthy();
    expect(screen.getByText(siteDescription)).toBeTruthy();
  });

  it("[FR-WB-13] renders the Radix separator", () => {
    render(<Page />);

    expect(screen.getByRole("separator")).toBeTruthy();
  });

  it("[FR-WB-1] shows the map, and credits the graph it comes from", () => {
    render(<Page />);

    expect(screen.getByRole("navigation", { name: "Subgraphs" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Cosmo demo" })).toBeTruthy();
    expect(screen.getByText(/Apache-2.0/)).toBeTruthy();
  });

  it("[FR-WB-13] has no axe violations", async () => {
    const { container } = render(<Page />);

    await expectNoAxeViolations(container);
  });
});
