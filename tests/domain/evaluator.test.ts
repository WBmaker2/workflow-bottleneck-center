import { describe, expect, it } from "vitest";
import { getScenario } from "../../src/data/scenarios";
import { requiredEdgesFromScenario } from "../../src/domain/scenarioValidation";
import { evaluateSchedule } from "../../src/domain/evaluator";
import { simulateSchedule } from "../../src/domain/simulator";
import type { ScheduleDraft, SimulationResult } from "../../src/domain/types";

const scienceDisplay = getScenario("science-display");
const validDraftA: ScheduleDraft = {
  learnerEdges: requiredEdgesFromScenario(scienceDisplay),
  entries: [
    { taskId: "verify-content", plannedStart: 0, roleIds: ["A"] },
    { taskId: "prepare-print-file", plannedStart: 0, roleIds: ["B"] },
    { taskId: "prepare-illustrations", plannedStart: 0, roleIds: ["C"] },
    { taskId: "print-text", plannedStart: 0, roleIds: ["A"] },
    { taskId: "attach-materials", plannedStart: 0, roleIds: ["A", "B"] },
    { taskId: "final-review", plannedStart: 0, roleIds: ["B", "C"] },
  ],
};
const validDraftB: ScheduleDraft = {
  learnerEdges: requiredEdgesFromScenario(scienceDisplay),
  entries: [
    { taskId: "verify-content", plannedStart: 0, roleIds: ["C"] },
    { taskId: "prepare-print-file", plannedStart: 0, roleIds: ["A"] },
    { taskId: "prepare-illustrations", plannedStart: 0, roleIds: ["B"] },
    { taskId: "print-text", plannedStart: 0, roleIds: ["C"] },
    { taskId: "attach-materials", plannedStart: 0, roleIds: ["A", "C"] },
    { taskId: "final-review", plannedStart: 0, roleIds: ["A", "B"] },
  ],
};

describe("schedule evaluation", () => {
  it("never succeeds when a fast draft omits final quality review", () => {
    const result = simulateSchedule(scienceDisplay, { ...validDraftA, entries: validDraftA.entries.filter(({ taskId }) => taskId !== "final-review") });
    const evaluation = evaluateSchedule(scienceDisplay, result);
    expect(evaluation.status).toBe("incomplete");
    expect(evaluation.metrics.qualityMet).toBe(false);
    expect(evaluation.feedback).toContain("완료 조건이 충족되지 않았습니다: 최종 점검 작업이 빠졌습니다.");
  });

  it("accepts two safe schedules with different role tradeoffs", () => {
    expect(evaluateSchedule(scienceDisplay, simulateSchedule(scienceDisplay, validDraftA)).status).toBe("successful");
    expect(evaluateSchedule(scienceDisplay, simulateSchedule(scienceDisplay, validDraftB)).status).toBe("successful");
    expect(validDraftA).not.toEqual(validDraftB);
  });

  it("keeps an unsafe result unsuccessful even when its time is good", () => {
    const result: SimulationResult = {
      runs: scienceDisplay.tasks.filter((task) => task.id !== "print-text").map((task, index) => ({ taskId: task.id, plannedStart: index, actualStart: index, end: index + task.duration, roleIds: ["A"] })),
      waits: [], finishTime: 3, omittedTaskIds: ["print-text"], blockedTaskIds: [], issues: [],
    };
    const evaluation = evaluateSchedule(scienceDisplay, result);
    expect(evaluation.status).toBe("incomplete");
    expect(evaluation.metrics.safetyMet).toBe(false);
    expect(evaluation.metrics.timeGoalMet).toBe(true);
  });

  const completeResult = (assignments: Record<string, ("A" | "B" | "C")[]>, finishTime = scienceDisplay.timeGoal): SimulationResult => ({
    runs: scienceDisplay.tasks.map((task, index) => ({
      taskId: task.id,
      plannedStart: 0,
      actualStart: index,
      end: index + task.duration,
      roleIds: assignments[task.id] ?? ["A"],
    })),
    waits: [], finishTime, omittedTaskIds: [], blockedTaskIds: [], issues: [],
  });

  it("revises when participating roles are one below the minimum", () => {
    const result = completeResult(Object.fromEntries(scienceDisplay.tasks.map((task) => [task.id, task.peopleRequired === 2 ? ["A", "B"] : ["A"]])));
    const scenario = { ...scienceDisplay, fairness: { minParticipatingRoles: 3 as const, maxLoadGap: 99 } };
    const evaluation = evaluateSchedule(scenario, result);
    expect(evaluation.status).toBe("revise");
    expect(evaluation.metrics.fairnessMet).toBe(false);
  });

  it("revises when role load gap is exactly maxLoadGap plus one", () => {
    const result = completeResult({
      "verify-content": ["A"], "prepare-print-file": ["A"], "print-text": ["A"],
      "prepare-illustrations": ["C"], "attach-materials": ["A", "B"], "final-review": ["A", "B"],
    });
    const scenario = { ...scienceDisplay, fairness: { ...scienceDisplay.fairness, maxLoadGap: 6 } };
    const evaluation = evaluateSchedule(scenario, result);
    expect(Math.max(...Object.values(evaluation.metrics.roleLoadUnits)) - Math.min(...Object.values(evaluation.metrics.roleLoadUnits))).toBe(scenario.fairness.maxLoadGap + 1);
    expect(evaluation.status).toBe("revise");
    expect(evaluation.metrics.fairnessMet).toBe(false);
  });

  it("revises when completion is exactly timeGoal plus one", () => {
    const result = completeResult({
      "verify-content": ["A"], "prepare-print-file": ["B"], "print-text": ["A"],
      "prepare-illustrations": ["C"], "attach-materials": ["A", "B"], "final-review": ["B", "C"],
    }, scienceDisplay.timeGoal + 1);
    const evaluation = evaluateSchedule(scienceDisplay, result);
    expect(evaluation.status).toBe("revise");
    expect(evaluation.metrics.timeGoalMet).toBe(false);
  });
});
