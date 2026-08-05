import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Braces,
  Bug,
  ClipboardList,
  FileText,
  PenTool,
  Rocket,
} from "lucide-react";
import type { AgentIconKey } from "../../content/agents";

const iconMap = {
  planning: ClipboardList,
  design: PenTool,
  development: Braces,
  testing: Bug,
  deployment: Rocket,
  monitoring: Activity,
  documentation: FileText,
} satisfies Record<AgentIconKey, LucideIcon>;

type AgentIconProps = {
  icon: AgentIconKey;
} & Omit<ComponentProps<LucideIcon>, "ref">;

export function AgentIcon({ icon, ...props }: AgentIconProps) {
  const Icon = iconMap[icon];

  return <Icon aria-hidden="true" focusable="false" {...props} />;
}
