import { getScenario } from "../data/scenarios";
import { validateRelationMap } from "../domain/relationValidator";
import { simulateSchedule } from "../domain/simulator";
import { isScheduleStart } from "../domain/scheduleBounds";
import type { LearningStage, MissionAttempt } from "./appTypes";

const stages: readonly LearningStage[] = ["briefing", "relations", "schedule", "simulation", "analysis", "revision", "report"];

const relationReady = (attempt: MissionAttempt): boolean => {
  const validation = validateRelationMap(getScenario(attempt.scenarioId), attempt.relationEdges);
  return validation.missingRequired.length === 0
    && validation.cycleTaskIds.length === 0
    && validation.unknown.length === 0
    && validation.duplicate.length === 0;
};

export const isScheduleReady = (scenario: ReturnType<typeof getScenario>, draft: MissionAttempt["draftSchedule"]): boolean => {
  if (!draft || typeof draft !== "object") return false;
  if (!Array.isArray(draft.entries) || !Array.isArray(draft.learnerEdges)) return false;
  const taskIds = new Set(scenario.tasks.map(({ id }) => id));
  const roleIds: ReadonlySet<string> = new Set(scenario.roles.map(({ id }) => id));
  if (draft.entries.length !== taskIds.size || new Set(draft.entries.map((entry) => entry && typeof entry === "object" ? entry.taskId : "")).size !== taskIds.size) return false;
  if (draft.entries.some((entry) => {
    if (entry === null || typeof entry !== "object") return true;
    const { taskId, plannedStart, roleIds: assigned } = entry;
    if (!Array.isArray(assigned)) return true;
    const task = scenario.tasks.find(({ id }) => id === taskId);
    return !task || !isScheduleStart(scenario, plannedStart) || assigned.length !== task.peopleRequired || new Set(assigned).size !== assigned.length || assigned.some((roleId: unknown) => typeof roleId !== "string" || !roleIds.has(roleId));
  })) return false;
  if (draft.learnerEdges.some((edge) => edge === null || typeof edge !== "object" || typeof edge.beforeTaskId !== "string" || typeof edge.afterTaskId !== "string")) return false;
  const relation = validateRelationMap(scenario, draft.learnerEdges);
  if (relation.missingRequired.length > 0 || relation.cycleTaskIds.length > 0 || relation.unknown.length > 0 || relation.duplicate.length > 0) return false;
  const result = simulateSchedule(scenario, draft);
  return result.omittedTaskIds.length === 0 && result.blockedTaskIds.length === 0 && result.issues.length === 0;
};

export function canEnterStage(attempt: MissionAttempt, stage: LearningStage): boolean {
  const target = stages.indexOf(stage);
  const current = stages.indexOf(attempt.stage);
  if (target < 0 || current < 0) return false;
  if (target <= current) return true;
  if (target !== current + 1) return false;
  switch (stage) {
    case "briefing": return true;
    case "relations": return attempt.conditionsAcknowledged;
    case "schedule": return relationReady(attempt);
    case "simulation": return isScheduleReady(getScenario(attempt.scenarioId), attempt.draftSchedule);
    case "analysis": return attempt.initialSnapshot !== null && (attempt.prediction !== null || attempt.initialSnapshot.result.waits.length === 0);
    case "revision": return attempt.selectedFindingId !== null;
    case "report": return attempt.revisedSnapshot !== null && attempt.comparison !== null;
    default: return false;
  }
}

export function getRequiredAction(attempt: MissionAttempt): "confirm-conditions" | "run-simulation" | "mark-bottleneck" | "compare-revision" | null {
  switch (attempt.stage) {
    case "briefing": return "confirm-conditions";
    case "schedule": return "run-simulation";
    case "analysis": return "mark-bottleneck";
    case "revision": return "compare-revision";
    default: return null;
  }
}

export const isRelationReady = relationReady;
