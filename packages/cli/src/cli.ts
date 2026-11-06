import { parseArgs } from "node:util";
import { exitCode, runCheck } from "./check.ts";
import { upsertComment, type Fetch } from "./comment.ts";
import { renderMarkdown, renderText } from "./report.ts";
import { createGitReader, createWorkingTreeReader, listFiles } from "./source.ts";

export interface CliDependencies {
  root: string;
  env: Record<string, string | undefined>;
  fetch: Fetch;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  writeFile: (path: string, text: string) => void;
}

export const USAGE = `Usage:
  traverse check --base <ref> [--markdown <file>] [--strict]
  traverse comment --pr <number> --file <file>

check    Compares the working tree with <ref>, using traverse.json.
         Exits 0 if nothing breaks, 1 if an operation breaks or the
         proposed schema doesn't compose, and 2 if it can't run.
         --strict also exits 2 if a file couldn't be checked.
comment  Posts <file> to a pull request. Reads GITHUB_TOKEN and
         GITHUB_REPOSITORY.
`;

const options = {
  base: { type: "string" },
  markdown: { type: "string" },
  strict: { type: "boolean" },
  pr: { type: "string" },
  file: { type: "string" },
  help: { type: "boolean" },
} as const;

type Flags = ReturnType<
  typeof parseArgs<{ options: typeof options; allowPositionals: true }>
>["values"];

const fail = (dependencies: CliDependencies, message: string): number => {
  dependencies.stderr(`${message}\n`);
  return 2;
};

const check = ({ base, markdown, strict }: Flags, dependencies: CliDependencies): number => {
  if (base === undefined) return fail(dependencies, `--base is required.\n\n${USAGE}`);
  const { root, stdout, stderr, writeFile } = dependencies;
  const current = createGitReader(root, base);
  if (current === undefined) return fail(dependencies, `Can't find the ref ${base}.`);

  const outcome = runCheck({
    current,
    proposed: createWorkingTreeReader(root),
    listFiles: (patterns) => listFiles(root, patterns),
  });
  (outcome.kind === "invalid" ? stderr : stdout)(renderText(outcome));
  if (markdown !== undefined) writeFile(markdown, renderMarkdown(outcome));
  return exitCode(outcome, strict);
};

const comment = async ({ pr, file }: Flags, dependencies: CliDependencies): Promise<number> => {
  const { env, fetch, root, stdout } = dependencies;
  const { GITHUB_TOKEN: token, GITHUB_REPOSITORY: repository } = env;
  const pullRequest = Number(pr);
  if (!Number.isInteger(pullRequest) || pullRequest < 1) {
    return fail(dependencies, `--pr must be a pull request number.\n\n${USAGE}`);
  }
  if (!token || !repository) {
    return fail(dependencies, "GITHUB_TOKEN and GITHUB_REPOSITORY are required.");
  }
  const body = createWorkingTreeReader(root)(file ?? "");
  if (body === undefined) return fail(dependencies, `Can't read ${file}.`);

  const apiUrl = env.GITHUB_API_URL ?? "https://api.github.com";
  const result = await upsertComment({ apiUrl, repository, pullRequest, token, body, fetch });
  if (result.kind === "failed") return fail(dependencies, `GitHub answered ${result.status}.`);
  stdout(`Comment: ${result.kind}\n`);
  return 0;
};

const dispatch = async (args: string[], dependencies: CliDependencies): Promise<number> => {
  const { values, positionals } = parseArgs({ args, options, allowPositionals: true });
  const [command] = positionals;
  if (values.help) {
    dependencies.stdout(USAGE);
    return 0;
  }
  if (command === "check") return check(values, dependencies);
  if (command === "comment") return comment(values, dependencies);
  return fail(dependencies, USAGE);
};

export const runCli = async (args: string[], dependencies: CliDependencies): Promise<number> => {
  try {
    return await dispatch(args, dependencies);
  } catch (error) {
    return fail(dependencies, (error as Error).message);
  }
};
