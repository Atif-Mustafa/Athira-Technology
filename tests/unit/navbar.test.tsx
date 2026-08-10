import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/marketing/Navbar";
import { agentsData } from "@/content/agents";

const navigationMocks = vi.hoisted(() => ({
  usePathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: navigationMocks.usePathname,
}));

const agentNavigationItems = agentsData.map(({ name, slug }) => ({ name, slug }));
const expectedAgentLinks = agentsData.map((agent) => ({
  href: `/agents/${agent.slug}`,
  label: agent.name.replace(/ Agent$/, ""),
}));

function renderNavbar() {
  return render(<Navbar agents={agentNavigationItems} />);
}

describe("marketing navigation", () => {
  beforeEach(() => {
    navigationMocks.usePathname.mockReturnValue("/agents/testing");
  });

  it("exposes an accessible mobile-menu disclosure relationship", () => {
    renderNavbar();

    const trigger = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "mobile-navigation");
    expect(document.getElementById("mobile-navigation")).not.toBeInTheDocument();
  });

  it("toggles the menu, closes on Escape, and restores trigger focus", async () => {
    const user = userEvent.setup();
    renderNavbar();

    const trigger = screen.getByRole("button", {
      name: "Open navigation menu",
    });
    await user.click(trigger);

    expect(trigger).toHaveAccessibleName("Close navigation menu");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("mobile-navigation")).toBeInTheDocument();

    const mobileProductLink = screen
      .getAllByRole("link", { name: "Product" })
      .at(-1);
    mobileProductLink?.focus();
    await user.keyboard("{Escape}");

    expect(document.getElementById("mobile-navigation")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("opens the desktop agent disclosure and uses the typed agent links", async () => {
    const user = userEvent.setup();
    renderNavbar();

    const trigger = screen.getByRole("button", { name: "SDLC Agents" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute(
      "aria-controls",
      "desktop-agents-navigation",
    );

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("desktop-agents-navigation")).toBeInTheDocument();
    for (const agent of expectedAgentLinks) {
      expect(screen.getByRole("link", { name: agent.label })).toHaveAttribute(
        "href",
        agent.href,
      );
    }
    expect(screen.getByRole("link", { name: "View all agents" })).toHaveAttribute(
      "href",
      "/agents",
    );

    await user.click(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("desktop-agents-navigation")).not.toBeInTheDocument();
  });

  it("supports Enter and Space, closes on Escape, and restores desktop focus", async () => {
    const user = userEvent.setup();
    renderNavbar();

    const trigger = screen.getByRole("button", { name: "SDLC Agents" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    screen.getByRole("link", { name: "Planning" }).focus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();

    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("marks the active navigation section as the current page", () => {
    renderNavbar();

    expect(screen.getByRole("button", { name: "SDLC Agents" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Product" })).not.toHaveAttribute("aria-current");
  });

  it("expands and collapses the mobile agent section", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );
    const agentTriggers = screen.getAllByRole("button", {
      name: "SDLC Agents",
    });
    const mobileAgentTrigger = agentTriggers.at(-1);

    expect(mobileAgentTrigger).toHaveAttribute("aria-expanded", "false");
    expect(mobileAgentTrigger).toHaveAttribute(
      "aria-controls",
      "mobile-agents-navigation",
    );
    expect(mobileAgentTrigger).toHaveAttribute("aria-current", "page");

    await user.click(mobileAgentTrigger!);
    expect(mobileAgentTrigger).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("mobile-agents-navigation")).toBeInTheDocument();
    for (const agent of expectedAgentLinks) {
      expect(screen.getByRole("link", { name: agent.label })).toHaveAttribute(
        "href",
        agent.href,
      );
    }
    expect(screen.getByRole("link", { name: "View all agents" })).toHaveAttribute(
      "href",
      "/agents",
    );

    await user.click(mobileAgentTrigger!);
    expect(mobileAgentTrigger).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mobile-agents-navigation")).not.toBeInTheDocument();
  });
});
