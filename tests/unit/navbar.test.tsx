import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/marketing/Navbar";

const navigationMocks = vi.hoisted(() => ({
  usePathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: navigationMocks.usePathname,
}));

describe("marketing navigation", () => {
  beforeEach(() => {
    navigationMocks.usePathname.mockReturnValue("/agents/testing");
  });

  it("exposes an accessible mobile-menu disclosure relationship", () => {
    render(<Navbar />);

    const trigger = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "mobile-navigation");
    expect(document.getElementById("mobile-navigation")).not.toBeInTheDocument();
  });

  it("toggles the menu, closes on Escape, and restores trigger focus", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const trigger = screen.getByRole("button", {
      name: "Open navigation menu",
    });
    await user.click(trigger);

    expect(trigger).toHaveAccessibleName("Close navigation menu");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("mobile-navigation")).toBeInTheDocument();

    const mobileHomeLink = screen.getAllByRole("link", { name: "Home" }).at(-1);
    mobileHomeLink?.focus();
    await user.keyboard("{Escape}");

    expect(document.getElementById("mobile-navigation")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("marks the active navigation section as the current page", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Agents" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
