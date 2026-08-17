import type { Metadata } from "next";
import { siteConfig } from "../config/site";
import { organizationStructuredData } from "../lib/seo";
import { StructuredData } from "../components/seo/StructuredData";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Athira Technology",
    default: "Athira Technology | Human-Reviewed AI for the SDLC",
  },
  description: siteConfig.description,
  metadataBase: siteConfig.url,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "Athira Technology | Human-Reviewed AI for the SDLC",
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "Athira Technology | Human-Reviewed AI for the SDLC",
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-blue-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Skip to main content
        </a>
        <StructuredData data={organizationStructuredData()} />
        {children}
      </body>
    </html>
  );
}
