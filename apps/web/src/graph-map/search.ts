import type { MapType } from "@traverse/graph-core";

const rank = ({ name, fields }: MapType, query: string): number => {
  const lower = name.toLowerCase();
  if (lower === query) return 0;
  if (lower.startsWith(query)) return 1;
  if (lower.includes(query)) return 2;
  return fields.some((field) => field.name.toLowerCase().includes(query)) ? 3 : 4;
};

const inSubgraph = ({ subgraphs }: MapType, subgraph: string | null): boolean =>
  subgraph === null || subgraphs.some(({ name }) => name === subgraph);

/** Finds types by name, then by field name, with the closest name matches first. */
export const searchTypes = (
  types: MapType[],
  query: string,
  subgraph: string | null,
): MapType[] => {
  const needle = query.trim().toLowerCase();
  return types
    .filter((type) => inSubgraph(type, subgraph))
    .map((type) => ({ type, score: rank(type, needle) }))
    .filter(({ score }) => score < 4)
    .sort((a, b) => a.score - b.score || a.type.name.localeCompare(b.type.name))
    .map(({ type }) => type);
};
