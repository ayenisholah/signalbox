import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteDescription, siteName } from "../site.ts";
import "./globals.css";

export const metadata: Metadata = { title: siteName, description: siteDescription };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
