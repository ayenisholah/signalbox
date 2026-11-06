import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubgraphList } from "../src/graph-map/subgraph-list.tsx";
import { expectNoAxeViolations } from "./axe.ts";

const subgraphs = [
  { name: "mood", entities: ["Employee"], fieldCount: 3 },
  { name: "family", owner: "people-team", entities: [], fieldCount: 9 },
];

describe("SubgraphList", () => {
  it("[FR-WB-1] shows each subgraph's owner, entities and fields", () => {
    render(<SubgraphList subgraphs={subgraphs} selected={null} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: /family/ }).textContent).toContain(
      "people-team · 0 entities · 9 fields",
    );
  });

  it("[FR-WB-1] uses the singular for one entity and one field", () => {
    const single = [{ name: "solo", entities: ["Employee"], fieldCount: 1 }];
    render(<SubgraphList subgraphs={single} selected={null} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: /solo/ }).textContent).toContain(
      "1 entity · 1 field",
    );
  });

  it("[FR-WB-1] says so when a subgraph has no owner, and never invents one", () => {
    render(<SubgraphList subgraphs={subgraphs} selected={null} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: /mood/ }).textContent).toContain("No owner set");
  });

  it("[FR-WB-1] marks the selected subgraph as pressed", () => {
    render(<SubgraphList subgraphs={subgraphs} selected="mood" onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: /mood/, pressed: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: "All subgraphs", pressed: false })).toBeTruthy();
  });

  it("[FR-WB-1] selects a subgraph, and all subgraphs, by keyboard", async () => {
    const onSelect = vi.fn();
    render(<SubgraphList subgraphs={subgraphs} selected="mood" onSelect={onSelect} />);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    expect(onSelect.mock.calls).toEqual([[null], ["mood"]]);
  });

  it("[FR-WB-13] has no axe violations", async () => {
    const { container } = render(
      <SubgraphList subgraphs={subgraphs} selected="mood" onSelect={vi.fn()} />,
    );

    await expectNoAxeViolations(container);
  });
});
