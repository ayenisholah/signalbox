import type { GraphMap } from "@traverse/graph-core";
import { Separator } from "radix-ui";
import demoGraph from "../generated/demo-graph.json";
import { GraphMapView } from "../graph-map/graph-map-view.tsx";
import { siteDescription, siteName } from "../site.ts";

const demoSource = "https://github.com/wundergraph/cosmo/tree/router%400.366.1/demo";

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="text-h4">{siteName}</h1>
      <p className="text-fg-muted">{siteDescription}</p>
      <Separator.Root className="my-4 border-t border-line" />
      <GraphMapView map={demoGraph as GraphMap} />
      <p className="mt-8 text-caption text-fg-muted">
        This graph is the{" "}
        <a className="underline" href={demoSource}>
          Cosmo demo
        </a>
        , licensed under Apache-2.0. It defines no owners.
      </p>
    </main>
  );
}
