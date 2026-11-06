import type { SubgraphInput } from "@traverse/graph-core";

const field = "w-full rounded-sm border border-fg-subtle bg-surface px-3 py-2 text-caption";
const label = "mb-1 block text-subtitle";

interface TextFieldProps {
  id: string;
  label: string;
  rows: number;
  value: string;
  hint?: string;
  onChange: (value: string) => void;
}

export function TextField({ id, label: text, rows, value, hint, onChange }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <textarea
        id={id}
        rows={rows}
        spellCheck={false}
        aria-describedby={hint && `${id}-hint`}
        className={`${field} font-mono`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-caption text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface SubgraphPickerProps {
  subgraphs: SubgraphInput[];
  selected: string;
  onSelect: (name: string) => void;
  onReset: () => void;
}

export function SubgraphPicker({ subgraphs, selected, onSelect, onReset }: SubgraphPickerProps) {
  return (
    <div className="flex items-end gap-4">
      <div className="grow">
        <label htmlFor="subgraph" className={label}>
          Subgraph
        </label>
        <select
          id="subgraph"
          className={field}
          value={selected}
          onChange={(event) => onSelect(event.target.value)}
        >
          {subgraphs.map(({ name }) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="rounded-md bg-brand px-4 py-2 font-semibold text-on-brand"
        onClick={onReset}
      >
        Reset drafts
      </button>
    </div>
  );
}
