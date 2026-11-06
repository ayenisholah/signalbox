import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scrubPersonalData } from "@traverse/repo-checks";

/**
 * Records real public responses for tests to replay. Personal fields go before anything is written,
 * and long version lists are cut to what the tests read.
 */
const save = (directory: string, name: string, value: unknown): void => {
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, `${name}.json`),
    `${JSON.stringify(scrubPersonalData(value), null, 2)}\n`,
  );
};

const get = async (url: string, accept = "application/json"): Promise<unknown> => {
  const response = await fetch(url, { headers: { accept, "user-agent": "traverse" } });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.json();
};

const trimVersions = (document: { versions: Record<string, unknown> }) => ({
  ...document,
  versions: Object.fromEntries(Object.keys(document.versions).map((version) => [version, {}])),
});

const recordPackage = async (name: string): Promise<void> => {
  const directory = "subgraphs/packages/test/fixtures";
  const file = name.replace("/", "__");
  const registry = `https://registry.npmjs.org/${name.replace("/", "%2f")}`;
  save(directory, `${file}.latest`, await get(`${registry}/latest`));
  const abbreviated = await get(registry, "application/vnd.npm.install-v1+json");
  save(directory, `${file}.versions`, trimVersions(abbreviated as never));
  const downloads = `https://api.npmjs.org/downloads/point/last-week/${name}`;
  save(directory, `${file}.downloads`, await get(downloads));
};

for (const name of ["ms", "express", "@types/ms"]) await recordPackage(name);
