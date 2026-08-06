import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Binoculars,
  Blocks,
  Bot,
  Boxes,
  BrainCircuit,
  CheckCheck,
  CloudCog,
  Container,
  GitBranch,
  Link2,
  MessagesSquare,
  RefreshCw,
  Scale,
  Sparkles,
  TestTube2,
  Workflow,
} from "lucide-react";
import type { MarketingIconKey } from "../../content/shared";

const iconMap = {
  strategy: BrainCircuit,
  agents: Bot,
  automation: Workflow,
  integration: Link2,
  modernization: RefreshCw,
  cloud: CloudCog,
  quality: TestTube2,
  consulting: Sparkles,
  "source-control": GitBranch,
  "project-management": Blocks,
  communication: MessagesSquare,
  containers: Container,
  observability: Binoculars,
  governance: Scale,
  review: CheckCheck,
  traceability: Boxes,
} satisfies Record<MarketingIconKey, LucideIcon>;

type MarketingIconProps = {
  icon: MarketingIconKey;
} & Omit<ComponentProps<LucideIcon>, "ref">;

export function MarketingIcon({ icon, ...props }: MarketingIconProps) {
  const Icon = iconMap[icon];

  return <Icon aria-hidden="true" focusable="false" {...props} />;
}
