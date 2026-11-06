import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RootLayout, { metadata } from "../src/app/layout.tsx";
import { siteDescription, siteName } from "../src/site.ts";

describe("root layout", () => {
  it("[FR-WB-13] sets the document language and renders its children", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <p>child</p>
      </RootLayout>,
    );

    expect(html).toContain('<html lang="en"');
    expect(html).toContain("<p>child</p>");
  });

  it("[FR-WB-13] describes the site to browsers and crawlers", () => {
    expect(metadata).toEqual({ title: siteName, description: siteDescription });
  });
});
