import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Athira Technology",
    default: "Athira Technology | The Autonomous SDLC Workforce",
  },
  description: "Enterprise-grade AI solutions for the modern software development lifecycle. Build faster with our advanced AI agents.",
  metadataBase: new URL("https://athiratech.example.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="antialiased min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
