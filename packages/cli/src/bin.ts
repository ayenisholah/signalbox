#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { runCli } from "./cli.ts";

process.exitCode = await runCli(process.argv.slice(2), {
  root: process.cwd(),
  env: process.env,
  fetch,
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
  writeFile: writeFileSync,
});
