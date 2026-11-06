import type { MapType } from "@traverse/graph-core";
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { optionId, TypeResults } from "./type-results.tsx";

interface TypeSearchProps {
  query: string;
  results: MapType[];
  onQueryChange: (query: string) => void;
  onOpen: (name: string) => void;
}

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

const useSearchShortcut = (input: RefObject<HTMLInputElement | null>): void => {
  useEffect(() => {
    const focusSearch = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || isTyping(event.target)) return;
      event.preventDefault();
      input.current?.focus();
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, [input]);
};

export function TypeSearch({ query, results, onQueryChange, onOpen }: TypeSearchProps) {
  const input = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(0);
  const current = results[Math.min(active, results.length - 1)];

  useSearchShortcut(input);

  useEffect(() => {
    if (current)
      document.getElementById(optionId(current.name))?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const move = (step: number) => {
    const count = results.length;
    if (count > 0) setActive((results.indexOf(current as MapType) + step + count) % count);
  };

  const change = (next: string) => {
    setActive(0);
    onQueryChange(next);
  };

  const keys: Record<string, () => void> = {
    ArrowDown: () => move(1),
    ArrowUp: () => move(-1),
    Enter: () => {
      if (current) onOpen(current.name);
    },
    Escape: () => change(""),
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  return (
    <section aria-label="Types" className="min-w-0">
      <label htmlFor="type-search" className="mb-2 block text-subtitle">
        Find a type or field
      </label>
      <input
        ref={input}
        id="type-search"
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="type-results"
        aria-activedescendant={current && optionId(current.name)}
        aria-autocomplete="list"
        autoComplete="off"
        className="w-full rounded-sm border border-fg-subtle bg-surface px-3 py-2"
        placeholder="Press / to search"
        value={query}
        onChange={(event) => change(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <TypeResults results={results} current={current} onOpen={onOpen} />
    </section>
  );
}
