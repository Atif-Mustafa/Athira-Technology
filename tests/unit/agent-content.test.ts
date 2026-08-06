import { isValidElement } from "react";
import { describe, expect, it } from "vitest";
import {
  agentIconKeys,
  agentsData,
  getAgentBySlug,
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

  it("retains the approved planning content", () => {
    const planningAgent = getAgentBySlug("planning");

    expect(planningAgent).toBeDefined();
    expect(planningAgent?.capabilities.length).toBeGreaterThan(0);
    expect(planningAgent?.workflow.length).toBeGreaterThan(0);
    expect(planningAgent?.benefits.length).toBeGreaterThan(0);
    expect(planningAgent?.useCases.length).toBeGreaterThan(0);
  });

  it("returns intentionally incomplete agents without throwing", () => {
    const incompleteAgents = agentsData.filter(
      (agent) => agent.capabilities.length === 0,
    );

    expect(incompleteAgents).toHaveLength(6);

    for (const agent of incompleteAgents) {
      expect(() => getAgentBySlug(agent.slug)).not.toThrow();
      expect(getAgentBySlug(agent.slug)).toMatchObject({
        capabilities: [],
        workflow: [],
        benefits: [],
        useCases: [],
      });
    }
  });
});
