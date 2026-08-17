import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CoordinationDiagram } from "@/components/marketing/CoordinationDiagram";
import { WorkflowVisual } from "@/components/marketing/WorkflowVisual";
import { agentsData } from "@/content/agents";

describe("AI Software Engineer coordination diagram", () => {
  it("explains the planned review-led coordination flow without duplicating agent rows", () => {
    render(<CoordinationDiagram />);

    const diagram = screen.getByTestId("coordination-diagram");
    expect(diagram).toHaveAttribute(
      "aria-labelledby",
      "coordination-diagram-title",
    );

    for (const label of [
      "Illustrative coordination",
      "Planned product model",
      "Approved requirement",
      "AI Software Engineer",
      "Shared context",
      "Policies",
      "Review state",
      "Plan & Design",
      "Build & Test",
      "Release & Operate",
      "Knowledge",
      "Human review gate",
      "Approved engineering artifacts",
    ]) {
      expect(within(diagram).getByText(label)).toBeInTheDocument();
    }

    for (const agent of agentsData) {
      expect(within(diagram).queryByText(agent.name)).not.toBeInTheDocument();
    }
  });

  it("preserves the homepage seven-agent workflow component", () => {
    render(<WorkflowVisual />);

    expect(screen.getByText("Illustrative workflow")).toBeInTheDocument();
    for (const agent of agentsData) {
      expect(
        screen.getByRole("link", { name: new RegExp(agent.name) }),
      ).toHaveAttribute("href", `/agents/${agent.slug}`);
    }
  });
});
