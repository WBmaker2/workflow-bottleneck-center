import { scenarioCatalog } from "../data/scenarios";
import { analyzeBottlenecks } from "../domain/bottleneckAnalyzer";
import { compareAttempts } from "../domain/comparison";
import { evaluateSchedule } from "../domain/evaluator";
import { simulateSchedule } from "../domain/simulator";
import type { DependencyEdge, ScheduleDraft, ScenarioDefinition, ScenarioId } from "../domain/types";
import { createInitialState } from "../app/appReducer";
import { isScheduleReady } from "../app/appSelectors";
import { validateRelationMap } from "../domain/relationValidator";
import { isScheduleStart } from "../domain/scheduleBounds";
import type { AppProgressV1, AppState, LearningEvidence, MissionAttempt, PersistedMissionAttempt, AttemptSnapshot } from "../app/appTypes";

const scenarioIds: ReadonlySet<string> = new Set(scenarioCatalog.map(({ id }) => id));
const stages = new Set(["briefing", "relations", "schedule", "simulation", "analysis", "revision", "report"]);
const reasons = new Set(["dependency", "resource", "role", "solo"]);
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isScenarioId = (value: unknown): value is ScenarioId => isString(value) && scenarioIds.has(value);
const cloneFreeze = <T>(value: T): T => {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return Object.freeze(value.map((item) => cloneFreeze(item))) as T;
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneFreeze(item)]))) as T;
};

const readEdges = (value: unknown, taskIds: ReadonlySet<string>): readonly DependencyEdge[] | null => {
  if (!Array.isArray(value)) return null;
  const edges: DependencyEdge[] = [];
  for (const item of value) {
    if (!isRecord(item) || !isString(item.beforeTaskId) || !isString(item.afterTaskId) || !taskIds.has(item.beforeTaskId) || !taskIds.has(item.afterTaskId)) return null;
    edges.push({ beforeTaskId: item.beforeTaskId, afterTaskId: item.afterTaskId });
  }
  return edges;
};

const readDraft = (value: unknown, scenario: ScenarioDefinition): ScheduleDraft | null => {
  if (!isRecord(value)) return null;
  const taskIds = new Set(scenario.tasks.map(({ id }) => id));
  const learnerEdges = readEdges(value.learnerEdges, taskIds);
  if (!learnerEdges || !Array.isArray(value.entries)) return null;
  const entries = [];
  const roleIds: ReadonlySet<string> = new Set(scenario.roles.map(({ id }) => id));
  for (const item of value.entries) {
    if (!isRecord(item) || !isString(item.taskId) || !taskIds.has(item.taskId) || !isScheduleStart(scenario, item.plannedStart) || !Array.isArray(item.roleIds) || item.roleIds.some((id) => !isString(id) || !roleIds.has(id))) return null;
    entries.push({ taskId: item.taskId, plannedStart: item.plannedStart, roleIds: item.roleIds.map(String) as ("A" | "B" | "C")[] });
  }
  return { entries, learnerEdges };
};

const readEvidence = (value: unknown): LearningEvidence | null => {
  if (!isRecord(value)) return null;
  const fields = ["dependencyExplanation", "parallelExplanation", "bottleneckExplanation", "tradeoffExplanation"] as const;
  if (fields.some((field) => !isString(value[field]))) return null;
  return Object.fromEntries(fields.map((field) => [field, value[field]])) as unknown as LearningEvidence;
};

