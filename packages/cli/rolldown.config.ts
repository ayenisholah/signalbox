import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "rolldown";

const packageDirectory = (id: string): string | undefined =>
  /^(.*\/node_modules\/(?:@[^/]+\/)?[^/]+)\//.exec(id)?.[1];

const licenceText = (directory: string): string | undefined => {
  const file = readdirSync(directory).find((name) => /^licen[cs]e/i.test(name));
  return file && readFileSync(join(directory, file), "utf8");
};

const notice = (directory: string): string => {
  const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8")) as {
    name: string;
    version: string;
    license?: string;
  };
  const text = licenceText(directory) ?? `Licensed under ${manifest.license ?? "unknown terms"}.`;
  return `${manifest.name}@${manifest.version}\n\n${text.trim()}\n`;
};

/** Everything is inlined, so the licences of what's inside have to travel with the bundle. */
const thirdPartyNotices = (): Plugin => ({
  name: "third-party-notices",
  generateBundle(_, bundle) {
    const ids = Object.values(bundle).flatMap((item) =>
      item.type === "chunk" ? item.moduleIds : [],
    );
    const directories = [...new Set(ids.flatMap((id) => packageDirectory(id) ?? []))]
      .filter((directory) => existsSync(join(directory, "package.json")))
      .sort();
    this.emitFile({
      type: "asset",
      fileName: "THIRD-PARTY-NOTICES.txt",
      source: directories.map(notice).join(`\n${"-".repeat(72)}\n\n`),
    });
    this.emitFile({
      type: "asset",
      fileName: "LICENSE",
      source: readFileSync("../../LICENSE", "utf8"),
    });
  },
});

export default defineConfig({
  input: "src/bin.ts",
  platform: "node",
  plugins: [thirdPartyNotices()],
  output: { dir: "dist", entryFileNames: "bin.js", format: "esm" },
});
