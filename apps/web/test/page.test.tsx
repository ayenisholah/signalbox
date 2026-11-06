import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import Page from "../src/app/page.tsx";
import { siteDescription, siteName } from "../src/site.ts";

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

  it("[FR-WB-13] has no axe violations", async () => {
    const { container } = render(<Page />);

    const { violations } = await axe.run(container);

    expect(violations).toEqual([]);
  });
});
