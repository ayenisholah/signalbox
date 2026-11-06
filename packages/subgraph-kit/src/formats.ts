const PACKAGE_NAME = /^(?:@[a-z0-9][\w.~-]*\/)?[a-z0-9][\w.~-]*$/i;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9a-z.-]+)?(?:\+[0-9a-z.-]+)?$/i;
const MAX_NAME_LENGTH = 214;
const MAX_VERSION_LENGTH = 256;

export const isPackageName = (name: unknown): name is string =>
  typeof name === "string" && name.length <= MAX_NAME_LENGTH && PACKAGE_NAME.test(name);

export const isVersion = (version: unknown): version is string =>
  typeof version === "string" && version.length <= MAX_VERSION_LENGTH && SEMVER.test(version);

/** A source's own address, or a local stand-in for tests. A wrong one could answer anything. */
export const isSafeEndpoint = (url: string, official: string): boolean => {
  const { protocol, hostname } = new URL(url);
  const isLocal = protocol === "http:" && (hostname === "127.0.0.1" || !hostname.includes("."));
  return url === official || isLocal;
};
