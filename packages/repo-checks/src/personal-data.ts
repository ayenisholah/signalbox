/**
 * The repository is public, so recordings of real responses lose personal fields before they're
 * written. The pattern is broad on purpose: `ms@2.1.3` survives only because a version can't end in
 * a letter, and a false match costs a word in a fixture, not an address in public.
 */
const PERSONAL_KEYS = new Set([
  "_npmOperationalInternal",
  "_npmUser",
  "author",
  "contributors",
  "email",
  "maintainers",
  "publisher",
]);

const SEPARATORS = /([\s"'<>(),]+)/;
const AT = /@|%40/;
const DOMAIN = /^(?:@|%40)[^/]+\.\p{L}{2,}/u;

const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}\.?$/;

const isEmailLike = (token: string): boolean => {
  const at = token.search(AT);
  return at > 0 && DOMAIN.test(token.slice(at));
};

const isPersonal = (token: string): boolean => isEmailLike(token) || IPV4.test(token);

// Splitting first keeps this linear. These run on untrusted text, and one pattern over the whole
// string would backtrack badly on a long run of ordinary characters.
const scrubText = (text: string): string =>
  text
    .split(SEPARATORS)
    .map((token) => (isPersonal(token) ? "removed" : token))
    .join("");

export const scrubPersonalData = (value: unknown): unknown => {
  if (typeof value === "string") return scrubText(value);
  if (Array.isArray(value)) return value.map(scrubPersonalData);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !PERSONAL_KEYS.has(key))
      .map(([key, field]) => [scrubText(key), scrubPersonalData(field)]),
  );
};

export const findPersonalData = (text: string): string[] => [
  ...text.split(SEPARATORS).filter(isPersonal),
  ...[...PERSONAL_KEYS].filter((key) => text.includes(`"${key}"`)),
];
