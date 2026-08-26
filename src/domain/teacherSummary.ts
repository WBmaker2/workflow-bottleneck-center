import type { MissionAttempt } from "../app/appTypes";
import type { ScenarioDefinition, ScheduleMetrics } from "./types";

export interface TeacherSummary {
  scenarioId: ScenarioDefinition["id"];
  scenarioTitle: string;
  initialMetrics: ScheduleMetrics;
  revisedMetrics: ScheduleMetrics;
  comparison: NonNullable<MissionAttempt["comparison"]>;
  explanations: MissionAttempt["evidence"];
  conditionSummary: readonly string[];
  disclaimer: string;
}
const DISCLAIMER = "이 결과는 교육용 가상 모델이며 실제 사람의 생산성 평가에 사용할 수 없습니다.";
const evidenceFields = ["dependencyExplanation", "parallelExplanation", "bottleneckExplanation", "tradeoffExplanation"] as const;

export function isEvidenceComplete(evidence: MissionAttempt["evidence"]): boolean {
  return evidenceFields.every((field) => evidence[field].trim().length >= 10);
}

export function buildTeacherSummary(scenario: ScenarioDefinition, attempt: MissionAttempt): TeacherSummary {
  if (!attempt.initialSnapshot || !attempt.revisedSnapshot || !attempt.comparison) {
    throw new Error("Teacher summary requires a revised comparison");
  }
  const metrics = attempt.revisedSnapshot.evaluation.metrics;
  return {
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    initialMetrics: attempt.initialSnapshot.evaluation.metrics,
    revisedMetrics: metrics,
    comparison: attempt.comparison,
    explanations: { ...attempt.evidence },
    conditionSummary: [
      `안전 조건 ${metrics.safetyMet ? "충족" : "미충족"}`,
      `품질 조건 ${metrics.qualityMet ? "충족" : "미충족"}`,
      `역할 공정성 ${metrics.fairnessMet ? "충족" : "미충족"}`,
    ],
    disclaimer: DISCLAIMER,
  };
}
