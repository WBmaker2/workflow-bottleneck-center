import { describe, expect, it } from "vitest";
import { analyzeBottlenecks } from "../../src/domain/bottleneckAnalyzer";
import type { ScenarioDefinition, TaskRun, WaitInterval } from "../../src/domain/types";

const scenario: ScenarioDefinition = {
  id: "science-display",
  title: "병목 시험",
  mission: "가상 흐름을 살핍니다.",
  timeGoal: 20,
  roles: [{ id: "A", label: "역할 A" }, { id: "B", label: "역할 B" }, { id: "C", label: "역할 C" }],
  resources: [{ id: "printer", label: "프린터", capacity: 1 }],
  fairness: { minParticipatingRoles: 2, maxLoadGap: 10 },
  tasks: [
    { id: "prepare", title: "준비", duration: 2, prerequisites: [], peopleRequired: 1, resources: [], parallel: "allowed", conditions: [], evidenceKinds: [], unlocks: ["shared-a"] },
    { id: "long-independent", title: "긴 독립 작업", duration: 6, prerequisites: [], peopleRequired: 1, resources: [], parallel: "allowed", conditions: [], evidenceKinds: [], unlocks: [] },
    { id: "resource-holder", title: "자원 점유 작업", duration: 2, prerequisites: [], peopleRequired: 1, resources: [{ resourceId: "printer", quantity: 1 }], parallel: "allowed", conditions: [], evidenceKinds: [], unlocks: [] },
    { id: "shared-a", title: "공유 작업", duration: 3, prerequisites: [{ taskId: "prepare", kind: "workflow", reason: "준비 뒤 진행" }], peopleRequired: 1, resources: [{ resourceId: "printer", quantity: 1 }], parallel: "allowed", conditions: [], evidenceKinds: [], unlocks: ["finish"] },
    { id: "finish", title: "마무리", duration: 3, prerequisites: [{ taskId: "shared-a", kind: "workflow", reason: "공유 작업 뒤 진행" }], peopleRequired: 1, resources: [], parallel: "allowed", conditions: [], evidenceKinds: [], unlocks: [] },
  ],
  disclaimer: "모든 시간은 교육용 가상 단위이며 실제 작업 수행 시간을 예측하지 않습니다.",
  teacherFocus: "실제 blocker를 찾습니다.",
};

describe("bottleneck analysis", () => {
  it("traces the finishing chain and does not call a long independent task a bottleneck", () => {
    const runs: readonly TaskRun[] = [
      { taskId: "prepare", plannedStart: 0, actualStart: 0, end: 2, roleIds: ["A"] },
      { taskId: "resource-holder", plannedStart: 0, actualStart: 0, end: 2, roleIds: ["B"] },
      { taskId: "long-independent", plannedStart: 0, actualStart: 0, end: 6, roleIds: ["C"] },
      { taskId: "shared-a", plannedStart: 0, actualStart: 4, end: 7, roleIds: ["A"] },
      { taskId: "finish", plannedStart: 0, actualStart: 7, end: 10, roleIds: ["B"] },
    ];
    const waits: readonly WaitInterval[] = [
      { taskId: "shared-a", from: 2, to: 4, reason: "resource", resourceId: "printer", blockerTaskId: "resource-holder" },
      { taskId: "finish", from: 0, to: 7, reason: "dependency", blockerTaskId: "shared-a" },
    ];
    const analysis = analyzeBottlenecks(scenario, { runs, waits, finishTime: 10, omittedTaskIds: [], blockedTaskIds: [], issues: [] });
    expect(analysis.criticalTaskIds).toEqual(["prepare", "shared-a", "finish"]);
    expect(analysis.findings.some(({ blockedTaskId }) => blockedTaskId === "long-independent")).toBe(false);
    expect(analysis.findings).toContainEqual(expect.objectContaining({ type: "resource-wait", blockedTaskId: "shared-a", delayUnits: 2 }));
  });
});
