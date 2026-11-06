import { isAbsolute, normalize, sep } from "node:path";
import { z } from "zod";

export const CONFIG_FILE = "traverse.json";

const insideRepository = (path: string): boolean => {
  const segments = normalize(path).split(sep);
  return !isAbsolute(path) && !segments.includes("..") && !segments.includes(".git");
};

// A glob is checked before it expands, so `{..,src}/*` has to be caught by what it contains.
const staysInRepository = (pattern: string): boolean =>
  insideRepository(pattern) && !pattern.includes("..") && !/[{,(|]\//.test(pattern);

const name = z.string().min(1);
const OUTSIDE = "must stay inside the repository";

// A parse error quotes the file, so only schema files may be read as schemas.
const schemaPath = name
  .refine(insideRepository, OUTSIDE)
  .refine((path) => /\.(graphqls?|gql)$/.test(path), "must be a .graphql, .graphqls or .gql file");

const configSchema = z.strictObject({
  subgraphs: z.array(z.strictObject({ name, schema: schemaPath, owner: name.optional() })).min(1),
  operations: z.array(name.refine(staysInRepository, OUTSIDE)).min(1),
  screens: z.array(z.strictObject({ name, operations: z.array(name).min(1) })).default([]),
});

export type TraverseConfig = z.infer<typeof configSchema>;

export type ConfigResult =
  { success: true; config: TraverseConfig } | { success: false; errors: string[] };

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

export const parseConfig = (text: string): ConfigResult => {
  const json = parseJson(text);
  if (json === undefined) return { success: false, errors: [`${CONFIG_FILE} isn't valid JSON.`] };

  const parsed = configSchema.safeParse(json);
  if (parsed.success) return { success: true, config: parsed.data };
  return {
    success: false,
    errors: parsed.error.issues.map(
      ({ path, message }) => `${CONFIG_FILE}: ${path.join(".") || "root"}: ${message}`,
    ),
  };
};
