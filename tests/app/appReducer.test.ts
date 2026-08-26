import { describe, expect, it } from "vitest";
import { appReducer, createInitialState } from "../../src/app/appReducer";
import { canEnterStage, getRequiredAction } from "../../src/app/appSelectors";
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
    const initialSnapshot = snapshot();
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

  it("does not mutate an earlier attempt or its snapshot", () => {
    const initialSnapshot = snapshot();
    const state = withAttempt((attempt) => ({ ...attempt, stage: "simulation", initialSnapshot }));
    const next = appReducer(state, { type: "SAVE_INITIAL_SNAPSHOT", snapshot: snapshot({ draft: { entries: [], learnerEdges: [] } }) });
    expect(state.attempts["science-display"]!.initialSnapshot).toBe(initialSnapshot);
    expect(next.attempts).not.toBe(state.attempts);
    expect(next.attempts["science-display"]).not.toBe(state.attempts["science-display"]);
  });
});
