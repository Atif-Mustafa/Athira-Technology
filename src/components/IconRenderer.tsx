"use client";
import { LucideIcon } from "lucide-react";

export function IconRenderer({ icon: Icon, className }: { icon: LucideIcon, className?: string }) {
  return <Icon className={className} />;
}
