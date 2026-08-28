import { expect, test } from "@playwright/test";
import { scenarioCatalog } from "../src/data/scenarios";
import { makeScenario } from "../src/test/fixtures";
import { analyzeBottlenecks } from "../src/domain/bottleneckAnalyzer";
import { evaluateSchedule } from "../src/domain/evaluator";
import { requiredEdgesFromScenario } from "../src/domain/scenarioValidation";
import { simulateSchedule } from "../src/domain/simulator";
import type { ScheduleDraft, TaskDefinition } from "../src/domain/types";
import { draftFor, enterRevisionByKeyboard, installKeyboardSelectSupport, missionSolutions, pressButton } from "./fixtures/missionSolutions";

const science = scenarioCatalog.find(({ id }) => id === "science-display")!;
const campaign = scenarioCatalog.find(({ id }) => id === "eco-campaign-booth")!;
const expectedRevisions = {
  "science-display": { finish: 10, loads: { A: 6, B: 6, C: 5 } },
  "library-cart": { finish: 10, loads: { A: 6, B: 7, C: 4 } },
  "class-presentation": { finish: 9, loads: { A: 8, B: 9, C: 5 } },
  "eco-campaign-booth": { finish: 14, loads: { A: 11, B: 11, C: 8 } },
} as const;

const draftWithout = (scenarioId: "science-display" | "eco-campaign-booth", removed: readonly string[]): ScheduleDraft => {
  const solution = missionSolutions[scenarioId];
  return draftFor(scenarioId, solution.revisedEntries.filter(({ taskId }) => !removed.includes(taskId)));
};

