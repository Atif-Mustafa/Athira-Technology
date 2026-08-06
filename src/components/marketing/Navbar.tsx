"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { primaryNavigation } from "../../content/marketing";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpenForPath, setMenuOpenForPath] = useState<string | null>(null);
  const isOpen = menuOpenForPath === pathname;
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpenForPath(null);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const isCurrentPage = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <nav aria-label="Primary navigation" className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" aria-label="Athira Technology home" className="flex items-center space-x-2 rounded-sm">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full opacity-90" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Athira<span className="text-blue-500">Tech</span></span>
            </Link>
          </div>
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {primaryNavigation.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isCurrentPage(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-sm text-sm font-medium transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950",
                    isCurrentPage(link.href) ? "text-white" : "text-slate-400"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Plan a discovery
              </Link>
            </div>
          </div>
          <div className="lg:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpenForPath(isOpen ? null : pathname)}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {isOpen ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
          <div
            id="mobile-navigation"
            className="lg:hidden bg-slate-950/95 backdrop-blur-md border-b border-slate-800/60"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {primaryNavigation.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpenForPath(null)}
                  aria-current={isCurrentPage(link.href) ? "page" : undefined}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
                    isCurrentPage(link.href)
                      ? "bg-slate-900 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setMenuOpenForPath(null)}
                className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white"
              >
                Plan a discovery
              </Link>
            </div>
          </div>
      )}
    </nav>
  );
}
