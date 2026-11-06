import type { MapSubgraph } from "@traverse/graph-core";
import { count } from "./count.ts";

interface SubgraphListProps {
  subgraphs: MapSubgraph[];
  selected: string | null;
  onSelect: (subgraph: string | null) => void;
}

const button = "w-full rounded-md px-3 py-2 text-left aria-pressed:bg-brand-soft";

export function SubgraphList({ subgraphs, selected, onSelect }: SubgraphListProps) {
  return (
    <nav aria-label="Subgraphs">
      <h2 className="mb-2 text-subtitle">Subgraphs</h2>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            className={button}
            aria-pressed={selected === null}
            onClick={() => onSelect(null)}
          >
            All subgraphs
          </button>
        </li>
        {subgraphs.map(({ name, owner, entities, fieldCount }) => (
          <li key={name}>
            <button
              type="button"
              className={button}
              aria-pressed={selected === name}
              onClick={() => onSelect(name)}
            >
              <span className="block font-semibold">{name}</span>
              <span className="block text-caption text-fg-muted">
                {owner ?? "No owner set"} · {count(entities.length, "entity", "entities")} ·{" "}
                {count(fieldCount, "field", "fields")}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