test.describe("learning contract", () => {
  test.beforeEach(async ({ page }) => {
    await installKeyboardSelectSupport(page);
  });

  test("approved revisions keep their declared time and role-load evidence", () => {
    for (const [scenarioId, expected] of Object.entries(expectedRevisions) as [keyof typeof expectedRevisions, typeof expectedRevisions[keyof typeof expectedRevisions]][]) {
      const scenario = scenarioCatalog.find(({ id }) => id === scenarioId)!;
      const result = simulateSchedule(scenario, draftFor(scenarioId, missionSolutions[scenarioId].revisedEntries));
      const evaluation = evaluateSchedule(scenario, result);
      expect(evaluation.status).toBe("successful");
      expect(result.finishTime).toBe(expected.finish);
      expect(evaluation.metrics.roleLoadUnits).toEqual(expected.loads);
    }
  });

  test("a fast science draft without final review never succeeds", () => {
    const result = simulateSchedule(science, draftWithout("science-display", ["final-review"]));
    const evaluation = evaluateSchedule(science, result);
    expect(evaluation.status).toBe("incomplete");
    expect(evaluation.feedback).toContain("완료 조건이 충족되지 않았습니다: 최종 점검 작업이 빠졌습니다.");
    expect(evaluation.metrics.qualityMet).toBe(false);
  });

  test("campaign safety work cannot be traded for a shorter finish", () => {
    for (const removed of [["check-safe-path"], ["final-safety-walkthrough"]]) {
      const result = simulateSchedule(campaign, draftWithout("eco-campaign-booth", removed));
      const evaluation = evaluateSchedule(campaign, result);
      expect(evaluation.metrics.safetyMet).toBe(false);
      expect(evaluation.status).not.toBe("successful");
      expect(evaluation.feedback.some((message) => message.includes("완료 조건이 충족되지 않았습니다"))).toBe(true);
    }
  });

  test("an unnecessary safe relation remains valid and explains its waiting cost", () => {
    const required = requiredEdgesFromScenario(science);
    const extra = { beforeTaskId: "prepare-print-file", afterTaskId: "prepare-illustrations" } as const;
    const withExtra = simulateSchedule(science, {
      entries: missionSolutions["science-display"].initialEntries,
      learnerEdges: [...required, extra],
    });
    expect(withExtra.waits.some(({ reason }) => reason === "dependency")).toBe(true);
    expect(analyzeBottlenecks(science, withExtra).findings.length).toBeGreaterThan(0);
    expect(withExtra.issues).toEqual([]);
  });

  test("two different science role assignments are both successful without ranking", () => {
    const first = missionSolutions["science-display"].revisedEntries;
    const alternate = first.map((entry) => {
      if (entry.taskId === "verify-content") return { ...entry, roleIds: ["B"] as const };
      if (entry.taskId === "prepare-print-file") return { ...entry, roleIds: ["A"] as const };
      return { ...entry, roleIds: [...entry.roleIds] };
    });
    const firstEvaluation = evaluateSchedule(science, simulateSchedule(science, draftFor("science-display", first)));
    const alternateEvaluation = evaluateSchedule(science, simulateSchedule(science, draftFor("science-display", alternate)));
    expect(firstEvaluation.status).toBe("successful");
    expect(alternateEvaluation.status).toBe("successful");
    expect(first).not.toEqual(alternate);
  });

  test("the long independent task is not selectable as a bottleneck", () => {
    const task = (id: string, duration: number, overrides: Partial<TaskDefinition> = {}): TaskDefinition => ({
      id, title: id, duration, prerequisites: [], peopleRequired: 1, resources: [], parallel: "allowed", conditions: [], evidenceKinds: [], unlocks: [], ...overrides,
    });
    const scenario = makeScenario({ tasks: [
      task("resource-holder", 4, { resources: [{ resourceId: "printer", quantity: 1 }] }),
      task("long-independent", 6),
      task("prepare", 2, { unlocks: ["shared-a"] }),
      task("shared-a", 3, { prerequisites: [{ taskId: "prepare", kind: "workflow", reason: "준비 뒤 진행" }], resources: [{ resourceId: "printer", quantity: 1 }], unlocks: ["finish"] }),
      task("finish", 3, { prerequisites: [{ taskId: "shared-a", kind: "workflow", reason: "공유 작업 뒤 진행" }] }),
    ], resources: [{ id: "printer", label: "프린터", capacity: 1 }]});
    const result = simulateSchedule(scenario, {
      learnerEdges: [],
      entries: scenario.tasks.map((item) => ({ taskId: item.id, plannedStart: 0, roleIds: [item.id === "long-independent" ? "C" : item.id === "prepare" ? "B" : "A"] })),
    });
    const analysis = analyzeBottlenecks(scenario, result);
    expect(analysis.findings.some(({ blockedTaskId }) => blockedTaskId === "long-independent")).toBe(false);
    expect(analysis.criticalTaskIds).not.toContain("long-independent");
  });

  test("the learner path makes no request outside the local app origin", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("./");
    const origin = new URL(page.url()).origin;
    expect(requests.filter((url) => !url.startsWith(`${origin}/`) && url !== origin)).toEqual([]);
  });

  test("unfinished revision shows the completion failure and hides report entry", async ({ page }) => {
    await page.goto("./");
    await enterRevisionByKeyboard(page, missionSolutions["science-display"]);
    await page.getByRole("button", { name: "최종 점검 일정 삭제" }).click();
    await pressButton(page, "수정안 실행·비교");
    await expect(page.getByRole("alert")).toContainText("완료 조건이 충족되지 않았습니다");
    await expect(page.getByRole("alert")).toContainText("최종 점검 작업이 빠졌습니다");
    await expect(page.getByRole("button", { name: "보고서 작성" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "개선 보고서" })).toHaveCount(0);
  });

  test("unsafe revision shows the safety failure and hides report entry", async ({ page }) => {
    await page.goto("./");
    await enterRevisionByKeyboard(page, missionSolutions["eco-campaign-booth"]);
    await page.getByRole("button", { name: "안전 통로 점검 일정 삭제" }).click();
    await pressButton(page, "수정안 실행·비교");
    await expect(page.getByRole("alert")).toContainText("완료 조건이 충족되지 않았습니다");
    await expect(page.getByRole("alert")).toContainText("안전 통로 점검");
    await expect(page.getByRole("button", { name: "보고서 작성" })).toHaveCount(0);
  });
});
