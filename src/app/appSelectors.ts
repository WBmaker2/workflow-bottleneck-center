import { getScenario } from "../data/scenarios";
import { validateRelationMap } from "../domain/relationValidator";
import type { LearningStage, MissionAttempt } from "./appTypes";

const stages: readonly LearningStage[] = ["briefing", "relations", "schedule", "simulation", "analysis", "revision", "report"];

const relationReady = (attempt: MissionAttempt): boolean => {
  const validation = validateRelationMap(getScenario(attempt.scenarioId), attempt.relationEdges);
  return validation.missingRequired.length === 0
    && validation.cycleTaskIds.length === 0
    && validation.unknown.length === 0
    && validation.duplicate.length === 0;
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
    case "simulation": return true;
    case "analysis": return attempt.initialSnapshot !== null && attempt.prediction !== null;
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
