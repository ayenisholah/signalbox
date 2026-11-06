"use client";

import type { SubgraphInput } from "@traverse/graph-core";
import { useMemo, useState } from "react";
import { createComposeWorker } from "./create-worker.ts";
import { SubgraphPicker, TextField } from "./draft-fields.tsx";
import { ImpactResults } from "./impact-results.tsx";
import { useImpactCheck } from "./use-impact-check.ts";

interface ImpactWorkbenchProps {
  subgraphs: SubgraphInput[];
  seedOperations: string;
  createWorker?: () => Worker;
}

const applyDrafts = (subgraphs: SubgraphInput[], drafts: Record<string, string>) =>
  subgraphs.map((subgraph) => ({ ...subgraph, sdl: drafts[subgraph.name] ?? subgraph.sdl }));

export function ImpactWorkbench({
  subgraphs,
  seedOperations,
  createWorker = createComposeWorker,
}: ImpactWorkbenchProps) {
  const [selected, setSelected] = useState((subgraphs[0] as SubgraphInput).name);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [operations, setOperations] = useState(seedOperations);
  const [screens, setScreens] = useState("");

  const input = useMemo(
    () => ({ current: subgraphs, proposed: applyDrafts(subgraphs, drafts), operations, screens }),
    [subgraphs, drafts, operations, screens],
  );
  const state = useImpactCheck(input, createWorker);
  const draft = input.proposed.find(({ name }) => name === selected) as SubgraphInput;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="min-w-0 space-y-4">
        <SubgraphPicker
          subgraphs={subgraphs}
          selected={selected}
          onSelect={setSelected}
          onReset={() => setDrafts({})}
        />
        <TextField
          id="draft"
          label={`Schema draft for ${selected}`}
          rows={16}
          value={draft.sdl}
          onChange={(value) => setDrafts({ ...drafts, [selected]: value })}
        />
        <TextField
          id="operations"
          label="Operations"
          rows={8}
          value={operations}
          onChange={setOperations}
        />
        <TextField
          id="screens"
          label="Screens (optional)"
          rows={3}
          value={screens}
          hint="One screen a line, as Screen name: Operation, Operation"
          onChange={setScreens}
        />
      </div>
      <section aria-labelledby="results-heading" className="min-w-0">
        <h2 id="results-heading" className="mb-2 text-h6">
          Results
        </h2>
        <ImpactResults state={state} />
      </section>
    </div>
  );
}
