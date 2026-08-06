import type { ComponentProps } from "react";
import { render } from "@testing-library/react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { AgentIcon } from "@/components/agents/AgentIcon";
import {
  agentIconKeys,
  type AgentIconKey,
} from "@/content/agents";

describe("AgentIcon", () => {
  it.each(agentIconKeys)("renders the decorative %s icon", (icon) => {
    const { container } = render(<AgentIcon icon={icon} />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("accepts only the supported icon-key union", () => {
    expectTypeOf<ComponentProps<typeof AgentIcon>["icon"]>().toEqualTypeOf<AgentIconKey>();
  });
});
