import type { SchemaChangeReport } from "@traverse/graph-core";
import { describe, expect, it } from "vitest";
import type { CheckOutcome } from "../src/check.ts";
import { CLEAN_MARKER, escapeMarkdown, MARKER, renderMarkdown, renderText } from "../src/report.ts";

const report: SchemaChangeReport = {
  success: true,
  changes: [
    {
      coordinate: "Query.b",
      kind: "removed",
      subgraphs: [{ name: "s", owner: "team" }, { name: "t" }],
    },
  ],
  operations: [
    { name: "A", fields: ["Query.b"], errors: ['Cannot query field "b" on type "Query".'] },
    { name: "C", fields: ["Query.b"], errors: [] },
  ],
  screens: [{ name: "Home", operations: ["A", "C"] }],
};

const found: CheckOutcome = { kind: "report", report, skipped: ["src/a.ts"] };
const clean: CheckOutcome = {
  kind: "report",
  report: { success: true, changes: [], operations: [], screens: [] },
  skipped: [],
};

describe("renderText", () => {
  it("[FR-WB-5] lists operations, screens, subgraphs, owners and skipped files", () => {
    const text = renderText(found);

    expect(text).toContain("1 broken operation, 1 schema change.");
    expect(text).toContain('Cannot query field "b"');
    expect(text).toContain("- Home: A, C");
    expect(text).toContain("- C: Query.b");
    expect(text).toContain("- Query.b: removed, in s (team), t (No owner set)");
    expect(text).toContain("- src/a.ts");
  });

  it("[FR-WB-5] leaves out sections with nothing in them", () => {
    expect(renderText(clean)).toBe("0 broken operations, 0 schema changes.\n");
  });

  it("[FR-WB-5] explains each other outcome", () => {
    expect(renderText({ kind: "no-base" })).toContain("no traverse.json");
    expect(renderText({ kind: "invalid", errors: ["bad"] })).toContain("- bad");
    expect(renderText({ kind: "composition", errors: ["clash"] })).toContain("- clash");
  });
});

describe("renderText on hostile names", () => {
  it("[FR-WB-5] can't start a workflow command on its own line", () => {
    const text = renderText({ kind: "invalid", errors: ["x\n::error title=Forged::y\r\n::stop"] });

    expect(text).not.toMatch(/^::/m);
  });

  it("[FR-WB-5] removes direction overrides and zero-width characters", () => {
    const text = renderText({ kind: "invalid", errors: ["a\u202eb\u200bc"] });

    expect(text).not.toMatch(/\p{Cf}/u);
  });
});

describe("renderMarkdown", () => {
  it("[FR-WB-5] starts with the marker and has headed sections", () => {
    const markdown = renderMarkdown(found);

    expect(markdown.startsWith(`${MARKER}\n`)).toBe(true);
    expect(markdown).not.toContain(CLEAN_MARKER);
    expect(markdown).toContain("### Broken operations");
    expect(markdown).toContain("### Affected screens");
  });

  it.each<[string, CheckOutcome]>([
    ["nothing is affected", clean],
    ["the base has no config", { kind: "no-base" }],
    ["the check couldn't run", { kind: "invalid", errors: ["bad"] }],
  ])("[FR-WB-5] marks the comment clean when %s", (_, outcome) => {
    expect(renderMarkdown(outcome)).toContain(CLEAN_MARKER);
  });

  it.each<[string, CheckOutcome]>([
    ["composition failed", { kind: "composition", errors: ["clash"] }],
    ["a file was skipped", { ...(clean as object), skipped: ["a.ts"] } as CheckOutcome],
  ])("[FR-WB-5] needs a comment when %s", (_, outcome) => {
    expect(renderMarkdown(outcome)).not.toContain(CLEAN_MARKER);
  });

  it("[FR-WB-5] cuts a long report short and says so", () => {
    const operations = Array.from({ length: 5000 }, (_, index) => ({
      name: `Operation${index}WithAVeryLongNameThatFillsTheLine`,
      fields: [],
      errors: ["error"],
    }));
    const markdown = renderMarkdown({
      kind: "report",
      report: { ...report, operations },
      skipped: [],
    });

    expect(markdown.length).toBeLessThan(65_536);
    expect(markdown).toContain("more lines are in the job log");
  });

  it("[FR-WB-5] can't be forged by an operation name", () => {
    const name = `${CLEAN_MARKER} @someone`;
    const markdown = renderMarkdown({
      kind: "report",
      report: { ...report, operations: [{ name, fields: [], errors: ["x"] }] },
      skipped: [],
    });

    expect(markdown).not.toContain(CLEAN_MARKER);
    expect(markdown).not.toContain("@someone");
  });
});

describe("escapeMarkdown", () => {
  it("[FR-WB-5] neutralises HTML, formatting, mentions and line breaks", () => {
    expect(escapeMarkdown("<img src=x> & *b*")).toBe("&lt;img src=x&gt; &amp; \\*b\\*");
    expect(escapeMarkdown("@owner")).toBe("@​owner");
    expect(escapeMarkdown("one\n# two")).toBe("one \\# two");
  });
});
