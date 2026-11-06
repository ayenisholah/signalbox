import Link from "next/link";

export function SiteNav() {
  return (
    <nav aria-label="Main" className="mx-auto flex max-w-7xl gap-6 px-6 pt-4">
      <Link className="text-brand-fg underline" href="/">
        Graph map
      </Link>
      <Link className="text-brand-fg underline" href="/impact">
        Impact check
      </Link>
    </nav>
  );
}
