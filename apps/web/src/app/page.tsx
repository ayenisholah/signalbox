import { Separator } from "radix-ui";
import { siteDescription, siteName } from "../site.ts";

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-h4">{siteName}</h1>
      <Separator.Root className="my-4 border-t border-line" />
      <p className="text-fg-muted">{siteDescription}</p>
    </main>
  );
}
