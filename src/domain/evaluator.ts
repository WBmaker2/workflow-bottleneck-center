import type { ScenarioDefinition, ScheduleEvaluation, ScheduleMetrics, TaskRun } from "./types";

type Violation = ScheduleEvaluation["violations"][number];
const roleIds = ["A", "B", "C"] as const;

const requiredTaskIds = (scenario: ScenarioDefinition, kind: "safety" | "quality"): readonly string[] =>
  scenario.tasks.filter((task) => task.evidenceKinds.includes(kind) || task.conditions.some((condition) => condition.kind === kind)).map((task) => task.id);

const titles = (scenario: ScenarioDefinition, ids: readonly string[]): string =>
  ids.map((id) => scenario.tasks.find((task) => task.id === id)?.title ?? id).join(", ");

const missingFeedback = (scenario: ScenarioDefinition, ids: readonly string[]): string => {
  const labels = ids.map((id) => scenario.tasks.find((task) => task.id === id)?.title ?? id);
  if (labels.length === 1) return `${labels[0]} 작업이 빠졌습니다.`;
  return `${labels.join(", ")} 작업이 빠졌습니다.`;
};

const roleLoads = (scenario: ScenarioDefinition, runs: readonly TaskRun[]): Readonly<Record<"A" | "B" | "C", number>> => {
  const result: Record<"A" | "B" | "C", number> = { A: 0, B: 0, C: 0 };
  for (const run of runs) for (const roleId of run.roleIds) result[roleId] += run.end - run.actualStart;
  return Object.freeze(result);
};

const metricsFor = (scenario: ScenarioDefinition, result: Parameters<typeof evaluateSchedule>[1]): ScheduleMetrics => {
  const completed = new Set(result.runs.map((run) => run.taskId));
  const loads = roleLoads(scenario, result.runs);
  const values = roleIds.map((id) => loads[id]);
  const participating = values.filter((load) => load > 0).length;
  const safetyIds = requiredTaskIds(scenario, "safety");
  const qualityIds = requiredTaskIds(scenario, "quality");
  return {
    finishTime: result.finishTime,
    totalWaitUnits: result.waits.reduce((sum, wait) => sum + Math.max(0, wait.to - wait.from), 0),
    roleLoadUnits: loads,
    safetyMet: safetyIds.every((id) => completed.has(id)),
    qualityMet: qualityIds.every((id) => completed.has(id)),
    fairnessMet: participating >= scenario.fairness.minParticipatingRoles
      && Math.max(...values) - Math.min(...values) <= scenario.fairness.maxLoadGap,
    timeGoalMet: result.finishTime <= scenario.timeGoal,
  };
};

export function evaluateSchedule(
  scenario: ScenarioDefinition,
  result: { runs: readonly TaskRun[]; waits: readonly { from: number; to: number }[]; finishTime: number; omittedTaskIds: readonly string[]; blockedTaskIds: readonly string[]; issues: readonly { code: string; message: string }[] },
): ScheduleEvaluation {
  const metrics = metricsFor(scenario, result);
  const completed = new Set(result.runs.map((run) => run.taskId));
  const structureMissing = scenario.tasks.filter((task) => !completed.has(task.id));
  const structural = result.omittedTaskIds.length > 0 || result.blockedTaskIds.length > 0 || result.issues.length > 0 || structureMissing.length > 0;
  const safetyMissing = requiredTaskIds(scenario, "safety").filter((id) => !completed.has(id));
  const qualityMissing = requiredTaskIds(scenario, "quality").filter((id) => !completed.has(id));
  const violations: Violation[] = [];
  const feedback: string[] = [];
  if (structural) {
    const details = structureMissing.length > 0 ? titles(scenario, structureMissing.map((task) => task.id)) : "실행 기록";
    violations.push({ kind: "structure", message: `모든 작업이 완료되지 않았습니다: ${details}.` });
    feedback.push("완료 조건이 충족되지 않았습니다: 모든 작업을 실행하고 막힌 작업을 확인하세요.");
  }
  if (!metrics.safetyMet) {
    violations.push({ kind: "safety", message: `안전 필수 작업이 빠졌습니다: ${titles(scenario, safetyMissing)}.` });
    feedback.push(`완료 조건이 충족되지 않았습니다: ${missingFeedback(scenario, safetyMissing)}`);
  }
  if (!metrics.qualityMet) {
    violations.push({ kind: "quality", message: `품질 필수 작업이 빠졌습니다: ${titles(scenario, qualityMissing)}.` });
    feedback.push(`완료 조건이 충족되지 않았습니다: ${missingFeedback(scenario, qualityMissing)}`);
  }
  if (!metrics.fairnessMet) {
    violations.push({ kind: "fairness", message: "역할 참여 수 또는 역할별 부하 차이가 시나리오 조건을 충족하지 않습니다." });
    feedback.push("역할 공정성 조건이 충족되지 않았습니다: 참여 역할 수와 역할별 가상 부하 차이를 확인하세요.");
  }
  if (!metrics.timeGoalMet) {
    violations.push({ kind: "time", message: `목표 시간이 ${result.finishTime - scenario.timeGoal}단위 초과되었습니다.` });
    feedback.push(`목표 시간 ${scenario.timeGoal}단위 안에 완료하도록 시작 시점을 다시 살펴보세요.`);
  }
  const status = structural ? "incomplete" : metrics.safetyMet && metrics.qualityMet && metrics.fairnessMet && metrics.timeGoalMet ? "successful" : "revise";
  return { status, metrics, violations: Object.freeze(violations), feedback: Object.freeze(feedback) };
}