const readAttempt = (value: unknown, scenario: ScenarioDefinition): PersistedMissionAttempt | null => {
  if (!isRecord(value) || value.scenarioId !== scenario.id || !isString(value.stage) || !stages.has(value.stage) || !isBoolean(value.conditionsAcknowledged) || !isString(value.predictionExplanation) || !isBoolean(value.completed)) return null;
  const relationEdges = readEdges(value.relationEdges, new Set(scenario.tasks.map(({ id }) => id)));
  const draftSchedule = readDraft(value.draftSchedule, scenario);
  const revisedSchedule = value.revisedSchedule === null ? null : readDraft(value.revisedSchedule, scenario);
  const evidence = readEvidence(value.evidence);
  if (!relationEdges || !draftSchedule || (value.revisedSchedule !== null && !revisedSchedule) || !evidence) return null;
  if (value.prediction !== null && (!isString(value.prediction) || !reasons.has(value.prediction))) return null;
  if (value.selectedFindingId !== null && !isString(value.selectedFindingId)) return null;
  return { scenarioId: scenario.id, stage: value.stage as PersistedMissionAttempt["stage"], conditionsAcknowledged: value.conditionsAcknowledged, relationEdges, draftSchedule, prediction: value.prediction as PersistedMissionAttempt["prediction"], predictionExplanation: value.predictionExplanation, selectedFindingId: value.selectedFindingId, revisedSchedule, evidence, completed: value.completed };
};

export function encodeProgress(state: AppState): AppProgressV1 {
  const attempts = Object.fromEntries(scenarioCatalog.map(({ id }) => {
    const attempt = state.attempts[id];
    const draft = { entries: attempt.draftSchedule.entries.map(({ taskId, plannedStart, roleIds }) => ({ taskId, plannedStart, roleIds: [...roleIds] })), learnerEdges: attempt.draftSchedule.learnerEdges.map(({ beforeTaskId, afterTaskId }) => ({ beforeTaskId, afterTaskId })) };
    const revised = attempt.revisedSchedule === null ? null : { entries: attempt.revisedSchedule.entries.map(({ taskId, plannedStart, roleIds }) => ({ taskId, plannedStart, roleIds: [...roleIds] })), learnerEdges: attempt.revisedSchedule.learnerEdges.map(({ beforeTaskId, afterTaskId }) => ({ beforeTaskId, afterTaskId })) };
    return [id, { scenarioId: id, stage: attempt.stage, conditionsAcknowledged: attempt.conditionsAcknowledged, relationEdges: attempt.relationEdges.map(({ beforeTaskId, afterTaskId }) => ({ beforeTaskId, afterTaskId })), draftSchedule: draft, prediction: attempt.prediction, predictionExplanation: attempt.predictionExplanation, selectedFindingId: attempt.selectedFindingId, revisedSchedule: revised, evidence: { ...attempt.evidence }, completed: attempt.completed } satisfies PersistedMissionAttempt];
  }));
  return { version: 1, selectedScenarioId: state.selectedScenarioId, saveEnabled: true, attempts: attempts as unknown as AppProgressV1["attempts"] };
}

export function decodeProgress(raw: string): AppProgressV1 | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1 || value.saveEnabled !== true || !isScenarioId(value.selectedScenarioId) || !isRecord(value.attempts)) return null;
    const attempts: Record<string, PersistedMissionAttempt> = {};
    for (const [id, item] of Object.entries(value.attempts)) {
      if (!isScenarioId(id)) return null;
      const parsed = readAttempt(item, scenarioCatalog.find(({ id: scenarioId }) => scenarioId === id)!);
      if (!parsed) return null;
      if (!validSavedStage(parsed, scenarioCatalog.find(({ id: scenarioId }) => scenarioId === id)!)) return null;
      attempts[id] = parsed;
    }
    if (scenarioCatalog.some(({ id }) => !attempts[id])) return null;
    return { version: 1, selectedScenarioId: value.selectedScenarioId, saveEnabled: true, attempts: attempts as AppProgressV1["attempts"] };
  } catch {
    return null;
  }
}

const snapshotFor = (scenario: ScenarioDefinition, draft: ScheduleDraft): AttemptSnapshot => {
  const result = simulateSchedule(scenario, draft);
  return { draft, result, bottlenecks: analyzeBottlenecks(scenario, result), evaluation: evaluateSchedule(scenario, result) };
};
const stageIndex = (stage: MissionAttempt["stage"]): number => ["briefing", "relations", "schedule", "simulation", "analysis", "revision", "report"].indexOf(stage);

