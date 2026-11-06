import type { NextConfig } from "next";

// Static until M3, when the app moves to a server. See SPEC.md. GitHub Pages serves the public
// demo from a subpath, so its build sets BASE_PATH.
const config: NextConfig = { output: "export", basePath: process.env.BASE_PATH ?? "" };

export default config;
