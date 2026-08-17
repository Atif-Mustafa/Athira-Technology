import type { ComponentProps } from "react";
import { render } from "@testing-library/react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { MarketingIcon } from "@/components/marketing/MarketingIcon";
import { marketingIconKeys, type MarketingIconKey } from "@/content/shared";

describe("MarketingIcon", () => {
  it.each(marketingIconKeys)("renders the decorative %s icon", (icon) => {
    const { container } = render(<MarketingIcon icon={icon} />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("accepts only the supported icon-key union", () => {
    expectTypeOf<ComponentProps<typeof MarketingIcon>["icon"]>().toEqualTypeOf<MarketingIconKey>();
  });
});
