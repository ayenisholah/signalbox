import type {
  AffectedOperation,
  AttributedChange,
  ChangeKind,
  SchemaChangeReport,
  Screen,
} from "@traverse/graph-core";
import { count } from "../graph-map/count.ts";
import type { ImpactState } from "./use-impact-check.ts";

const changeLabels: Record<ChangeKind, string> = {
  removed: "Removed",
  "type-changed": "Type changed",
  "arguments-changed": "Arguments changed",
  "required-input-added": "New required input",
};

const alert = "rounded-md bg-danger-soft p-3 text-danger";

function Changes({ changes }: { changes: AttributedChange[] }) {
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Field changes">
      <table className="w-full">
        <caption className="mb-1 text-left text-subtitle">Field changes</caption>
        <thead>
          <tr className="text-left text-caption text-fg-muted">
            <th scope="col" className="pr-4 font-normal">
              Field
            </th>
            <th scope="col" className="pr-4 font-normal">
              Change
            </th>
            <th scope="col" className="font-normal">
              Subgraphs and owners
            </th>
          </tr>
        </thead>
        <tbody>
          {changes.map(({ coordinate, kind, subgraphs }) => (
            <tr key={coordinate} className="border-t border-line">
              <th scope="row" className="py-1 pr-4 text-left font-normal">
                {coordinate}
              </th>
              <td className="py-1 pr-4">{changeLabels[kind]}</td>
              <td className="py-1 text-fg-muted">
                {subgraphs
                  .map(({ name, owner }) => `${name} · ${owner ?? "No owner set"}`)
                  .join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Operations({ operations }: { operations: AffectedOperation[] }) {
  if (operations.length === 0) return <p>No operations are affected.</p>;
  return (
    <section aria-label="Affected operations">
      <h3 className="mb-1 text-subtitle">Affected operations</h3>
      <ul className="space-y-2">
        {operations.map(({ name, fields, errors }) => (
          <li key={name}>
            <h4 className="font-semibold">{name}</h4>
            {fields.length > 0 ? <p className="text-fg-muted">Uses {fields.join(", ")}</p> : null}
            {errors.map((error) => (
              <p key={error} className="text-danger">
                {error}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Screens({ screens }: { screens: Screen[] }) {
  if (screens.length === 0) return null;
  return (
    <section aria-label="Screens">
      <h3 className="mb-1 text-subtitle">Affected screens</h3>
      <ul>
        {screens.map(({ name, operations }) => (
          <li key={name}>
            {name}: {operations.join(", ")}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Report({ report }: { report: SchemaChangeReport }) {
  const breaking = report.operations.filter(({ errors }) => errors.length > 0).length;
  return (
    <div className="space-y-4">
      {breaking === 0 ? (
        <p role="status" className="text-success">
          The draft composes.
        </p>
      ) : (
        <p role="status" className="text-danger">
          The draft composes, but it breaks {count(breaking, "operation", "operations")}.
        </p>
      )}
      {report.changes.length === 0 ? (
        <p>No field changes.</p>
      ) : (
        <>
          <Changes changes={report.changes} />
          <Operations operations={report.operations} />
          <Screens screens={report.screens} />
        </>
      )}
    </div>
  );
}

export function ImpactResults({ state }: { state: ImpactState }) {
  if (state.status === "checking") return <p role="status">Composing…</p>;
  if (state.status === "failed") {
    return (
      <p role="alert" className={alert}>
        The check couldn&apos;t run: {state.message}
      </p>
    );
  }
  const { report } = state;
  if (report.success) return <Report report={report} />;
  return (
    <div role="alert" className={alert}>
      <p className="mb-2 font-semibold">
        {report.failed === "proposed"
          ? "This draft doesn't compose."
          : "The current graph doesn't compose."}
      </p>
      <ul className="space-y-2">
        {report.errors.map((error) => (
          <li key={error} className="whitespace-pre-wrap">
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
}
