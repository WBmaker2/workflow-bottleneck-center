import { describe, expect, it } from "vitest";
import { makeScenario } from "../../src/test/fixtures";
import { analyzeBottlenecks } from "../../src/domain/bottleneckAnalyzer";
import { simulateSchedule } from "../../src/domain/simulator";
import type { ScenarioDefinition } from "../../src/domain/types";

const task = (id: string, overrides: Partial<ScenarioDefinition["tasks"][number]> = {}) => ({
  id, title: id, duration: 2, prerequisites: [], peopleRequired: 1 as const, resources: [], parallel: "allowed" as const,
  conditions: [], evidenceKinds: [], unlocks: [], ...overrides,
});

describe("bottleneck analysis", () => {
  it("traces the actual resource blocker and emits only waits that end at actualStart", () => {
    const simulatorScenario = makeScenario({
      tasks: [
        task("resource-holder", { duration: 4, resources: [{ resourceId: "printer", quantity: 1 }], unlocks: [] }),
        task("prepare", { duration: 2, unlocks: ["shared-a"] }),
        task("long-independent", { duration: 6 }),
        task("shared-a", { duration: 3, prerequisites: [{ taskId: "prepare", kind: "workflow", reason: "준비 뒤 진행" }], resources: [{ resourceId: "printer", quantity: 1 }], unlocks: ["finish"] }),
        task("finish", { duration: 3, prerequisites: [{ taskId: "shared-a", kind: "workflow", reason: "공유 작업 뒤 진행" }] }),
      ],
      resources: [{ id: "printer", label: "프린터", capacity: 1 }],
    });
    const result = simulateSchedule(simulatorScenario, {
      learnerEdges: [],
      entries: [
        { taskId: "resource-holder", plannedStart: 0, roleIds: ["A"] },
        { taskId: "prepare", plannedStart: 0, roleIds: ["B"] },
        { taskId: "long-independent", plannedStart: 0, roleIds: ["C"] },
        { taskId: "shared-a", plannedStart: 0, roleIds: ["A"] },
        { taskId: "finish", plannedStart: 0, roleIds: ["B"] },
      ],
    });
    const analysis = analyzeBottlenecks(simulatorScenario, result);
    expect(analysis.criticalTaskIds).toEqual(["resource-holder", "shared-a", "finish"]);
    expect(analysis.findings.some(({ blockedTaskId }) => blockedTaskId === "long-independent")).toBe(false);
    expect(analysis.findings).toContainEqual(expect.objectContaining({ type: "resource-wait", blockedTaskId: "shared-a", delayUnits: 2 }));
    expect(analysis.findings.some(({ type, blockedTaskId }) => type === "dependency-path" && blockedTaskId === "shared-a")).toBe(false);
  });
});
