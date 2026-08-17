"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { primaryNavigation } from "../../content/marketing";
import { cn } from "../../lib/utils";

export type AgentNavigationItem = {
  name: string;
  slug: string;
};

type NavbarProps = {
  agents: readonly AgentNavigationItem[];
};

function getAgentNavigationLabel(name: string) {
  return name.replace(/ Agent$/, "");
}

export function Navbar({ agents }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpenForPath, setMenuOpenForPath] = useState<string | null>(null);
  const [desktopAgentsOpenForPath, setDesktopAgentsOpenForPath] = useState<
    string | null
  >(null);
  const [mobileAgentsOpenForPath, setMobileAgentsOpenForPath] = useState<
    string | null
  >(null);
  const isOpen = menuOpenForPath === pathname;
  const isDesktopAgentsOpen = desktopAgentsOpenForPath === pathname;
  const isMobileAgentsOpen = mobileAgentsOpenForPath === pathname;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const desktopAgentsButtonRef = useRef<HTMLButtonElement>(null);
  const desktopAgentsContainerRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = () => {
    setMenuOpenForPath(null);
    setMobileAgentsOpenForPath(null);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpenForPath(null);
        setMobileAgentsOpenForPath(null);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isDesktopAgentsOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDesktopAgentsOpenForPath(null);
        desktopAgentsButtonRef.current?.focus();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !desktopAgentsContainerRef.current?.contains(event.target)
      ) {
        setDesktopAgentsOpenForPath(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isDesktopAgentsOpen]);

  const isCurrentPage = (path: string) =>
    path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(`${path}/`);
  const isAgentsPage = isCurrentPage("/agents");

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed top-0 z-50 w-full border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              aria-label="Athira Technology home"
              className="flex items-center space-x-2 rounded-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <div className="h-4 w-4 rounded-full bg-white opacity-90" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Athira<span className="text-blue-500">Tech</span>
              </span>
            </Link>
          </div>

          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {primaryNavigation.map((link) =>
                link.href === "/agents" ? (
                  <div
                    key={link.label}
                    ref={desktopAgentsContainerRef}
                    className="relative"
                    onBlur={(event) => {
                      if (
                        !(event.relatedTarget instanceof Node) ||
                        !event.currentTarget.contains(event.relatedTarget)
                      ) {
                        setDesktopAgentsOpenForPath(null);
                      }
                    }}
                  >
                    <button
                      ref={desktopAgentsButtonRef}
                      type="button"
                      aria-expanded={isDesktopAgentsOpen}
                      aria-controls="desktop-agents-navigation"
                      aria-current={isAgentsPage ? "page" : undefined}
                      onClick={() =>
                        setDesktopAgentsOpenForPath(
                          isDesktopAgentsOpen ? null : pathname,
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-1 rounded-sm text-sm font-medium transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950",
                        isAgentsPage ? "text-white" : "text-slate-400",
                      )}
                    >
                      {link.label}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "h-4 w-4 transition-transform motion-reduce:transition-none",
                          isDesktopAgentsOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {isDesktopAgentsOpen ? (
                      <div
                        id="desktop-agents-navigation"
                        className="absolute left-1/2 top-full mt-4 w-64 -translate-x-1/2 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 p-2 shadow-2xl shadow-black/40"
                      >
                        <ul aria-label="SDLC agent pages" className="space-y-1">
                          {agents.map((agent) => {
                            const href = `/agents/${agent.slug}`;
                            return (
                              <li key={agent.slug}>
                                <Link
                                  href={href}
                                  aria-current={
                                    isCurrentPage(href) ? "page" : undefined
                                  }
                                  onClick={() =>
                                    setDesktopAgentsOpenForPath(null)
                                  }
                                  className={cn(
                                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
                                    isCurrentPage(href)
                                      ? "bg-slate-900 text-white"
                                      : "text-slate-300",
                                  )}
                                >
                                  {getAgentNavigationLabel(agent.name)}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="mt-2 border-t border-slate-800 pt-2">
                          <Link
                            href="/agents"
                            aria-current={pathname === "/agents" ? "page" : undefined}
                            onClick={() => setDesktopAgentsOpenForPath(null)}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm font-semibold text-blue-300 transition-colors hover:bg-slate-800 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
                              pathname === "/agents" && "bg-slate-900",
                            )}
                          >
                            View all agents
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={
                      isCurrentPage(link.href) ? "page" : undefined
                    }
                    className={cn(
                      "rounded-sm text-sm font-medium transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950",
                      isCurrentPage(link.href)
                        ? "text-white"
                        : "text-slate-400",
                    )}
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <Link
                href="/contact"
                className="rounded-full border border-transparent bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Plan a discovery
              </Link>
            </div>
          </div>

          <div className="lg:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => {
                if (isOpen) {
                  closeMobileMenu();
                } else {
                  setMenuOpenForPath(pathname);
                }
              }}
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {isOpen ? (
                <X aria-hidden="true" className="h-6 w-6" />
              ) : (
                <Menu aria-hidden="true" className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen ? (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-slate-800/60 bg-slate-950/95 backdrop-blur-md lg:hidden"
        >
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {primaryNavigation.map((link) =>
              link.href === "/agents" ? (
                <div key={link.label}>
                  <button
                    type="button"
                    aria-expanded={isMobileAgentsOpen}
                    aria-controls="mobile-agents-navigation"
                    aria-current={isAgentsPage ? "page" : undefined}
                    onClick={() =>
                      setMobileAgentsOpenForPath(
                        isMobileAgentsOpen ? null : pathname,
                      )
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
                      isAgentsPage
                        ? "bg-slate-900 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    )}
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "h-5 w-5 transition-transform motion-reduce:transition-none",
                        isMobileAgentsOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isMobileAgentsOpen ? (
                    <div id="mobile-agents-navigation" className="py-1 pl-3">
                      <ul aria-label="SDLC agent pages" className="space-y-1">
                        {agents.map((agent) => {
                          const href = `/agents/${agent.slug}`;
                          return (
                            <li key={agent.slug}>
                              <Link
                                href={href}
                                aria-current={
                                  isCurrentPage(href) ? "page" : undefined
                                }
                                onClick={closeMobileMenu}
                                className={cn(
                                  "block rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
                                  isCurrentPage(href)
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                                )}
                              >
                                {getAgentNavigationLabel(agent.name)}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-2 border-t border-slate-800 pt-2">
                        <Link
                          href="/agents"
                          aria-current={
                            pathname === "/agents" ? "page" : undefined
                          }
                          onClick={closeMobileMenu}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm font-semibold text-blue-300 hover:bg-slate-800 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
                            pathname === "/agents" && "bg-slate-900",
                          )}
                        >
                          View all agents
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMobileMenu}
                  aria-current={
                    isCurrentPage(link.href) ? "page" : undefined
                  }
                  className={cn(
                    "block rounded-md px-3 py-2 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
                    isCurrentPage(link.href)
                      ? "bg-slate-900 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              ),
            )}
            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className="block rounded-md bg-blue-600 px-3 py-2 text-base font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300"
            >
              Plan a discovery
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
