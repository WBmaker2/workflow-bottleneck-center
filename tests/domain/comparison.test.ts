import { describe, expect, it } from "vitest";
import { getScenario } from "../../src/data/scenarios";
import { compareAttempts } from "../../src/domain/comparison";
import type { ScheduleDraft, ScheduleEvaluation } from "../../src/domain/types";

const evaluation = (finishTime: number, totalWaitUnits: number): ScheduleEvaluation => ({
  status: "successful",
  metrics: { finishTime, totalWaitUnits, roleLoadUnits: { A: 4, B: 4, C: 4 }, safetyMet: true, qualityMet: true, fairnessMet: true, timeGoalMet: true },
  violations: [], feedback: [],
});

describe("attempt comparison", () => {
  it("returns revised-minus-initial deltas and stable changed task order", () => {
    const scenario = getScenario("science-display");
    const initialDraft: ScheduleDraft = { learnerEdges: [], entries: scenario.tasks.map((task, index) => ({ taskId: task.id, plannedStart: index, roleIds: task.peopleRequired === 2 ? ["A", "B"] : ["A"] })) };
    const revisedDraft: ScheduleDraft = { learnerEdges: [], entries: initialDraft.entries.map((entry) => entry.taskId === "prepare-illustrations" ? { ...entry, plannedStart: 1 } : entry.taskId === "print-text" ? { ...entry, plannedStart: 1 } : entry) };
    const comparison = compareAttempts(scenario, initialDraft, evaluation(12, 7), revisedDraft, evaluation(10, 4));
    expect(comparison).toMatchObject({ finishDelta: -2, waitDelta: -3, preserved: { safety: true, quality: true, fairness: true } });
    expect(comparison.changedTaskIds).toEqual(["print-text", "prepare-illustrations"]);
    expect(comparison.summary).toContain("대기 3단위 감소");
  });
});
