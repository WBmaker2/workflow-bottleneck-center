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

  it("rejects an unsafe planned start without entering a long-running loop", () => {
    const result = simulateSchedule(makeScenario({ tasks: [task("only")] }), {
      learnerEdges: [],
      entries: [{ taskId: "only", plannedStart: Number.MAX_SAFE_INTEGER + 1, roleIds: ["A"] }],
    });
    expect(result.runs).toEqual([]);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "invalid-planned-start", taskId: "only" }));
  });

  it("jumps across a large idle gap while preserving exact virtual start and end", () => {
    const scenario = makeScenario({ tasks: [task("first"), task("future")] });
    const futureStart = Number.MAX_SAFE_INTEGER - 100;
    const result = simulateSchedule(scenario, {
      learnerEdges: [],
      entries: [
        { taskId: "first", plannedStart: 0, roleIds: ["A"] },
        { taskId: "future", plannedStart: futureStart, roleIds: ["B"] },
      ],
    });
    expect(result.runs).toEqual([
      { taskId: "first", plannedStart: 0, actualStart: 0, end: 2, roleIds: ["A"] },
      { taskId: "future", plannedStart: futureStart, actualStart: futureStart, end: futureStart + 2, roleIds: ["B"] },
    ]);
    expect(result.waits).toEqual([]);
  });

  it("jumps due dependency waits to each future predecessor event and coalesces spans", () => {
    const scenario = makeScenario({ tasks: [
      task("a"),
      task("b", { prerequisites: [
        { taskId: "a", kind: "workflow", reason: "a를 먼저 합니다" },
        { taskId: "c", kind: "workflow", reason: "c를 먼저 합니다" },
      ] }),
      task("c"),
    ] });
    const result = simulateSchedule(scenario, {
      learnerEdges: [],
      entries: [
        { taskId: "a", plannedStart: Number.MAX_SAFE_INTEGER - 100, roleIds: ["A"] },
        { taskId: "b", plannedStart: 0, roleIds: ["B"] },
        { taskId: "c", plannedStart: Number.MAX_SAFE_INTEGER - 80, roleIds: ["C"] },
      ],
    });
    expect(result.runs).toEqual([
      { taskId: "a", plannedStart: Number.MAX_SAFE_INTEGER - 100, actualStart: Number.MAX_SAFE_INTEGER - 100, end: Number.MAX_SAFE_INTEGER - 98, roleIds: ["A"] },
      { taskId: "b", plannedStart: 0, actualStart: Number.MAX_SAFE_INTEGER - 78, end: Number.MAX_SAFE_INTEGER - 76, roleIds: ["B"] },
      { taskId: "c", plannedStart: Number.MAX_SAFE_INTEGER - 80, actualStart: Number.MAX_SAFE_INTEGER - 80, end: Number.MAX_SAFE_INTEGER - 78, roleIds: ["C"] },
    ]);
    expect(result.waits).toEqual([
      { taskId: "b", from: 0, to: Number.MAX_SAFE_INTEGER - 98, reason: "dependency", blockerTaskId: "a" },
      { taskId: "b", from: Number.MAX_SAFE_INTEGER - 98, to: Number.MAX_SAFE_INTEGER - 78, reason: "dependency", blockerTaskId: "c" },
    ]);
  });

  it("runs lower valid entries when a separate overflow entry is excluded", () => {
    const result = simulateSchedule(makeScenario({ tasks: [task("low"), task("overflow")] }), {
      learnerEdges: [],
      entries: [
        { taskId: "low", plannedStart: 0, roleIds: ["A"] },
        { taskId: "overflow", plannedStart: Number.MAX_SAFE_INTEGER + 1, roleIds: ["B"] },
      ],
    });
    expect(result.runs).toEqual([{ taskId: "low", plannedStart: 0, actualStart: 0, end: 2, roleIds: ["A"] }]);
    expect(result.blockedTaskIds).toEqual(["overflow"]);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "invalid-planned-start", taskId: "overflow" }));
    expect(result.issues).not.toContainEqual(expect.objectContaining({ code: "simulation-bound", taskId: "low" }));
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

  it("continues to a future independent task after blocking an omitted predecessor", () => {
    const scenario = makeScenario({ tasks: [
      task("first"),
      task("dependent", { prerequisites: [{ taskId: "first", kind: "workflow", reason: "먼저" }] }),
      task("future"),
    ] });
    const result = simulateSchedule(scenario, {
      learnerEdges: [],
      entries: [
        { taskId: "dependent", plannedStart: 0, roleIds: ["A"] },
        { taskId: "future", plannedStart: 3, roleIds: ["B"] },
      ],
    });
    expect(result.blockedTaskIds).toEqual(["dependent"]);
    expect(result.runs).toContainEqual({ taskId: "future", plannedStart: 3, actualStart: 3, end: 5, roleIds: ["B"] });
  });

  it("aggregates repeated resource requirements before checking capacity", () => {
    const scenario = makeScenario({
      tasks: [task("double", { resources: [
        { resourceId: "shared-card-set", quantity: 1 },
        { resourceId: "shared-card-set", quantity: 1 },
      ] })],
      resources: [{ id: "shared-card-set", label: "공유 카드", capacity: 1 }],
    });
    const result = simulateSchedule(scenario, { learnerEdges: [], entries: [{ taskId: "double", plannedStart: 0, roleIds: ["A"] }] });
    expect(result.runs).toEqual([]);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "invalid-resource-requirement", taskId: "double" }));
  });

  it("diagnoses a cycle formed by canonical and learner edges", () => {
    const scenario = makeScenario({ tasks: [
      task("first"),
      task("second", { prerequisites: [{ taskId: "first", kind: "workflow", reason: "먼저" }] }),
    ] });
    const result = simulateSchedule(scenario, {
      learnerEdges: [{ beforeTaskId: "second", afterTaskId: "first" }],
      entries: [
        { taskId: "first", plannedStart: 0, roleIds: ["A"] },
        { taskId: "second", plannedStart: 0, roleIds: ["B"] },
      ],
    });
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "cyclic-relation" }));
    expect(result.blockedTaskIds).toEqual(["first", "second"]);
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

  it("uses an optional scenario-order map while preserving one-argument compatibility", () => {
    const intervals = [
      { taskId: "right", from: 0, to: 1, reason: "solo" as const },
      { taskId: "left", from: 0, to: 1, reason: "solo" as const },
    ];
    expect(mergeWaitIntervals(intervals, new Map([["right", 0], ["left", 1]])).map(({ taskId }) => taskId)).toEqual(["right", "left"]);
  });
});
