import type { MapType } from "@traverse/graph-core";
import { count } from "./count.ts";

interface TypeResultsProps {
  results: MapType[];
  current: MapType | undefined;
  onOpen: (name: string) => void;
}

export const optionId = (name: string): string => `type-option-${name}`;

export function TypeResults({ results, current, onOpen }: TypeResultsProps) {
  return (
    <>
      <p role="status" className="my-2 text-caption text-fg-muted">
        {count(results.length, "type", "types")}
      </p>
      {results.length === 0 ? (
        <p>No types match. Try another name, or show all subgraphs.</p>
      ) : null}
      <ul
        id="type-results"
        role="listbox"
        aria-label="Matching types"
        className="max-h-[60vh] overflow-y-auto"
      >
        {results.map((type) => (
          <li
            key={type.name}
            id={optionId(type.name)}
            role="option"
            aria-selected={type === current}
            className="flex cursor-pointer justify-between gap-2 rounded-sm px-3 py-1 aria-selected:bg-brand-soft"
            onClick={() => onOpen(type.name)}
          >
            <span className="truncate">{type.name}</span>
            <span className="text-caption text-fg-muted">
              {type.isEntity ? "entity" : type.kind}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
