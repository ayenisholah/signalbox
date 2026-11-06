const SHORTHAND_HOSTS = {
  github: "github.com",
  gitlab: "gitlab.com",
  bitbucket: "bitbucket.org",
} as const;

const KNOWN_HOSTS: ReadonlySet<string> = new Set(Object.values(SHORTHAND_HOSTS));

const PART = String.raw`\w[\w.-]*`;
const SHORTHAND = new RegExp(`^(?:(github|gitlab|bitbucket):)?(${PART})/(${PART})$`);
const FULL_URL = new RegExp(
  String.raw`^(?:git\+)?(?:https?|ssh|git)://(?:[^/]*@)?([^/:]+)(?::\d+)?/(${PART})/(${PART})(?:[/#?].*)?$`,
);
const SCP = new RegExp(`^git@([^:]+):(${PART})/(${PART})$`);

const build = (host: string, owner: string, repository: string): string =>
  `https://${host}/${owner}/${repository.replace(/\.git$/, "")}`;

const fromShorthand = (text: string): string | null => {
  const [, prefix, owner, repository] = SHORTHAND.exec(text) ?? [];
  if (!owner || !repository) return null;
  const host = SHORTHAND_HOSTS[(prefix ?? "github") as keyof typeof SHORTHAND_HOSTS];
  return build(host, owner, repository);
};

const fromUrl = (text: string): string | null => {
  const [, host, owner, repository] = FULL_URL.exec(text) ?? SCP.exec(text) ?? [];
  return host && owner && repository && KNOWN_HOSTS.has(host)
    ? build(host, owner, repository)
    : null;
};

/**
 * Allows known hosts and plain owner and repository names, and nothing else. npm lets a package
 * write anything here, so an address, a credential or hostile text must fail to match (GR-13,
 * GR-16). Only GitHub repositories join to the `repositories` subgraph anyway.
 */
export const normalizeRepositoryUrl = (value: string | undefined): string | null => {
  const text = value ?? "";
  return fromShorthand(text) ?? fromUrl(text);
};
