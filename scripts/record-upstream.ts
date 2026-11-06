import { scrubPersonalData } from "@traverse/repo-checks";

/**
 * Prints real public responses as JSON, for tests to replay. Personal fields go before anything is
 * printed, and long version lists are cut to what the tests read. Run it through a redirect:
 *
 *   node scripts/record-upstream.ts npm > subgraphs/packages/test/fixtures/recordings.json
 */
const get = async (url: string, accept = "application/json"): Promise<unknown> => {
  const response = await fetch(url, { headers: { accept, "user-agent": "traverse" } });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.json();
};

const trimVersions = (document: { versions: Record<string, unknown> }) => ({
  ...document,
  versions: Object.fromEntries(Object.keys(document.versions).map((version) => [version, {}])),
});

const recordPackage = async (name: string): Promise<[string, unknown][]> => {
  const key = name.replaceAll("/", "__");
  const registry = `https://registry.npmjs.org/${name.replaceAll("/", "%2f")}`;
  const abbreviated = await get(registry, "application/vnd.npm.install-v1+json");
  return [
    [`${key}.latest`, await get(`${registry}/latest`)],
    [`${key}.versions`, trimVersions(abbreviated as never)],
    [`${key}.downloads`, await get(`https://api.npmjs.org/downloads/point/last-week/${name}`)],
  ];
};

const recordNpm = async (): Promise<[string, unknown][]> =>
  (await Promise.all(["ms", "express", "@types/ms"].map(recordPackage))).flat();

const sources: Record<string, () => Promise<[string, unknown][]>> = { npm: recordNpm };

const source = sources[String(process.argv[2])];
if (source === undefined) throw new Error(`Choose a source: ${Object.keys(sources).join(", ")}`);

const recordings = Object.fromEntries(await source());
process.stdout.write(`${JSON.stringify(scrubPersonalData(recordings), null, 2)}\n`);
