import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteNav } from "../src/site-nav.tsx";
import { expectNoAxeViolations } from "./axe.ts";

describe("SiteNav", () => {
  it("[FR-WB-2] links to the map and the impact check", () => {
    render(<SiteNav />);

    expect(screen.getByRole("link", { name: "Graph map" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Impact check" }).getAttribute("href")).toBe("/impact");
  });

  it("[FR-WB-13] has no axe violations", async () => {
    const { container } = render(<SiteNav />);

    await expectNoAxeViolations(container);
  });
});
