import type {
  AttemptComparison,
  BottleneckAnalysis,
  DependencyEdge,
  LearningStage,
  ScenarioId,
  ScheduleDraft,
  ScheduleEvaluation,
  SimulationResult,
  WaitReason,
} from "../domain/types";

export type { AttemptComparison, BottleneckAnalysis, DependencyEdge, LearningStage, ScenarioId, ScheduleDraft, ScheduleEvaluation, SimulationResult, WaitReason };

export interface LearningEvidence {
  dependencyExplanation: string;
  parallelExplanation: string;
  bottleneckExplanation: string;
  tradeoffExplanation: string;
}

export interface AttemptSnapshot {
  draft: ScheduleDraft;
  result: SimulationResult;
  bottlenecks: BottleneckAnalysis;
  evaluation: ScheduleEvaluation;
}

export interface MissionAttempt {
  scenarioId: ScenarioId;
  stage: LearningStage;
  conditionsAcknowledged: boolean;
  relationEdges: readonly DependencyEdge[];
  draftSchedule: ScheduleDraft;
  initialSnapshot: AttemptSnapshot | null;
  prediction: WaitReason | null;
  predictionExplanation: string;
  selectedFindingId: string | null;
  revisedSchedule: ScheduleDraft | null;
  revisedSnapshot: AttemptSnapshot | null;
  comparison: AttemptComparison | null;
  evidence: LearningEvidence;
  completed: boolean;
}

export interface AppState {
  selectedScenarioId: ScenarioId;
  attempts: Readonly<Record<ScenarioId, MissionAttempt>>;
  saveEnabled: boolean;
  announcement: string;
  updateDialogOpen: boolean;
}

export type AppAction =
  | { type: "SELECT_SCENARIO"; scenarioId: ScenarioId }
  | { type: "ACKNOWLEDGE_CONDITIONS" }
  | { type: "SET_RELATIONS"; edges: readonly DependencyEdge[] }
  | { type: "SET_DRAFT_SCHEDULE"; draft: ScheduleDraft }
  | { type: "SAVE_INITIAL_SNAPSHOT"; snapshot: AttemptSnapshot }
  | { type: "SET_PREDICTION"; reason: WaitReason; explanation: string }
  | { type: "SELECT_BOTTLENECK"; findingId: string }
  | { type: "BEGIN_REVISION" }
  | { type: "SET_REVISED_SCHEDULE"; draft: ScheduleDraft }
  | { type: "SAVE_REVISED_SNAPSHOT"; snapshot: AttemptSnapshot; comparison: AttemptComparison }
  | { type: "SET_EVIDENCE_FIELD"; field: keyof LearningEvidence; value: string }
  | { type: "COMPLETE_MISSION" }
  | { type: "ENTER_STAGE"; stage: LearningStage }
  | { type: "SET_SAVE_ENABLED"; enabled: boolean }
  | { type: "OPEN_UPDATE_DIALOG" }
  | { type: "CLOSE_UPDATE_DIALOG" }
  | { type: "ANNOUNCE"; message: string };

export interface PersistedMissionAttempt {
  scenarioId: ScenarioId;
  stage: LearningStage;
  conditionsAcknowledged: boolean;
  relationEdges: readonly DependencyEdge[];
  draftSchedule: ScheduleDraft;
  prediction: WaitReason | null;
  predictionExplanation: string;
  selectedFindingId: string | null;
  revisedSchedule: ScheduleDraft | null;
  evidence: LearningEvidence;
  completed: boolean;
}

export interface AppProgressV1 {
  version: 1;
  selectedScenarioId: ScenarioId;
  saveEnabled: true;
  attempts: Readonly<Record<ScenarioId, PersistedMissionAttempt>>;
}
