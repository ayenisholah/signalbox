import { Separator } from "radix-ui";
import { siteDescription, siteName } from "../site.ts";

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">{siteName}</h1>
      <Separator.Root className="my-4 border-t" />
      <p>{siteDescription}</p>
    </main>
  );
}
