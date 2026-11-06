import { render, screen } from "@testing-library/react";
import type { SchemaChangeReport } from "@traverse/graph-core";
import { describe, expect, it } from "vitest";
import { ImpactResults } from "../src/impact/impact-results.tsx";
import { expectNoAxeViolations } from "./axe.ts";

const report: SchemaChangeReport = {
  success: true,
  changes: [
    {
      coordinate: "Employee.hobbies",
      kind: "removed",
      subgraphs: [{ name: "hobbies", owner: "people-team" }],
    },
    { coordinate: "Filter.tag", kind: "required-input-added", subgraphs: [{ name: "search" }] },
  ],
  operations: [
    {
      name: "Hobbies",
      fields: ["Employee.hobbies"],
      errors: ['Cannot query field "hobbies" on type "Employee".'],
    },
    { name: "Uses", fields: ["Filter.tag"], errors: [] },
  ],
  screens: [{ name: "Profile", operations: ["Hobbies"] }],
};

const clean: SchemaChangeReport = { success: true, changes: [], operations: [], screens: [] };

describe("ImpactResults", () => {
  it("[FR-WB-2] says when a check is running", () => {
    render(<ImpactResults state={{ status: "checking" }} />);

    expect(screen.getByRole("status").textContent).toContain("Composing");
  });

  it("[FR-WB-2] shows an error when the check can't run", () => {
    render(<ImpactResults state={{ status: "failed", message: "boom" }} />);

    expect(screen.getByRole("alert").textContent).toContain("boom");
  });

  it("[FR-WB-2] shows every composition error for a draft", () => {
    const failure = {
      success: false as const,
      failed: "proposed" as const,
      errors: ["one", "two"],
    };
    render(<ImpactResults state={{ status: "done", report: failure }} />);

    expect(screen.getByRole("alert").textContent).toContain("This draft doesn't compose");
    expect(screen.getByText("one")).toBeTruthy();
    expect(screen.getByText("two")).toBeTruthy();
  });

  it("[FR-WB-2] says when the starting graph is the one that fails", () => {
    const failure = { success: false as const, failed: "current" as const, errors: ["one"] };
    render(<ImpactResults state={{ status: "done", report: failure }} />);

    expect(screen.getByRole("alert").textContent).toContain("The current graph doesn't compose");
  });

  it("[FR-WB-3] says when nothing changed", () => {
    render(<ImpactResults state={{ status: "done", report: clean }} />);

    expect(screen.getByRole("status").textContent).toContain("composes");
    expect(screen.getByText(/No field changes/)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("[FR-WB-3] doesn't call a draft safe when it breaks an operation", () => {
    render(<ImpactResults state={{ status: "done", report }} />);

    const status = screen.getByRole("status");
    expect(status.textContent).toBe("The draft composes, but it breaks 1 operation.");
    expect(status.className).toContain("text-danger");
  });

  it("[FR-WB-3] says how many operations break", () => {
    const broken = report.operations.map((operation) => ({ ...operation, errors: ["No"] }));
    render(<ImpactResults state={{ status: "done", report: { ...report, operations: broken } }} />);

    expect(screen.getByRole("status").textContent).toContain("breaks 2 operations");
  });

  it("[FR-WB-3] lists changes with their subgraphs and owners", () => {
    render(<ImpactResults state={{ status: "done", report }} />);

    const row = screen.getByRole("row", { name: /Employee.hobbies/ });
    expect(row.textContent).toContain("Removed");
    expect(row.textContent).toContain("hobbies · people-team");
    expect(screen.getByRole("row", { name: /Filter.tag/ }).textContent).toContain(
      "search · No owner set",
    );
  });

  it("[FR-WB-3] lists affected operations and why they break", () => {
    render(<ImpactResults state={{ status: "done", report }} />);

    expect(screen.getByRole("heading", { name: "Hobbies" })).toBeTruthy();
    expect(screen.getByText(/Cannot query field/)).toBeTruthy();
  });

  it("[FR-WB-3] shows an operation that breaks without using a changed field", () => {
    const broken = { name: "Broken", fields: [], errors: ["Unknown type"] };
    render(
      <ImpactResults state={{ status: "done", report: { ...report, operations: [broken] } }} />,
    );

    expect(screen.getByText("Unknown type")).toBeTruthy();
    expect(screen.queryByText(/^Uses/)).toBeNull();
  });

  it("[FR-WB-3] lists affected screens", () => {
    render(<ImpactResults state={{ status: "done", report }} />);

    expect(screen.getByRole("heading", { name: "Affected screens" })).toBeTruthy();
    expect(screen.getByText(/Profile/).textContent).toContain("Hobbies");
  });

  it("[FR-WB-3] leaves out the screens section when no screens are affected", () => {
    render(<ImpactResults state={{ status: "done", report: { ...report, screens: [] } }} />);

    expect(screen.queryByRole("heading", { name: "Affected screens" })).toBeNull();
  });

  it("[FR-WB-3] says when a change affects no operations", () => {
    const quiet = { ...report, operations: [], screens: [] };
    render(<ImpactResults state={{ status: "done", report: quiet }} />);

    expect(screen.getByText(/No operations are affected/)).toBeTruthy();
  });

  it.each([
    ["results", { status: "done", report } as const],
    ["an error", { status: "failed", message: "boom" } as const],
    ["a running check", { status: "checking" } as const],
  ])("[FR-WB-13] has no axe violations with %s", async (_name, state) => {
    const { container } = render(<ImpactResults state={state} />);

    await expectNoAxeViolations(container);
  });
});