const validSavedStage = (saved: PersistedMissionAttempt, scenario: ScenarioDefinition): boolean => {
  const index = stageIndex(saved.stage);
  const draft = { ...saved.draftSchedule, learnerEdges: saved.relationEdges };
  const relation = validateRelationMap(scenario, saved.relationEdges);
  if (index >= 1 && !saved.conditionsAcknowledged) return false;
  if (index >= 2 && (relation.missingRequired.length > 0 || relation.cycleTaskIds.length > 0 || relation.unknown.length > 0 || relation.duplicate.length > 0)) return false;
  if (index >= 3 && !isScheduleReady(scenario, draft)) return false;
  const initial = index >= 4 || saved.selectedFindingId !== null ? snapshotFor(scenario, draft) : null;
  if (index >= 4 && (!initial || saved.prediction === null)) return false;
  if (saved.selectedFindingId !== null && (!initial || !initial.bottlenecks.findings.some(({ id }) => id === saved.selectedFindingId))) return false;
  if (index >= 5 && saved.selectedFindingId === null) return false;
  if (index >= 6 && saved.revisedSchedule === null) return false;
  return true;
};

export function rehydrateProgress(progress: AppProgressV1): AppState {
  const initial = createInitialState();
  const attempts = { ...initial.attempts };
  for (const scenario of scenarioCatalog) {
    const saved = progress.attempts[scenario.id];
    if (!saved) continue;
    const draftSchedule = { ...saved.draftSchedule, learnerEdges: saved.relationEdges };
    const requestedStage = stageIndex(saved.stage);
    const initialSnapshot = requestedStage >= 4 ? snapshotFor(scenario, draftSchedule) : null;
    const revisedSchedule = saved.revisedSchedule ? { ...saved.revisedSchedule, learnerEdges: saved.relationEdges } : null;
    const revisedSnapshot = revisedSchedule && initialSnapshot ? snapshotFor(scenario, revisedSchedule) : null;
    const comparison = revisedSchedule && initialSnapshot && revisedSnapshot ? compareAttempts(scenario, draftSchedule, initialSnapshot.evaluation, revisedSchedule, revisedSnapshot.evaluation) : null;
    const relation = validateRelationMap(scenario, saved.relationEdges);
    const relationValid = relation.missingRequired.length === 0 && relation.cycleTaskIds.length === 0 && relation.unknown.length === 0 && relation.duplicate.length === 0;
    const scheduleValid = relationValid && isScheduleReady(scenario, draftSchedule);
    const findingValid = saved.selectedFindingId === null || Boolean(initialSnapshot?.bottlenecks.findings.some(({ id }) => id === saved.selectedFindingId));
    const reachable = scheduleValid ? 3 : relationValid ? 2 : saved.conditionsAcknowledged ? 1 : 0;
    const withAnalysis = initialSnapshot && saved.prediction !== null ? 4 : reachable;
    const withRevision = withAnalysis >= 4 && findingValid && saved.selectedFindingId !== null ? 5 : withAnalysis;
    const withReport = withRevision >= 5 && revisedSnapshot && comparison ? 6 : withRevision;
    const stage = ["briefing", "relations", "schedule", "simulation", "analysis", "revision", "report"][Math.min(requestedStage, withReport)] as MissionAttempt["stage"];
    const safeComplete = Boolean(saved.completed && revisedSnapshot && comparison && Object.values(saved.evidence).every((value) => value.trim()) && revisedSnapshot.evaluation.metrics.safetyMet && revisedSnapshot.evaluation.metrics.qualityMet && !revisedSnapshot.evaluation.violations.some(({ kind }) => kind === "safety" || kind === "quality"));
    attempts[scenario.id] = cloneFreeze({ scenarioId: scenario.id, stage, conditionsAcknowledged: saved.conditionsAcknowledged, relationEdges: saved.relationEdges, draftSchedule, initialSnapshot, prediction: saved.prediction, predictionExplanation: saved.predictionExplanation, selectedFindingId: findingValid ? saved.selectedFindingId : null, revisedSchedule, revisedSnapshot, comparison, evidence: saved.evidence, completed: safeComplete });
  }
  return cloneFreeze({ ...initial, selectedScenarioId: progress.selectedScenarioId, attempts, saveEnabled: true });
}
