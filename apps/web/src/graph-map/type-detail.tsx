import type { MapField, MapType } from "@traverse/graph-core";
import { useEffect, useRef } from "react";

interface TypeDetailProps {
  type: MapType;
  knownTypes: Set<string>;
  onOpen: (name: string) => void;
}

const names = (field: MapField): string => field.subgraphs.map(({ name }) => name).join(", ");

function FieldRow({
  field,
  knownTypes,
  onOpen,
}: { field: MapField } & Omit<TypeDetailProps, "type">) {
  return (
    <tr className="border-t border-line">
      <th scope="row" className="py-1 pr-4 text-left font-normal">
        {field.name}
      </th>
      <td className="py-1 pr-4">
        {knownTypes.has(field.namedType) ? (
          <button
            type="button"
            className="text-brand-fg underline"
            onClick={() => onOpen(field.namedType)}
          >
            {field.type}
          </button>
        ) : (
          field.type
        )}
      </td>
      <td className="py-1 text-fg-muted">{names(field)}</td>
    </tr>
  );
}

export function TypeDetail({ type, knownTypes, onOpen }: TypeDetailProps) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => heading.current?.focus(), [type.name]);

  return (
    <article aria-labelledby="type-heading" className="min-w-0">
      <h2 ref={heading} id="type-heading" tabIndex={-1} className="text-h6 outline-none">
        {type.name}
      </h2>
      <p className="mb-4 text-fg-muted">{type.isEntity ? `Entity, ${type.kind}` : type.kind}</p>

      <h3 className="mb-1 text-subtitle">Subgraphs and owners</h3>
      <ul className="mb-4">
        {type.subgraphs.map(({ name, owner }) => (
          <li key={name}>
            {name} <span className="text-fg-muted">· {owner ?? "No owner set"}</span>
          </li>
        ))}
      </ul>

      {type.members.length > 0 ? (
        <>
          <h3 className="mb-1 text-subtitle">Values</h3>
          <ul className="mb-4">
            {type.members.map((member) => (
              <li key={member}>{member}</li>
            ))}
          </ul>
        </>
      ) : null}

      {type.fields.length > 0 ? (
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Fields">
          <table className="w-full">
            <caption className="mb-1 text-left text-subtitle">Fields</caption>
            <thead>
              <tr className="text-left text-caption text-fg-muted">
                <th scope="col" className="pr-4 font-normal">
                  Field
                </th>
                <th scope="col" className="pr-4 font-normal">
                  Type
                </th>
                <th scope="col" className="font-normal">
                  Subgraphs
                </th>
              </tr>
            </thead>
            <tbody>
              {type.fields.map((field) => (
                <FieldRow key={field.name} field={field} knownTypes={knownTypes} onOpen={onOpen} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </article>
  );
}
