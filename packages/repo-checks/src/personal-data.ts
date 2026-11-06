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

const EMAIL_LIKE = /[^\s"'<>(),]+(?:@|%40)[^\s"'<>(),/]+\.[\p{L}]{2,}/giu;

const scrubText = (text: string): string => text.replace(EMAIL_LIKE, "removed");

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
  ...(text.match(EMAIL_LIKE) ?? []),
  ...[...PERSONAL_KEYS].filter((key) => text.includes(`"${key}"`)),
];
