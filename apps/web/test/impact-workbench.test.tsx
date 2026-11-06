import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckInput } from "../src/impact/check-request.ts";
import { ImpactWorkbench } from "../src/impact/impact-workbench.tsx";
import { expectNoAxeViolations } from "./axe.ts";

const subgraphs = [
  { name: "a", sdl: "type Query { a: Int }" },
  { name: "b", sdl: "type Query { b: Int }" },
];

const setup = () => {
  const postMessage = vi.fn();
  const createWorker = () => ({ postMessage, terminate: vi.fn() }) as unknown as Worker;
  const view = render(
    <ImpactWorkbench subgraphs={subgraphs} seedOperations="{ a }" createWorker={createWorker} />,
  );
  const sent = () => {
    act(() => {
      vi.advanceTimersByTime(300);
    });
    const [request] = postMessage.mock.lastCall as [{ input: CheckInput }];
    return request.input;
  };
  return { ...view, sent };
};

const draft = () => screen.getByRole<HTMLTextAreaElement>("textbox", { name: /Schema draft/ });
const valueOf = (element: HTMLElement) => (element as HTMLTextAreaElement).value;

describe("ImpactWorkbench", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("[FR-WB-2] starts from the first subgraph and the seed operations", () => {
    setup();

    expect(valueOf(draft())).toBe(subgraphs[0]?.sdl);
    expect(valueOf(screen.getByRole("textbox", { name: "Operations" }))).toBe("{ a }");
  });

  it("[FR-WB-2] sends the edited draft as the proposed graph", () => {
    const { sent } = setup();

    fireEvent.change(draft(), { target: { value: "type Query { a: String }" } });
    const input = sent();

    expect(input.current).toEqual(subgraphs);
    expect(input.proposed[0]?.sdl).toBe("type Query { a: String }");
    expect(input.proposed[1]).toEqual(subgraphs[1]);
  });

  it("[FR-WB-2] keeps an edit when switching subgraph and back", async () => {
    setup();
    fireEvent.change(draft(), { target: { value: "edited" } });
    const select = screen.getByRole("combobox", { name: "Subgraph" });

    await userEvent.selectOptions(select, "b");
    expect(valueOf(draft())).toBe(subgraphs[1]?.sdl);

    await userEvent.selectOptions(select, "a");
    expect(valueOf(draft())).toBe("edited");
  });

  it("[FR-WB-2] restores the original schemas", async () => {
    const { sent } = setup();
    fireEvent.change(draft(), { target: { value: "edited" } });

    await userEvent.click(screen.getByRole("button", { name: "Reset drafts" }));

    expect(valueOf(draft())).toBe(subgraphs[0]?.sdl);
    expect(sent().proposed).toEqual(subgraphs);
  });

  it("[FR-WB-3] sends edited operations and screens", () => {
    const { sent } = setup();

    fireEvent.change(screen.getByRole("textbox", { name: "Operations" }), {
      target: { value: "{ b }" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Screens/ }), {
      target: { value: "Home: A" },
    });

    expect(sent()).toMatchObject({ operations: "{ b }", screens: "Home: A" });
  });

  it("[FR-WB-13] has no axe violations", async () => {
    vi.useRealTimers();
    const { container } = setup();

    await expectNoAxeViolations(container);
  });
});
