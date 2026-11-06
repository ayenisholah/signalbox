import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MapType } from "@traverse/graph-core";
import { describe, expect, it, vi } from "vitest";
import { TypeSearch } from "../src/graph-map/type-search.tsx";
import { expectNoAxeViolations } from "./axe.ts";

const type = (name: string, isEntity = false): MapType => ({
  name,
  kind: "object",
  isEntity,
  subgraphs: [],
  fields: [],
  members: [],
});

const results = [type("Employee", true), type("Details"), type("Hobby")];

const setup = (props: Partial<Parameters<typeof TypeSearch>[0]> = {}) => {
  const onOpen = vi.fn();
  const onQueryChange = vi.fn();
  const view = render(
    <TypeSearch
      query=""
      results={results}
      onQueryChange={onQueryChange}
      onOpen={onOpen}
      {...props}
    />,
  );
  return { ...view, onOpen, onQueryChange, input: screen.getByRole("combobox") };
};

const selected = () => screen.getByRole("option", { selected: true }).textContent;

describe("TypeSearch", () => {
  it("[FR-WB-1] lists results, marks entities and counts them", () => {
    setup();

    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(selected()).toContain("entity");
    expect(screen.getByRole("status").textContent).toBe("3 types");
  });

  it("[FR-WB-1] uses the singular for one result", () => {
    setup({ results: [type("Hobby")] });

    expect(screen.getByRole("status").textContent).toBe("1 type");
  });

  it("[FR-WB-1] moves through results with the arrow keys, and wraps", async () => {
    const { input } = setup();
    await userEvent.click(input);

    await userEvent.keyboard("{ArrowDown}");
    expect(selected()).toContain("Details");
    expect(input.getAttribute("aria-activedescendant")).toBe("type-option-Details");

    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(selected()).toContain("Hobby");
  });

  it("[FR-WB-1] opens the active result with Enter", async () => {
    const { input, onOpen } = setup();
    await userEvent.click(input);

    await userEvent.keyboard("{ArrowDown}{Enter}");

    expect(onOpen).toHaveBeenCalledWith("Details");
  });

  it("[FR-WB-1] opens a result by click", async () => {
    const { onOpen } = setup();

    await userEvent.click(screen.getByRole("option", { name: /Hobby/ }));

    expect(onOpen).toHaveBeenCalledWith("Hobby");
  });

  it("[FR-WB-1] reports what's typed, and clears it with Escape", async () => {
    const { input, onQueryChange } = setup({ query: "em" });
    await userEvent.click(input);

    await userEvent.keyboard("p{Escape}");

    expect(onQueryChange.mock.calls).toEqual([["emp"], [""]]);
  });

  it("[FR-WB-1] leaves other keys alone", () => {
    const { input } = setup();

    expect(fireEvent.keyDown(input, { key: "a" })).toBe(true);
  });

  it("[FR-WB-1] focuses search with the slash key, anywhere but in a field", async () => {
    const { input } = setup();
    expect(document.activeElement).not.toBe(input);

    await userEvent.keyboard("/");
    expect(document.activeElement).toBe(input);

    expect(fireEvent.keyDown(input, { key: "/" })).toBe(true);
  });

  it("[FR-WB-1] stops listening for the slash key once it's gone", async () => {
    const { input, unmount } = setup();
    unmount();

    await userEvent.keyboard("/");

    expect(document.activeElement).not.toBe(input);
  });

  it("[FR-WB-1] shows an empty state, and ignores keys with no results", async () => {
    const { input, onOpen } = setup({ results: [] });
    await userEvent.click(input);

    await userEvent.keyboard("{ArrowDown}{Enter}");

    expect(screen.getByText(/No types match/)).toBeTruthy();
    expect(onOpen).not.toHaveBeenCalled();
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
  });

  it("[FR-WB-13] has no axe violations", async () => {
    const { container } = setup();

    await expectNoAxeViolations(container);
  });
});
