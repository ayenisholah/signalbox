import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MapType } from "@traverse/graph-core";
import { describe, expect, it, vi } from "vitest";
import { TypeDetail } from "../src/graph-map/type-detail.tsx";
import { expectNoAxeViolations } from "./axe.ts";

const employee: MapType = {
  name: "Employee",
  kind: "object",
  isEntity: true,
  subgraphs: [{ name: "employees", owner: "people-team" }, { name: "family" }],
  members: [],
  fields: [
    {
      name: "details",
      type: "Details",
      namedType: "Details",
      subgraphs: [{ name: "employees" }, { name: "family" }],
    },
    { name: "id", type: "Int!", namedType: "Int", subgraphs: [{ name: "employees" }] },
  ],
};

const mood: MapType = {
  name: "Mood",
  kind: "enum",
  isEntity: false,
  subgraphs: [{ name: "mood" }],
  members: ["HAPPY", "SAD"],
  fields: [],
};

const setup = (type = employee) => {
  const onOpen = vi.fn();
  const view = render(<TypeDetail type={type} knownTypes={new Set(["Details"])} onOpen={onOpen} />);
  return { ...view, onOpen };
};

describe("TypeDetail", () => {
  it("[FR-WB-1] names the type and says it's an entity", () => {
    setup();

    expect(screen.getByRole("heading", { level: 2, name: "Employee" })).toBeTruthy();
    expect(screen.getByText("Entity, object")).toBeTruthy();
  });

  it("[FR-WB-4] shows each subgraph with its owner, or says none is set", () => {
    setup();

    expect(screen.getByText(/people-team/)).toBeTruthy();
    expect(screen.getByText(/No owner set/)).toBeTruthy();
  });

  it("[FR-WB-4] shows the subgraphs behind each field", () => {
    setup();

    const row = screen.getByRole("row", { name: /details/ });

    expect(within(row).getByText("employees, family")).toBeTruthy();
  });

  it("[FR-WB-1] opens a field's type by keyboard", async () => {
    const { onOpen } = setup();
    screen.getByRole("button", { name: "Details" }).focus();

    await userEvent.keyboard("{Enter}");

    expect(onOpen).toHaveBeenCalledWith("Details");
  });

  it("[FR-WB-1] shows built-in types as plain text", () => {
    setup();

    expect(screen.queryByRole("button", { name: "Int!" })).toBeNull();
    expect(screen.getByText("Int!")).toBeTruthy();
  });

  it("[FR-WB-1] shows enum values, and no fields table when there are none", () => {
    setup(mood);

    expect(screen.getByText("HAPPY")).toBeTruthy();
    expect(screen.getByText("enum")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("[FR-WB-1] moves focus to the type when it opens, and when it changes", () => {
    const { rerender } = setup();
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Employee" }));

    rerender(<TypeDetail type={mood} knownTypes={new Set()} onOpen={vi.fn()} />);

    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Mood" }));
  });

  it.each([
    ["an object", employee],
    ["an enum", mood],
  ])("[FR-WB-13] has no axe violations for %s", async (_name, type) => {
    const { container } = setup(type);

    await expectNoAxeViolations(container);
  });
});
