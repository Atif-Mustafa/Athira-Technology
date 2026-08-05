import type { Metadata } from "next";
import { siteConfig } from "../config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Athira Technology",
    default: "Athira Technology | AI-Assisted SDLC",
  },
  description: "Explore Athira Technology's planned AI-assisted components for the software development lifecycle.",
  metadataBase: siteConfig.url,
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
        {children}
      </body>
    </html>
  );
}
