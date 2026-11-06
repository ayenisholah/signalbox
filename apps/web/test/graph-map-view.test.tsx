import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GraphMap } from "@traverse/graph-core";
import { describe, expect, it } from "vitest";
import demoGraph from "../src/generated/demo-graph.json";
import { GraphMapView } from "../src/graph-map/graph-map-view.tsx";
import { expectNoAxeViolations } from "./axe.ts";

const setup = () => render(<GraphMapView map={demoGraph as GraphMap} />);

describe("GraphMapView", () => {
  it("[FR-WB-1] starts with a prompt and every subgraph", () => {
    setup();

    expect(screen.getByText(/Open a type/)).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(11);
  });

  it("[FR-WB-1] finds a type and opens it by keyboard alone", async () => {
    setup();

    await userEvent.keyboard("/");
    await userEvent.keyboard("Employee{Enter}");

    const heading = screen.getByRole("heading", { level: 2, name: "Employee" });
    expect(document.activeElement).toBe(heading);
  });

  it("[FR-WB-1] follows a field's type to that type", async () => {
    setup();
    await userEvent.keyboard("/Employee{Enter}");

    await userEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByRole("heading", { level: 2, name: "Details" })).toBeTruthy();
  });

  it("[FR-WB-1] filters results to one subgraph", async () => {
    setup();
    const before = screen.getAllByRole("option").length;

    await userEvent.click(screen.getByRole("button", { name: /^mood/ }));

    expect(screen.getAllByRole("option").length).toBeLessThan(before);
    expect(screen.queryByRole("option", { name: /Hobby/ })).toBeNull();
  });

  it("[FR-WB-13] has no axe violations with a type open", async () => {
    const { container } = setup();
    await userEvent.keyboard("/Employee{Enter}");

    await expectNoAxeViolations(container);
  });
});
