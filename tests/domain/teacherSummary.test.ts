import { describe, expect, it } from "vitest";
import { buildTeacherSummary, isEvidenceComplete } from "../../src/domain/teacherSummary";
import type { MissionAttempt } from "../../src/app/appTypes";
import { getScenario } from "../../src/data/scenarios";

const scenario = getScenario("science-display");
const snapshot = {
  draft: { entries: [], learnerEdges: [] },
  result: { runs: [], waits: [], finishTime: 12, omittedTaskIds: [], blockedTaskIds: [], issues: [] },
  bottlenecks: { criticalTaskIds: [], findings: [], totalWaitUnits: 0 },
  evaluation: {
    status: "successful" as const,
    metrics: { finishTime: 12, totalWaitUnits: 0, roleLoadUnits: { A: 4, B: 4, C: 4 }, safetyMet: true, qualityMet: true, fairnessMet: true, timeGoalMet: false },
    violations: [], feedback: [],
  },
};
const attempt = {
  scenarioId: scenario.id,
  stage: "report" as const,
  conditionsAcknowledged: true,
  relationEdges: [],
  draftSchedule: snapshot.draft,
  initialSnapshot: snapshot,
  prediction: null,
  predictionExplanation: "",
  selectedFindingId: null,
  revisedSchedule: snapshot.draft,
  revisedSnapshot: snapshot,
  comparison: { finishDelta: 0, waitDelta: 0, changedTaskIds: [], preserved: { safety: true, quality: true, fairness: true }, summary: "" },
  evidence: {
    dependencyExplanation: "자료 확인 뒤 인쇄 파일을 정리해야 품질을 지킬 수 있습니다.",
    parallelExplanation: "글 정리와 그림 준비는 도구가 겹치지 않아 함께 할 수 있습니다.",
    bottleneckExplanation: "이번 실행에서는 기록된 기다림이 없어 기다리지 않았습니다.",
    tradeoffExplanation: "확인·휴식을 유지해 시간보다 안전과 품질을 지켰습니다.",
  },
  completed: false,
} satisfies MissionAttempt;

describe("teacher summary", () => {
  it("contains both metrics, all evidence, honest conditions, and no identity fields", () => {
    const summary = buildTeacherSummary(scenario, attempt);
    expect(summary).toMatchObject({
      scenarioId: "science-display",
      scenarioTitle: "과학 전시판 준비",
      disclaimer: "이 결과는 교육용 가상 모델이며 실제 사람의 생산성 평가에 사용할 수 없습니다.",
      conditionSummary: ["안전 조건 충족", "품질 조건 충족", "역할 공정성 충족"],
      initialMetrics: snapshot.evaluation.metrics,
      revisedMetrics: snapshot.evaluation.metrics,
      explanations: attempt.evidence,
    });
    expect(JSON.stringify(summary)).not.toMatch(/studentName|learnerName|email|성별|순위/);
  });

  it("always reports unmet revised conditions", () => {
    const unsafe = { ...attempt, revisedSnapshot: { ...snapshot, evaluation: { ...snapshot.evaluation, metrics: { ...snapshot.evaluation.metrics, safetyMet: false, qualityMet: false, fairnessMet: false } } } };
    expect(buildTeacherSummary(scenario, unsafe).conditionSummary).toEqual(["안전 조건 미충족", "품질 조건 미충족", "역할 공정성 미충족"]);
  });

  it("throws until the revised comparison exists and requires trimmed ten-character evidence", () => {
    expect(() => buildTeacherSummary(scenario, { ...attempt, revisedSnapshot: null })).toThrow("Teacher summary requires a revised comparison");
    expect(() => buildTeacherSummary(scenario, { ...attempt, comparison: null })).toThrow("Teacher summary requires a revised comparison");
    expect(isEvidenceComplete(attempt.evidence)).toBe(true);
    expect(isEvidenceComplete({ ...attempt.evidence, tradeoffExplanation: "  짧음  " })).toBe(false);
  });
});
