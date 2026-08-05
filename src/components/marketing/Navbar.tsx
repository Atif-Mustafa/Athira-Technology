"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "AI Engineer", path: "/ai-software-engineer" },
    { name: "Agents", path: "/agents" },
    { name: "Services", path: "/services" },
    { name: "Pricing", path: "/pricing" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full opacity-90" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Athira<span className="text-blue-500">Tech</span></span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    pathname === link.path ? "text-white" : "text-slate-400"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/contact"
                className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950/95 backdrop-blur-md border-b border-slate-800/60"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    pathname === link.path
                      ? "bg-slate-900 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
