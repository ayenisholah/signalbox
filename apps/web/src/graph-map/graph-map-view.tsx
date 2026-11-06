"use client";

import type { GraphMap } from "@traverse/graph-core";
import { useMemo, useState } from "react";
import { searchTypes } from "./search.ts";
import { SubgraphList } from "./subgraph-list.tsx";
import { TypeDetail } from "./type-detail.tsx";
import { TypeSearch } from "./type-search.tsx";

export function GraphMapView({ map }: { map: GraphMap }) {
  const [query, setQuery] = useState("");
  const [subgraph, setSubgraph] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);

  const results = useMemo(
    () => searchTypes(map.types, query, subgraph),
    [map.types, query, subgraph],
  );
  const knownTypes = useMemo(() => new Set(map.types.map(({ name }) => name)), [map.types]);
  const type = map.types.find(({ name }) => name === opened);

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_18rem_1fr]">
      <SubgraphList subgraphs={map.subgraphs} selected={subgraph} onSelect={setSubgraph} />
      <TypeSearch query={query} results={results} onQueryChange={setQuery} onOpen={setOpened} />
      {type ? (
        <TypeDetail type={type} knownTypes={knownTypes} onOpen={setOpened} />
      ) : (
        <p className="text-fg-muted">Open a type to see its fields, subgraphs and owners.</p>
      )}
    </div>
  );
}
