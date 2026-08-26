import { describe, expect, it } from "vitest";
import { appReducer, createInitialState } from "../../src/app/appReducer";
import { canEnterStage, getRequiredAction } from "../../src/app/appSelectors";
import { getScenario } from "../../src/data/scenarios";
import { requiredEdgesFromScenario } from "../../src/domain/scenarioValidation";
import type { AttemptSnapshot, MissionAttempt } from "../../src/app/appTypes";
import type { ScheduleDraft } from "../../src/domain/types";

const emptyDraft: ScheduleDraft = { entries: [], learnerEdges: [] };
const snapshot = (overrides: Partial<AttemptSnapshot> = {}): AttemptSnapshot => ({
  draft: emptyDraft,
  result: { runs: [], waits: [], finishTime: 0, omittedTaskIds: [], blockedTaskIds: [], issues: [] },
  bottlenecks: { criticalTaskIds: [], findings: [], totalWaitUnits: 0 },
  evaluation: {
    status: "successful",
    metrics: {
      finishTime: 0,
      totalWaitUnits: 0,
      roleLoadUnits: { A: 1, B: 1, C: 1 },
      safetyMet: true,
      qualityMet: true,
      fairnessMet: true,
      timeGoalMet: true,
    },
    violations: [],
    feedback: [],
  },
  ...overrides,
});

const withAttempt = (update: (attempt: MissionAttempt) => MissionAttempt): ReturnType<typeof createInitialState> => {
  const state = createInitialState();
  const current = state.attempts["science-display"]!;
  return {
    ...state,
    attempts: { ...state.attempts, "science-display": update(current) },
  };
};

