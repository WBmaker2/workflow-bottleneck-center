import { getScenario } from "../../src/data/scenarios";
import { requiredEdgesFromScenario } from "../../src/domain/scenarioValidation";
import { mergeWaitIntervals } from "../../src/domain/waitIntervals";
import { simulateSchedule } from "../../src/domain/simulator";
import { makeScenario } from "../../src/test/fixtures";
import type { ScheduleDraft, TaskDefinition } from "../../src/domain/types";

const task = (id: string, overrides: Partial<TaskDefinition> = {}): TaskDefinition => ({
  id,
  title: id,
  duration: 2,
  prerequisites: [],
  peopleRequired: 1,
  resources: [],
  parallel: "allowed",
  conditions: [],
  evidenceKinds: [],
  unlocks: [],
  ...overrides,
});

const resourceFixture = makeScenario({
  tasks: [
    task("left", { resources: [{ resourceId: "shared-card-set", quantity: 1 }] }),
    task("right", { resources: [{ resourceId: "shared-card-set", quantity: 1 }] }),
  ],
  resources: [{ id: "shared-card-set", label: "공유 카드", capacity: 1 }],
});

const resourceDraft: ScheduleDraft = {
  learnerEdges: [],
  entries: [
    { taskId: "right", plannedStart: 0, roleIds: ["B"] },
    { taskId: "left", plannedStart: 0, roleIds: ["A"] },
  ],
};

describe("deterministic virtual-time simulator", () => {
  it("delays a task until its published prerequisite ends", () => {
    const scenario = getScenario("science-display");
    const result = simulateSchedule(scenario, {
      learnerEdges: requiredEdgesFromScenario(scenario),
      entries: [
        { taskId: "verify-content", plannedStart: 0, roleIds: ["A"] },
        { taskId: "prepare-print-file", plannedStart: 0, roleIds: ["B"] },
      ],
    });

    expect(result.runs.find(({ taskId }) => taskId === "prepare-print-file")).toMatchObject({ actualStart: 2, end: 4 });
    expect(result.waits).toContainEqual(expect.objectContaining({ taskId: "prepare-print-file", from: 0, to: 2, reason: "dependency", blockerTaskId: "verify-content" }));
  });

  it("uses scenario order to settle a one-capacity resource tie", () => {
    const result = simulateSchedule(resourceFixture, resourceDraft);

    expect(result.runs).toEqual([
      { taskId: "left", plannedStart: 0, actualStart: 0, end: 2, roleIds: ["A"] },
      { taskId: "right", plannedStart: 0, actualStart: 2, end: 4, roleIds: ["B"] },
    ]);
    expect(result.waits).toContainEqual(expect.objectContaining({ taskId: "right", from: 0, to: 2, reason: "resource", resourceId: "shared-card-set", blockerTaskId: "left" }));
  });

  it("is deeply equal when entry and edge input arrays are reversed", () => {
    const forward = simulateSchedule(resourceFixture, resourceDraft);
    const reversed = simulateSchedule(resourceFixture, { entries: [...resourceDraft.entries].reverse(), learnerEdges: [...resourceDraft.learnerEdges].reverse() });
    expect(reversed).toEqual(forward);
  });

  it("records role, solo, omission, and invalid-entry outcomes", () => {
    const roleScenario = makeScenario({ tasks: [task("first"), task("second")] });
    const roleResult = simulateSchedule(roleScenario, {
      learnerEdges: [],
      entries: [
        { taskId: "first", plannedStart: 0, roleIds: ["A"] },
        { taskId: "second", plannedStart: 0, roleIds: ["A"] },
      ],
    });
    expect(roleResult.waits).toContainEqual(expect.objectContaining({ taskId: "second", reason: "role", roleId: "A" }));

    const soloScenario = makeScenario({ tasks: [task("first"), task("solo", { parallel: "solo" })] });
    const soloResult = simulateSchedule(soloScenario, {
      learnerEdges: [],
      entries: [
        { taskId: "solo", plannedStart: 0, roleIds: ["B"] },
        { taskId: "first", plannedStart: 0, roleIds: ["A"] },
      ],
    });
    expect(soloResult.waits).toContainEqual(expect.objectContaining({ taskId: "solo", reason: "solo", from: 0, to: 2 }));

    const omittedResult = simulateSchedule(makeScenario({ tasks: [task("first"), task("dependent", { prerequisites: [{ taskId: "first", kind: "workflow", reason: "먼저" }] })] }), {
      learnerEdges: [],
      entries: [{ taskId: "dependent", plannedStart: 0, roleIds: ["A"] }],
    });
    expect(omittedResult.blockedTaskIds).toEqual(["dependent"]);
    expect(omittedResult.omittedTaskIds).toEqual(["first"]);

    const invalidResult = simulateSchedule(roleScenario, {
      learnerEdges: [],
      entries: [{ taskId: "first", plannedStart: 0, roleIds: ["A", "B"] }],
    });
    expect(invalidResult.runs).toEqual([]);
    expect(invalidResult.issues).toContainEqual(expect.objectContaining({ code: "invalid-role-count", taskId: "first" }));
  });

  it("keeps waiting when a scheduled predecessor has a later planned start", () => {
    const scenario = makeScenario({ tasks: [task("first"), task("dependent", { prerequisites: [{ taskId: "first", kind: "workflow", reason: "먼저" }] })] });
    const result = simulateSchedule(scenario, {
      learnerEdges: [],
      entries: [
        { taskId: "dependent", plannedStart: 0, roleIds: ["B"] },
        { taskId: "first", plannedStart: 3, roleIds: ["A"] },
      ],
    });
    expect(result.blockedTaskIds).toEqual([]);
    expect(result.runs).toEqual([
      { taskId: "first", plannedStart: 3, actualStart: 3, end: 5, roleIds: ["A"] },
      { taskId: "dependent", plannedStart: 0, actualStart: 5, end: 7, roleIds: ["B"] },
    ]);
  });

  it("merges consecutive unit waits with the same cause", () => {
    expect(mergeWaitIntervals([
      { taskId: "task", from: 1, to: 2, reason: "dependency", blockerTaskId: "before" },
      { taskId: "task", from: 0, to: 1, reason: "dependency", blockerTaskId: "before" },
      { taskId: "task", from: 2, to: 3, reason: "role", roleId: "A" },
    ])).toEqual([
      { taskId: "task", from: 0, to: 2, reason: "dependency", blockerTaskId: "before" },
      { taskId: "task", from: 2, to: 3, reason: "role", roleId: "A" },
    ]);
  });
});
