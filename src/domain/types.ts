export type ScenarioId =
  | "science-display"
  | "library-cart"
  | "class-presentation"
  | "eco-campaign-booth";

export type ConditionKind = "workflow" | "safety" | "quality";
export type WaitReason = "dependency" | "resource" | "role" | "solo";
export type LearningStage =
  | "briefing"
  | "relations"
  | "schedule"
  | "simulation"
  | "analysis"
  | "revision"
  | "report";

export interface DependencyRequirement {
  taskId: string;
  kind: ConditionKind;
  reason: string;
}

export interface VisibleCondition {
  id: string;
  kind: "safety" | "quality";
  label: string;
}

export interface ResourceRequirement {
  resourceId: string;
  quantity: 1 | 2;
}

export interface TaskDefinition {
  id: string;
  title: string;
  duration: number;
  prerequisites: readonly DependencyRequirement[];
  peopleRequired: 1 | 2 | 3;
  resources: readonly ResourceRequirement[];
  parallel: "allowed" | "solo";
  conditions: readonly VisibleCondition[];
  evidenceKinds: readonly ConditionKind[];
  unlocks: readonly string[];
}

export interface ScenarioDefinition {
  id: ScenarioId;
  title: string;
  mission: string;
  timeGoal: number;
  roles: readonly { id: "A" | "B" | "C"; label: string }[];
  resources: readonly { id: string; label: string; capacity: 1 | 2 }[];
  fairness: { minParticipatingRoles: 2 | 3; maxLoadGap: number };
  tasks: readonly TaskDefinition[];
  disclaimer: string;
  teacherFocus: string;
}

export interface DependencyEdge {
  beforeTaskId: string;
  afterTaskId: string;
}

export interface ScheduleEntry {
  taskId: string;
  plannedStart: number;
  roleIds: readonly ("A" | "B" | "C")[];
}

export interface ScheduleDraft {
  entries: readonly ScheduleEntry[];
  learnerEdges: readonly DependencyEdge[];
}

export interface RelationValidation {
  status: "invalid" | "valid-with-extra" | "valid";
  missingRequired: readonly DependencyEdge[];
  unnecessary: readonly DependencyEdge[];
  duplicate: readonly DependencyEdge[];
  unknown: readonly DependencyEdge[];
  cycleTaskIds: readonly string[];
}

export interface WaitInterval {
  taskId: string;
  from: number;
  to: number;
  reason: WaitReason;
  blockerTaskId?: string;
  resourceId?: string;
  roleId?: "A" | "B" | "C";
}

export interface TaskRun {
  taskId: string;
  plannedStart: number;
  actualStart: number;
  end: number;
  roleIds: readonly ("A" | "B" | "C")[];
}

export interface SimulationResult {
  runs: readonly TaskRun[];
  waits: readonly WaitInterval[];
  finishTime: number;
  omittedTaskIds: readonly string[];
  blockedTaskIds: readonly string[];
  issues: readonly { code: string; taskId?: string; message: string }[];
}

export interface BottleneckFinding {
  id: string;
  type: "dependency-path" | "resource-wait" | "role-wait" | "solo-wait";
  blockedTaskId: string;
  blockerLabel: string;
  delayUnits: number;
  affectedTaskIds: readonly string[];
  explanation: string;
}

export interface BottleneckAnalysis {
  criticalTaskIds: readonly string[];
  findings: readonly BottleneckFinding[];
  totalWaitUnits: number;
}

export interface ScheduleMetrics {
  finishTime: number;
  totalWaitUnits: number;
  roleLoadUnits: Readonly<Record<"A" | "B" | "C", number>>;
  safetyMet: boolean;
  qualityMet: boolean;
  fairnessMet: boolean;
  timeGoalMet: boolean;
}

export interface ScheduleEvaluation {
  status: "incomplete" | "revise" | "successful";
  metrics: ScheduleMetrics;
  violations: readonly { kind: "safety" | "quality" | "fairness" | "time" | "structure"; message: string }[];
  feedback: readonly string[];
}

export interface AttemptComparison {
  finishDelta: number;
  waitDelta: number;
  changedTaskIds: readonly string[];
  preserved: { safety: boolean; quality: boolean; fairness: boolean };
  summary: string;
}
