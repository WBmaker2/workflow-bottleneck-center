import type { AttemptComparison, ScheduleDraft, ScheduleEvaluation, ScenarioDefinition, ScheduleEntry } from "./types";

const sortedRoles = (scenario: ScenarioDefinition, roles: ScheduleEntry["roleIds"]): readonly string[] => {
  const order = new Map(scenario.roles.map((role, index) => [role.id, index]));
  return [...roles].sort((left, right) => (order.get(left) ?? 99) - (order.get(right) ?? 99) || left.localeCompare(right));
};

const entryByTask = (draft: ScheduleDraft): ReadonlyMap<string, ScheduleEntry> =>
  new Map(draft.entries.map((entry) => [entry.taskId, entry]));

const quantityChange = (value: number, unit: string): string =>
  value < 0 ? `${Math.abs(value)}단위 감소` : value > 0 ? `${value}단위 증가` : `${unit} 변화 없음`;

export function compareAttempts(
  scenario: ScenarioDefinition,
  initialDraft: ScheduleDraft,
  initial: ScheduleEvaluation,
  revisedDraft: ScheduleDraft,
  revised: ScheduleEvaluation,
): AttemptComparison {
  const initialEntries = entryByTask(initialDraft);
  const revisedEntries = entryByTask(revisedDraft);
  const changedTaskIds = scenario.tasks.filter((task) => {
    const before = initialEntries.get(task.id);
    const after = revisedEntries.get(task.id);
    if (!before || !after) return Boolean(before || after);
    return before.plannedStart !== after.plannedStart
      || JSON.stringify(sortedRoles(scenario, before.roleIds)) !== JSON.stringify(sortedRoles(scenario, after.roleIds));
  }).map((task) => task.id);
  const finishDelta = revised.metrics.finishTime - initial.metrics.finishTime;
  const waitDelta = revised.metrics.totalWaitUnits - initial.metrics.totalWaitUnits;
  const preserved = {
    safety: initial.metrics.safetyMet && revised.metrics.safetyMet,
    quality: initial.metrics.qualityMet && revised.metrics.qualityMet,
    fairness: initial.metrics.fairnessMet && revised.metrics.fairnessMet,
  };
  const lost = [
    !revised.metrics.safetyMet ? "안전 조건" : "",
    !revised.metrics.qualityMet ? "품질 조건" : "",
  ].filter(Boolean);
  const fairnessSummary = initial.metrics.fairnessMet && revised.metrics.fairnessMet
    ? "역할 공정성을 유지했습니다."
    : initial.metrics.fairnessMet && !revised.metrics.fairnessMet
      ? "역할 공정성을 유지하지 못했습니다."
      : !initial.metrics.fairnessMet && revised.metrics.fairnessMet
        ? "역할 공정성이 개선되었습니다."
        : "역할 공정성 조건이 아직 충족되지 않았습니다.";
  const prefix = lost.length > 0 ? `${lost.join(", ")}을 유지하지 못했습니다. ` : "";
  const conditionSummary = initial.metrics.safetyMet && revised.metrics.safetyMet
    && initial.metrics.qualityMet && revised.metrics.qualityMet
    && initial.metrics.fairnessMet && revised.metrics.fairnessMet
    ? "안전·품질·역할 공정성을 유지했습니다."
    : fairnessSummary;
  return {
    finishDelta,
    waitDelta,
    changedTaskIds: Object.freeze(changedTaskIds),
    preserved,
    summary: `${prefix}${conditionSummary} 전체 시간 ${quantityChange(finishDelta, "시간")}, 대기 ${quantityChange(waitDelta, "대기단위")}입니다.`,
  };
}