describe("learning-state reducer", () => {
  it("starts every mission at briefing with storage disabled", () => {
    const state = createInitialState();
    expect(state.saveEnabled).toBe(false);
    expect(Object.values(state.attempts).every(({ stage }) => stage === "briefing")).toBe(true);
  });

  it("does not skip from briefing to simulation", () => {
    const state = createInitialState();
    const next = appReducer(state, { type: "ENTER_STAGE", stage: "simulation" });
    expect(next.attempts).toBe(state.attempts);
    expect(next.announcement).toContain("먼저 조건을 확인");
  });

  it("preserves the initial snapshot when revision begins", () => {
    const initialSnapshot = snapshot({ bottlenecks: { criticalTaskIds: ["verify-content"], findings: [{ id: "bottleneck-1", type: "dependency-path", blockedTaskId: "verify-content", blockerLabel: "앞 작업", delayUnits: 1, affectedTaskIds: [], explanation: "앞 작업을 기다렸습니다." }], totalWaitUnits: 1 } });
    const state = withAttempt((attempt) => ({
      ...attempt,
      stage: "analysis",
      initialSnapshot,
      draftSchedule: { entries: [{ taskId: "verify-content", plannedStart: 0, roleIds: ["A"] }], learnerEdges: [] },
      selectedFindingId: "bottleneck-1",
    }));
    const next = appReducer(state, { type: "BEGIN_REVISION" });
    expect(next.attempts["science-display"]!.initialSnapshot).toBe(initialSnapshot);
    expect(next.attempts["science-display"]!.revisedSchedule).toEqual(state.attempts["science-display"]!.draftSchedule);
    expect(next.attempts["science-display"]!.stage).toBe("revision");
  });

  it("guards every stage with its learning prerequisite", () => {
    const state = createInitialState();
    const attempt = state.attempts["science-display"]!;
    expect(canEnterStage(attempt, "relations")).toBe(false);
    expect(canEnterStage(attempt, "schedule")).toBe(false);
    expect(canEnterStage(attempt, "analysis")).toBe(false);
    expect(getRequiredAction(attempt)).toBe("confirm-conditions");
    const afterConditions = { ...attempt, stage: "relations" as const, conditionsAcknowledged: true };
    expect(getRequiredAction(afterConditions)).toBe(null);
  });

  it("returns stage-specific required actions", () => {
    const state = createInitialState();
    const base = state.attempts["science-display"]!;
    expect(getRequiredAction(base)).toBe("confirm-conditions");
    expect(getRequiredAction({ ...base, stage: "schedule", conditionsAcknowledged: true })).toBe("run-simulation");
    expect(getRequiredAction({ ...base, stage: "analysis" })).toBe("mark-bottleneck");
    expect(getRequiredAction({ ...base, stage: "revision" })).toBe("compare-revision");
    expect(getRequiredAction({ ...base, stage: "report" })).toBe(null);
  });

  it("allows simulation only for a complete draft accepted by the domain simulator", () => {
    const scenario = getScenario("science-display");
    const edges = requiredEdgesFromScenario(scenario);
    const entries = scenario.tasks.map((task) => ({ taskId: task.id, plannedStart: 0, roleIds: scenario.roles.slice(0, task.peopleRequired).map(({ id }) => id) }));
    const attempt = {
      ...createInitialState().attempts["science-display"]!,
      stage: "schedule" as const,
      conditionsAcknowledged: true,
      relationEdges: edges,
      draftSchedule: { entries, learnerEdges: edges },
    };
    expect(canEnterStage(attempt, "simulation")).toBe(true);
    expect(canEnterStage({ ...attempt, draftSchedule: { entries: entries.slice(1), learnerEdges: edges } }, "simulation")).toBe(false);
    expect(canEnterStage({ ...attempt, draftSchedule: { entries: entries.map((entry) => entry.taskId === "verify-content" ? { ...entry, plannedStart: Number.MAX_SAFE_INTEGER + 1 } : entry), learnerEdges: edges } }, "simulation")).toBe(false);
  });

  it("allows a completed zero-wait snapshot into analysis without a prediction", () => {
    const base = createInitialState();
    const current = base.attempts["science-display"]!;
    const noWait = snapshot({ result: { runs: [], waits: [], finishTime: 0, omittedTaskIds: [], blockedTaskIds: [], issues: [] } });
    const attempt = { ...current, stage: "simulation" as const, initialSnapshot: noWait, prediction: null };
    expect(canEnterStage({ ...attempt, stage: "simulation" }, "analysis")).toBe(true);
    expect(canEnterStage({ ...attempt, stage: "simulation", initialSnapshot: snapshot({ result: { runs: [], waits: [{ taskId: "task", from: 0, to: 1, reason: "dependency" }], finishTime: 1, omittedTaskIds: [], blockedTaskIds: [], issues: [] } }) }, "analysis")).toBe(false);
  });

  it("allows a zero-wait analysis to begin revision without inventing a bottleneck", () => {
    const base = createInitialState();
    const current = base.attempts["science-display"]!;
    const noWait = snapshot({ result: { runs: [], waits: [], finishTime: 0, omittedTaskIds: [], blockedTaskIds: [], issues: [] } });
    const analysis = { ...current, stage: "analysis" as const, initialSnapshot: noWait, selectedFindingId: null };
    expect(getRequiredAction(analysis)).toBe(null);
    expect(canEnterStage(analysis, "revision")).toBe(true);
    const next = appReducer({ ...base, attempts: { ...base.attempts, "science-display": analysis } }, { type: "BEGIN_REVISION" });
    expect(next.attempts["science-display"]!.stage).toBe("revision");
    expect(next.attempts["science-display"]!.selectedFindingId).toBeNull();
    expect(next.attempts["science-display"]!.revisedSchedule).not.toBe(analysis.draftSchedule);
  });

  it("requires an initial snapshot and a current finding before beginning revision", () => {
    const base = createInitialState();
    const current = base.attempts["science-display"]!;
    const missingSnapshot = { ...current, stage: "analysis" as const, selectedFindingId: "bottleneck-1" };
    const rejected = appReducer({ ...base, attempts: { ...base.attempts, "science-display": missingSnapshot } }, { type: "BEGIN_REVISION" });
    expect(rejected.attempts["science-display"]!.stage).toBe("analysis");
    expect(rejected.attempts["science-display"]!.revisedSchedule).toBeNull();
    const analyzed = { ...current, stage: "analysis" as const, initialSnapshot: snapshot({ bottlenecks: { criticalTaskIds: ["task"], findings: [{ id: "current", type: "dependency-path", blockedTaskId: "task", blockerLabel: "앞 작업", delayUnits: 1, affectedTaskIds: [], explanation: "앞 작업을 기다렸습니다." }], totalWaitUnits: 1 } }) };
    const stale = { ...base, attempts: { ...base.attempts, "science-display": { ...analyzed, selectedFindingId: "old-finding" } } };
    expect(appReducer(stale, { type: "BEGIN_REVISION" }).attempts["science-display"]!.stage).toBe("analysis");
    const valid = { ...base, attempts: { ...base.attempts, "science-display": { ...analyzed, selectedFindingId: "current" } } };
    expect(appReducer(valid, { type: "BEGIN_REVISION" }).attempts["science-display"]!.stage).toBe("revision");
  });

  it("rejects a stale revised snapshot without changing state or announcement", () => {
    const base = createInitialState();
    const revised = { entries: [{ taskId: "verify-content", plannedStart: 0, roleIds: ["A"] as const }], learnerEdges: [] };
    const attempt = { ...base.attempts["science-display"]!, stage: "revision" as const, revisedSchedule: revised, initialSnapshot: snapshot({ bottlenecks: { criticalTaskIds: ["verify-content"], findings: [{ id: "bottleneck-1", type: "dependency-path", blockedTaskId: "verify-content", blockerLabel: "앞 작업", delayUnits: 1, affectedTaskIds: [], explanation: "앞 작업을 기다렸습니다." }], totalWaitUnits: 1 } }), selectedFindingId: "bottleneck-1" };
    const state = { ...base, announcement: "기존 안내", attempts: { ...base.attempts, "science-display": attempt } };
    const stale = appReducer(state, { type: "SAVE_REVISED_SNAPSHOT", snapshot: snapshot(), comparison: { finishDelta: 0, waitDelta: 0, changedTaskIds: [], preserved: { safety: true, quality: true, fairness: true }, summary: "" } });
    expect(stale).toBe(state);
  });

  it("does not mutate an earlier attempt or its snapshot", () => {
    const state = withAttempt((attempt) => ({ ...attempt, stage: "simulation" }));
    const next = appReducer(state, { type: "SAVE_INITIAL_SNAPSHOT", snapshot: snapshot({ draft: { entries: [], learnerEdges: [] } }) });
    expect(state.attempts["science-display"]!.initialSnapshot).toBeNull();
    expect(next.attempts).not.toBe(state.attempts);
    expect(next.attempts["science-display"]).not.toBe(state.attempts["science-display"]);
  });

  it("keeps the first initial snapshot as the immutable baseline", () => {
    const first = snapshot({ result: { runs: [], waits: [], finishTime: 1, omittedTaskIds: [], blockedTaskIds: [], issues: [] } });
    const second = snapshot({ result: { runs: [], waits: [], finishTime: 99, omittedTaskIds: [], blockedTaskIds: [], issues: [] } });
    const state = withAttempt((attempt) => ({ ...attempt, stage: "simulation" }));
    const saved = appReducer(state, { type: "SAVE_INITIAL_SNAPSHOT", snapshot: first });
    const ignored = appReducer(saved, { type: "SAVE_INITIAL_SNAPSHOT", snapshot: second });
    expect(ignored.attempts["science-display"]!.initialSnapshot).toBe(saved.attempts["science-display"]!.initialSnapshot);
    expect(ignored.attempts["science-display"]!.initialSnapshot!.result.finishTime).toBe(1);
  });

  it("deep-copies and freezes snapshot input at the reducer boundary", () => {
    const raw = snapshot({ result: { runs: [], waits: [], finishTime: 1, omittedTaskIds: [], blockedTaskIds: [], issues: [{ code: "x", message: "외부" }] } });
    const state = withAttempt((attempt) => ({ ...attempt, stage: "simulation" }));
    const next = appReducer(state, { type: "SAVE_INITIAL_SNAPSHOT", snapshot: raw });
    (raw.result.issues as { code: string; message: string }[]).push({ code: "mutated", message: "변경" });
    const stored = next.attempts["science-display"]!.initialSnapshot!;
    expect(stored.result.issues).toHaveLength(1);
    expect(Object.isFrozen(stored)).toBe(true);
    expect(Object.isFrozen(stored.result.issues)).toBe(true);
  });

  it("invalidates completion evidence when revision or report inputs change", () => {
    const base = createInitialState().attempts["science-display"]!;
    const revised = { entries: [], learnerEdges: [] };
    const completedAttempt = {
      ...base,
      stage: "report" as const,
      revisedSchedule: revised,
      initialSnapshot: snapshot({ bottlenecks: { criticalTaskIds: ["verify-content"], findings: [{ id: "bottleneck-1", type: "dependency-path", blockedTaskId: "verify-content", blockerLabel: "앞 작업", delayUnits: 1, affectedTaskIds: [], explanation: "앞 작업을 기다렸습니다." }], totalWaitUnits: 1 } }),
      selectedFindingId: "bottleneck-1",
      revisedSnapshot: snapshot({ bottlenecks: { criticalTaskIds: ["verify-content"], findings: [{ id: "bottleneck-1", type: "dependency-path", blockedTaskId: "verify-content", blockerLabel: "앞 작업", delayUnits: 1, affectedTaskIds: [], explanation: "앞 작업을 기다렸습니다." }], totalWaitUnits: 1 } }),
      comparison: { finishDelta: 0, waitDelta: 0, changedTaskIds: [], preserved: { safety: true, quality: true, fairness: true }, summary: "완료" },
      evidence: { dependencyExplanation: "a", parallelExplanation: "b", bottleneckExplanation: "c", tradeoffExplanation: "d" },
      completed: true,
    };
    const reportState = { ...createInitialState(), attempts: { ...createInitialState().attempts, "science-display": completedAttempt } };
    const evidenceChanged = appReducer(reportState, { type: "SET_EVIDENCE_FIELD", field: "tradeoffExplanation", value: "수정" });
    expect(evidenceChanged.attempts["science-display"]!.completed).toBe(false);

    const revisionState = { ...reportState, attempts: { ...reportState.attempts, "science-display": { ...completedAttempt, stage: "revision" as const } } };
    const scheduleChanged = appReducer(revisionState, { type: "SET_REVISED_SCHEDULE", draft: revised });
    expect(scheduleChanged.attempts["science-display"]!.completed).toBe(false);
    expect(scheduleChanged.attempts["science-display"]!.revisedSnapshot).toBeNull();
    expect(scheduleChanged.attempts["science-display"]!.comparison).toBeNull();
    const snapshotSaved = appReducer(revisionState, { type: "SAVE_REVISED_SNAPSHOT", snapshot: snapshot(), comparison: completedAttempt.comparison });
    expect(snapshotSaved.attempts["science-display"]!.completed).toBe(false);
  });
});
