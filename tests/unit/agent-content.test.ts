import { isValidElement } from "react";
import { describe, expect, it } from "vitest";
import {
  agentIconKeys,
  agentsData,
  getAdjacentAgents,
} from "@/content/agents";

function containsNonSerializableValue(
  value: unknown,
  visited = new WeakSet<object>(),
): boolean {
  if (
    typeof value === "function" ||
    typeof value === "symbol" ||
    typeof value === "bigint" ||
    isValidElement(value)
  ) {
    return true;
  }

  if (value === null || typeof value !== "object") {
    return false;
  }

  if (visited.has(value)) {
    return false;
  }

  visited.add(value);

  return Object.values(value).some((entry) =>
    containsNonSerializableValue(entry, visited),
  );
}

describe("agent content", () => {
  it("contains exactly seven records with unique slugs", () => {
    const slugs = agentsData.map((agent) => agent.slug);

    expect(agentsData).toHaveLength(7);
    expect(new Set(slugs)).toHaveProperty("size", 7);
  });

  it("uses only supported icon keys", () => {
    const supportedIcons = new Set(agentIconKeys);

    expect(agentsData.every((agent) => supportedIcons.has(agent.icon))).toBe(
      true,
    );
  });

  it("stores serializable data without functions, JSX, or components", () => {
    expect(containsNonSerializableValue(agentsData)).toBe(false);
    expect(() => JSON.parse(JSON.stringify(agentsData))).not.toThrow();
  });

  it("provides every required field for all seven complete agents", () => {
    for (const agent of agentsData) {
      expect(agent.purpose.length).toBeGreaterThan(80);
      expect(agent.problems.length).toBeGreaterThanOrEqual(3);
      expect(agent.inputs.length).toBeGreaterThanOrEqual(3);
      expect(agent.workflow.length).toBeGreaterThanOrEqual(4);
      expect(agent.outputs.length).toBeGreaterThanOrEqual(3);
      expect(agent.capabilities.length).toBeGreaterThanOrEqual(4);
      expect(agent.humanCheckpoints.length).toBeGreaterThanOrEqual(3);
      expect(agent.exampleScenario.steps.length).toBeGreaterThanOrEqual(4);
      expect(agent.integrations.length).toBeGreaterThanOrEqual(3);
      expect(agent.governance.length).toBeGreaterThanOrEqual(3);
      expect(agent.faqs.length).toBeGreaterThanOrEqual(2);
      expect(agent.seoTitle).toBeTruthy();
      expect(agent.seoDescription).toBeTruthy();
    }
  });

  it("keeps agent purposes and scenarios specific to each lifecycle stage", () => {
    expect(new Set(agentsData.map((agent) => agent.purpose))).toHaveProperty(
      "size",
      7,
    );
    expect(
      new Set(agentsData.map((agent) => agent.exampleScenario.title)),
    ).toHaveProperty("size", 7);
  });

  it("resolves adjacent lifecycle navigation without wrapping", () => {
    expect(getAdjacentAgents("planning")).toMatchObject({
      previous: undefined,
      next: { slug: "design" },
    });
    expect(getAdjacentAgents("testing")).toMatchObject({
      previous: { slug: "development" },
      next: { slug: "deployment" },
    });
    expect(getAdjacentAgents("documentation")).toMatchObject({
      previous: { slug: "monitoring" },
      next: undefined,
    });
    expect(getAdjacentAgents("unknown")).toEqual({
      previous: undefined,
      next: undefined,
    });
  });
});
