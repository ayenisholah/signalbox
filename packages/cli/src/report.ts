import type { AttributedChange, SchemaChangeReport, SubgraphRef } from "@traverse/graph-core";
import { countBroken, type CheckOutcome } from "./check.ts";

export const MARKER = "<!-- traverse-impact -->";
export const CLEAN_MARKER = "<!-- traverse-impact:clean -->";

/** GitHub rejects a comment body over 65,536 characters. This leaves room for the closing note. */
const MAX_COMMENT_LENGTH = 60_000;

const NO_OWNER = "No owner set";

interface Style {
  heading: (text: string) => string;
  value: (text: string) => string;
}

/**
 * A line break would let a name start a workflow command in the job log. Direction overrides and
 * zero-width characters would disguise it.
 */
const sanitize = (text: string): string => text.replace(/[\p{Cc}\p{Cf}\s]+/gu, " ");

/**
 * Names and messages come from the pull request, so they can't be trusted in a comment. HTML would
 * hide or forge content, including the marker, and an @mention would notify a stranger.
 */
export const escapeMarkdown = (text: string): string =>
  sanitize(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/[\\`*_{}[\]()#+!|~]/g, "\\$&")
    .replace(/@/g, "@​");

const textStyle: Style = { heading: (text) => `\n${text}`, value: sanitize };
const markdownStyle: Style = { heading: (text) => `\n### ${text}\n`, value: escapeMarkdown };

const plural = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? "" : "s"}`;

const describeSubgraph = ({ name, owner }: SubgraphRef, { value }: Style): string =>
  `${value(name)} (${value(owner ?? NO_OWNER)})`;

const describeChange = (change: AttributedChange, style: Style): string => {
  const subgraphs = change.subgraphs.map((subgraph) => describeSubgraph(subgraph, style));
  return `- ${style.value(change.coordinate)}: ${change.kind}, in ${subgraphs.join(", ")}`;
};

const section = (title: string, items: string[], style: Style): string[] =>
  items.length > 0 ? [style.heading(title), ...items] : [];

const reportSections = (report: SchemaChangeReport, skipped: string[], style: Style): string[] => {
  const { value } = style;
  const broken = report.operations.filter(({ errors }) => errors.length > 0);
  const affected = report.operations.filter(({ errors }) => errors.length === 0);
  return [
    ...section(
      "Broken operations",
      broken.flatMap(({ name, errors }) => [
        `- ${value(name)}`,
        ...errors.map((error) => `  - ${value(error)}`),
      ]),
      style,
    ),
    ...section(
      "Affected screens",
      report.screens.map(
        ({ name, operations }) => `- ${value(name)}: ${operations.map(value).join(", ")}`,
      ),
      style,
    ),
    ...section(
      "Affected operations that still validate",
      affected.map(({ name, fields }) => `- ${value(name)}: ${fields.map(value).join(", ")}`),
      style,
    ),
    ...section(
      "Schema changes",
      report.changes.map((change) => describeChange(change, style)),
      style,
    ),
    ...section(
      "Couldn't be checked",
      skipped.map((path) => `- ${value(path)}`),
      style,
    ),
  ];
};

const render = (outcome: CheckOutcome, style: Style): string[] => {
  switch (outcome.kind) {
    case "invalid":
      return [
        "Traverse couldn't run.",
        ...outcome.errors.map((error) => `- ${style.value(error)}`),
      ];
    case "no-base":
      return ["Skipped: the base has no traverse.json yet."];
    case "composition":
      return [
        "The proposed schema doesn't compose.",
        ...outcome.errors.map((error) => `- ${style.value(error)}`),
      ];
    case "report":
      return [
        `${plural(countBroken(outcome.report), "broken operation")}, ${plural(outcome.report.changes.length, "schema change")}.`,
        ...reportSections(outcome.report, outcome.skipped, style),
      ];
  }
};

export const renderText = (outcome: CheckOutcome): string =>
  `${render(outcome, textStyle).join("\n")}\n`;

const hasFindings = (outcome: CheckOutcome): boolean => {
  if (outcome.kind === "composition") return true;
  if (outcome.kind !== "report") return false;
  return outcome.report.operations.length > 0 || outcome.skipped.length > 0;
};

const truncate = (lines: string[]): string[] => {
  const kept: string[] = [];
  let length = 0;
  for (const line of lines) {
    length += line.length + 1;
    if (length > MAX_COMMENT_LENGTH) {
      return [
        ...kept,
        "",
        `Cut short: ${lines.length - kept.length} more lines are in the job log.`,
      ];
    }
    kept.push(line);
  }
  return kept;
};

export const renderMarkdown = (outcome: CheckOutcome): string => {
  const markers = hasFindings(outcome) ? [MARKER] : [MARKER, CLEAN_MARKER];
  const body = render(outcome, markdownStyle);
  return `${truncate([...markers, "## Traverse impact check", "", ...body]).join("\n")}\n`;
};
