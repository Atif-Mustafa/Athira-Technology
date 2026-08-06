import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, ButtonLink } from "@/components/ui/Button";

describe("shared buttons", () => {
  it("renders Button as a semantic button with a safe default type", () => {
    const { container } = render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });

    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(container.firstElementChild).toBe(button);
  });

  it("keeps disabled buttons non-interactive", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders ButtonLink as a semantic link with the selected styles", () => {
    const { container } = render(
      <ButtonLink href="/agents" variant="outline" size="lg">
        Explore agents
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "Explore agents" });

    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/agents");
    expect(link).toHaveClass("border-slate-700", "px-8", "py-3");
    expect(container.firstElementChild).toBe(link);
  });

  it("retains visible keyboard-focus classes", () => {
    render(<Button>Focus target</Button>);

    expect(screen.getByRole("button", { name: "Focus target" })).toHaveClass(
      "focus-visible:ring-2",
      "focus-visible:ring-blue-400",
      "focus-visible:ring-offset-2",
    );
  });

  it("does not add a non-interactive wrapper around either control", () => {
    const buttonRender = render(<Button>Button root</Button>);
    expect(buttonRender.container.firstElementChild?.tagName).toBe("BUTTON");
    buttonRender.unmount();

    const linkRender = render(
      <ButtonLink href="/">Link root</ButtonLink>,
    );
    expect(linkRender.container.firstElementChild?.tagName).toBe("A");
  });
});
