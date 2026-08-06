export const contactInterestValues = [
  "ai-software-engineer",
  "sdlc-agent-workflow",
  "ai-product-strategy",
  "software-engineering-services",
  "enterprise-integration-modernization",
] as const;

export const contactInterestOptions = [
  { value: "ai-software-engineer", label: "AI Software Engineer product discovery" },
  { value: "sdlc-agent-workflow", label: "SDLC agent workflow" },
  { value: "ai-product-strategy", label: "AI product strategy" },
  { value: "software-engineering-services", label: "Software engineering services" },
  { value: "enterprise-integration-modernization", label: "Enterprise integration or modernization" },
] as const;

export const projectStageValues = [
  "exploring",
  "defining-pilot",
  "reviewing-architecture",
  "planning-implementation",
] as const;

export const projectStageOptions = [
  { value: "exploring", label: "Exploring the problem" },
  { value: "defining-pilot", label: "Defining a pilot" },
  { value: "reviewing-architecture", label: "Reviewing architecture" },
  { value: "planning-implementation", label: "Planning implementation" },
] as const;

export const budgetRangeValues = [
  "discovery-advisory",
  "prototype-implementation",
  "enterprise-programme",
  "discuss-after-discovery",
] as const;

export const budgetRangeOptions = [
  { value: "discovery-advisory", label: "Discovery or advisory engagement" },
  { value: "prototype-implementation", label: "Prototype implementation" },
  { value: "enterprise-programme", label: "Enterprise programme" },
  { value: "discuss-after-discovery", label: "Prefer to discuss after discovery" },
] as const;

export function getContactOptionLabel(
  options: readonly { value: string; label: string }[],
  value: string | undefined,
): string {
  if (!value) {
    return "Not provided";
  }

  return options.find((option) => option.value === value)?.label ?? "Unknown selection";
}
