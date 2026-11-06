import { writeFileSync } from "node:fs";
import { renderTokensCss } from "@traverse/design-tokens";

writeFileSync("apps/web/src/generated/tokens.css", renderTokensCss());
