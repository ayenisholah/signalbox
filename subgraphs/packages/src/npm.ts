import { fetchJson, type UpstreamFetch } from "@traverse/subgraph-kit";
import { z } from "zod";
import { normalizeRepositoryUrl } from "./repository-url.ts";

export interface PackageData {
  name: string;
  latestVersion: string;
  license: string | null;
  repositoryUrl: string | null;
  dependencies: { name: string; range: string }[];
}

export interface NpmClient {
  latest: (name: string) => Promise<PackageData | null>;
  versions: (name: string) => Promise<string[] | null>;
  weeklyDownloads: (name: string) => Promise<number | null>;
}

interface NpmOptions {
  fetch: UpstreamFetch;
  registryUrl: string;
  downloadsUrl: string;
}

// npm lets authors write almost anything in these fields. Each is held to the format it should
// have, because a list of what to refuse can't keep up with what an address can look like (GR-16).
const PACKAGE_NAME = /^(?:@[a-z0-9][\w.~-]*\/)?[a-z0-9][\w.~-]*$/i;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9a-z.-]+)?(?:\+[0-9a-z.-]+)?$/i;
const LICENSE = /^[a-z0-9.+() -]+$/i;
const RANGE = /^[a-z0-9.*^~<>=| -]+$/i;

const MAX_NAME_LENGTH = 214;
const MAX_TEXT_LENGTH = 256;
const MAX_INT = 2_147_483_647;

// The version document is npm's largest, at 8.8 MB for `typescript`, and it's slow to arrive.
const VERSIONS_TIMEOUT_MS = 15_000;

const isPackageName = (name: unknown): name is string =>
  typeof name === "string" && name.length <= MAX_NAME_LENGTH && PACKAGE_NAME.test(name);

const isVersion = (version: string): boolean =>
  version.length <= MAX_TEXT_LENGTH && SEMVER.test(version);

const matching = (pattern: RegExp, text: string | undefined): string | null =>
  text !== undefined && text.length <= MAX_TEXT_LENGTH && pattern.test(text) ? text : null;

const readDependencies = (dependencies: Record<string, string>): PackageData["dependencies"] =>
  Object.entries(dependencies)
    .filter(([name]) => isPackageName(name))
    .map(([name, range]) => ({ name, range: matching(RANGE, range) ?? "unknown" }));

/**
 * These schemas clean as they parse, so what leaves `fetchJson` is already safe to cache. Only what
 * they name survives, which drops `maintainers`, `author` and `contributors`.
 */
export const latestSchema = z
  .object({
    version: z.string().refine(isVersion),
    license: z
      .union([z.string(), z.object({ type: z.string() }).transform(({ type }) => type)])
      .optional()
      .catch(undefined),
    repository: z
      .union([z.string(), z.object({ url: z.string() }).transform(({ url }) => url)])
      .optional()
      .catch(undefined),
    dependencies: z.record(z.string(), z.string()).default({}).catch({}),
  })
  .transform(({ version, license, repository, dependencies }) => ({
    latestVersion: version,
    license: matching(LICENSE, license),
    repositoryUrl: normalizeRepositoryUrl(repository),
    dependencies: readDependencies(dependencies),
  }));

export const versionsSchema = z
  .object({ versions: z.record(z.string(), z.unknown()) })
  .transform(({ versions }) => Object.keys(versions).filter(isVersion));

export const downloadsSchema = z
  .object({ downloads: z.number().int().min(0).max(MAX_INT).nullable().catch(null) })
  .transform(({ downloads }) => downloads);

export const createNpmClient = ({ fetch, registryUrl, downloadsUrl }: NpmOptions): NpmClient => {
  const registryPath = (name: string): string => `${registryUrl}/${name.replaceAll("/", "%2f")}`;

  return {
    latest: async (name) => {
      if (!isPackageName(name)) return null;
      const url = `${registryPath(name)}/latest`;
      const document = await fetchJson({ source: "npm", url, schema: latestSchema, fetch });
      return document && { name, ...document };
    },
    versions: (name) => {
      if (!isPackageName(name)) return Promise.resolve(null);
      return fetchJson({
        source: "npm",
        url: registryPath(name),
        schema: versionsSchema,
        fetch,
        headers: { accept: "application/vnd.npm.install-v1+json" },
        timeoutMs: VERSIONS_TIMEOUT_MS,
      });
    },
    weeklyDownloads: (name) => {
      if (!isPackageName(name)) return Promise.resolve(null);
      const url = `${downloadsUrl}/downloads/point/last-week/${name}`;
      return fetchJson({ source: "npm downloads", url, schema: downloadsSchema, fetch });
    },
  };
};
