import { scenarioCatalog } from "../data/scenarios";
import { analyzeBottlenecks } from "../domain/bottleneckAnalyzer";
import { compareAttempts } from "../domain/comparison";
import { evaluateSchedule } from "../domain/evaluator";
import { simulateSchedule } from "../domain/simulator";
import type { DependencyEdge, ScheduleDraft, ScenarioDefinition, ScenarioId } from "../domain/types";
import { createInitialState } from "../app/appReducer";
import type { AppProgressV1, AppState, LearningEvidence, MissionAttempt, PersistedMissionAttempt, AttemptSnapshot } from "../app/appTypes";

const scenarioIds: ReadonlySet<string> = new Set(scenarioCatalog.map(({ id }) => id));
const stages = new Set(["briefing", "relations", "schedule", "simulation", "analysis", "revision", "report"]);
const reasons = new Set(["dependency", "resource", "role", "solo"]);
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isSafeStart = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isScenarioId = (value: unknown): value is ScenarioId => isString(value) && scenarioIds.has(value);

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
    if (!isRecord(item) || !isString(item.taskId) || !taskIds.has(item.taskId) || !isSafeStart(item.plannedStart) || !Array.isArray(item.roleIds) || item.roleIds.some((id) => !isString(id) || !roleIds.has(id))) return null;
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

export function rehydrateProgress(progress: AppProgressV1): AppState {
  const initial = createInitialState();
  const attempts = { ...initial.attempts };
  for (const scenario of scenarioCatalog) {
    const saved = progress.attempts[scenario.id];
    if (!saved) continue;
    const draftSchedule = { ...saved.draftSchedule, learnerEdges: saved.relationEdges };
    const initialSnapshot = stageIndex(saved.stage) >= 4 ? snapshotFor(scenario, draftSchedule) : null;
    const revisedSchedule = saved.revisedSchedule ? { ...saved.revisedSchedule, learnerEdges: saved.relationEdges } : null;
    const revisedSnapshot = revisedSchedule && initialSnapshot ? snapshotFor(scenario, revisedSchedule) : null;
    const comparison = revisedSchedule && initialSnapshot && revisedSnapshot ? compareAttempts(scenario, draftSchedule, initialSnapshot.evaluation, revisedSchedule, revisedSnapshot.evaluation) : null;
    const highest = revisedSnapshot && comparison ? 6 : initialSnapshot ? 4 : saved.conditionsAcknowledged ? 1 : 0;
    const stage = ["briefing", "relations", "schedule", "simulation", "analysis", "revision", "report"][Math.min(stageIndex(saved.stage), highest)] as MissionAttempt["stage"];
    const safeComplete = Boolean(saved.completed && revisedSnapshot && comparison && Object.values(saved.evidence).every((value) => value.trim()) && revisedSnapshot.evaluation.metrics.safetyMet && revisedSnapshot.evaluation.metrics.qualityMet && !revisedSnapshot.evaluation.violations.some(({ kind }) => kind === "safety" || kind === "quality"));
    attempts[scenario.id] = { scenarioId: scenario.id, stage, conditionsAcknowledged: saved.conditionsAcknowledged, relationEdges: saved.relationEdges, draftSchedule, initialSnapshot, prediction: saved.prediction, predictionExplanation: saved.predictionExplanation, selectedFindingId: saved.selectedFindingId, revisedSchedule, revisedSnapshot, comparison, evidence: saved.evidence, completed: safeComplete };
  }
  return { ...initial, selectedScenarioId: progress.selectedScenarioId, attempts, saveEnabled: true };
}
