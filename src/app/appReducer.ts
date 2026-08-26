import { scenarioCatalog } from "../data/scenarios";
import { getScenario } from "../data/scenarios";
import type { LearningStage, ScheduleDraft, ScenarioId } from "../domain/types";
import { canEnterStage, isScheduleReady } from "./appSelectors";
import type { AppAction, AppState, AttemptSnapshot, LearningEvidence, MissionAttempt } from "./appTypes";

const emptyEvidence: LearningEvidence = {
  dependencyExplanation: "",
  parallelExplanation: "",
  bottleneckExplanation: "",
  tradeoffExplanation: "",
};

const cloneFreeze = <T>(value: T): T => {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return Object.freeze(value.map((item) => cloneFreeze(item))) as T;
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneFreeze(item)]))) as T;
};

const freezeDraft = (draft: ScheduleDraft): ScheduleDraft => cloneFreeze({
  entries: draft.entries.map((entry) => ({ taskId: entry.taskId, plannedStart: entry.plannedStart, roleIds: [...entry.roleIds] })),
  learnerEdges: draft.learnerEdges.map((edge) => ({ beforeTaskId: edge.beforeTaskId, afterTaskId: edge.afterTaskId })),
});

const freezeSnapshot = (snapshot: AttemptSnapshot): AttemptSnapshot => cloneFreeze({
  draft: freezeDraft(snapshot.draft),
  result: snapshot.result,
  bottlenecks: snapshot.bottlenecks,
  evaluation: snapshot.evaluation,
});

const initialAttempt = (scenarioId: MissionAttempt["scenarioId"]): MissionAttempt => cloneFreeze({
  scenarioId,
  stage: "briefing",
  conditionsAcknowledged: false,
  relationEdges: [],
  draftSchedule: { entries: [], learnerEdges: [] },
  initialSnapshot: null,
  prediction: null,
  predictionExplanation: "",
  selectedFindingId: null,
  revisedSchedule: null,
  revisedSnapshot: null,
  comparison: null,
  evidence: emptyEvidence,
  completed: false,
});

export function createInitialState(): AppState {
  const attempts = Object.fromEntries(scenarioCatalog.map(({ id }) => [id, initialAttempt(id)])) as Record<ScenarioId, MissionAttempt>;
  return cloneFreeze({ selectedScenarioId: scenarioCatalog[0]!.id, attempts, saveEnabled: false, announcement: "", updateDialogOpen: false });
}

const currentAttempt = (state: AppState): MissionAttempt => state.attempts[state.selectedScenarioId]!;
const withAttempt = (state: AppState, attempt: MissionAttempt): AppState => ({ ...state, attempts: Object.freeze({ ...state.attempts, [attempt.scenarioId]: attempt }) });
const invalid = (state: AppState, message: string): AppState => ({ ...state, announcement: message });
const stageMessage: Record<LearningStage, string> = {
  briefing: "안내를 확인하세요.",
  relations: "먼저 조건을 확인하고 관계를 설계하세요.",
  schedule: "먼저 필요한 관계를 모두 연결하고 순환 관계를 제거하세요.",
  simulation: "먼저 조건을 확인하고 일정표의 모든 작업을 배치하세요.",
  analysis: "먼저 실행 결과와 기다림 원인을 확인하세요.",
  revision: "먼저 병목 원인을 선택하세요.",
  report: "먼저 수정 결과와 비교를 저장하세요.",
};

const updateDraft = (draft: ScheduleDraft, updates: Partial<ScheduleDraft>): ScheduleDraft => freezeDraft({ ...draft, ...updates });
const sameDraft = (left: unknown, right: ScheduleDraft): boolean => {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
};

export function appReducer(state: AppState, action: AppAction): AppState {
  if (action.type === "SELECT_SCENARIO") {
    if (!state.attempts[action.scenarioId]) return invalid(state, "알 수 없는 시나리오입니다.");
    return cloneFreeze({ ...state, selectedScenarioId: action.scenarioId, announcement: "" });
  }
  if (action.type === "SET_SAVE_ENABLED") return cloneFreeze({ ...state, saveEnabled: action.enabled });
  if (action.type === "OPEN_UPDATE_DIALOG") return cloneFreeze({ ...state, updateDialogOpen: true });
  if (action.type === "CLOSE_UPDATE_DIALOG") return cloneFreeze({ ...state, updateDialogOpen: false });
  if (action.type === "ANNOUNCE") return cloneFreeze({ ...state, announcement: action.message });

  const attempt = currentAttempt(state);
  switch (action.type) {
    case "ENTER_STAGE":
      return canEnterStage(attempt, action.stage) ? withAttempt({ ...state, announcement: "" }, Object.freeze({ ...attempt, stage: action.stage })) : invalid(state, stageMessage[action.stage]);
    case "ACKNOWLEDGE_CONDITIONS":
      if (attempt.stage !== "briefing") return invalid(state, "조건 확인은 안내 단계에서 할 수 있습니다.");
      return withAttempt(state, Object.freeze({ ...attempt, conditionsAcknowledged: true }));
    case "SET_RELATIONS":
      if (attempt.stage !== "relations") return invalid(state, "관계 설계 단계에서 관계를 연결하세요.");
      if (attempt.initialSnapshot) return invalid(state, "최초 실행 결과가 저장되어 관계를 수정할 수 없습니다.");
      {
        const edges = cloneFreeze(action.edges);
        return withAttempt(state, Object.freeze({ ...attempt, relationEdges: edges, draftSchedule: updateDraft(attempt.draftSchedule, { learnerEdges: edges }), completed: false }));
      }
    case "SET_DRAFT_SCHEDULE":
      if (attempt.stage !== "schedule" && attempt.stage !== "revision") return invalid(state, "일정표 단계에서 작업을 배치하세요.");
      if (attempt.stage === "revision") return withAttempt(state, Object.freeze({ ...attempt, revisedSchedule: freezeDraft(action.draft), revisedSnapshot: null, comparison: null, completed: false }));
      if (attempt.initialSnapshot) return invalid(state, "최초 실행 결과가 저장되어 일정을 수정할 수 없습니다.");
      return withAttempt(state, Object.freeze({ ...attempt, draftSchedule: freezeDraft(action.draft), completed: false }));
    case "SAVE_INITIAL_SNAPSHOT":
      if (attempt.initialSnapshot) return state;
      if (attempt.stage !== "simulation" && attempt.stage !== "schedule") return invalid(state, "먼저 가상 실행 단계로 이동하세요.");
      if (attempt.stage === "schedule") {
        const scenario = getScenario(attempt.scenarioId);
        if (!isScheduleReady(scenario, attempt.draftSchedule) || !sameDraft(action.snapshot?.draft, attempt.draftSchedule)) {
          return invalid(state, "완전한 현재 일정만 최초 실행 결과로 저장할 수 있습니다.");
        }
      }
      return withAttempt(state, Object.freeze({ ...attempt, initialSnapshot: freezeSnapshot(action.snapshot), completed: false }));
    case "SET_PREDICTION":
      if (attempt.stage !== "simulation") return invalid(state, "실행 중에 기다림 원인을 예측하세요.");
      return withAttempt(state, Object.freeze({ ...attempt, prediction: action.reason, predictionExplanation: action.explanation, completed: false }));
    case "SELECT_BOTTLENECK":
      if (attempt.stage !== "analysis" || !(attempt.initialSnapshot?.bottlenecks.findings ?? []).some(({ id }) => id === action.findingId)) return invalid(state, "먼저 분석 결과에 표시된 병목 원인을 선택하세요.");
      return withAttempt(state, Object.freeze({ ...attempt, selectedFindingId: action.findingId, completed: false }));
    case "BEGIN_REVISION":
      if (attempt.stage !== "analysis" || !attempt.selectedFindingId) return invalid(state, "먼저 병목 원인을 선택하세요.");
      return withAttempt(state, Object.freeze({ ...attempt, stage: "revision", revisedSchedule: freezeDraft(attempt.draftSchedule), revisedSnapshot: null, comparison: null, completed: false }));
    case "SET_REVISED_SCHEDULE":
      if (attempt.stage !== "revision") return invalid(state, "수정 단계에서 새 일정을 배치하세요.");
      return withAttempt(state, Object.freeze({ ...attempt, revisedSchedule: freezeDraft(action.draft), revisedSnapshot: null, comparison: null, completed: false }));
    case "SAVE_REVISED_SNAPSHOT":
      if (attempt.stage !== "revision" || !attempt.revisedSchedule || !attempt.selectedFindingId) return invalid(state, "먼저 수정 일정을 준비하세요.");
      return withAttempt(state, Object.freeze({ ...attempt, revisedSnapshot: freezeSnapshot(action.snapshot), comparison: cloneFreeze(action.comparison), completed: false }));
    case "SET_EVIDENCE_FIELD":
      if (attempt.stage !== "report") return invalid(state, "보고서 단계에서 근거를 작성하세요.");
      if (!(action.field in emptyEvidence)) return invalid(state, "알 수 없는 근거 항목입니다.");
      return withAttempt(state, Object.freeze({ ...attempt, evidence: Object.freeze({ ...attempt.evidence, [action.field]: action.value }), completed: false }));
    case "COMPLETE_MISSION": {
      const evidenceReady = Object.values(attempt.evidence).every((value) => value.trim().length > 0);
      const evaluation = attempt.revisedSnapshot?.evaluation;
      const safe = Boolean(evaluation && evaluation.metrics.safetyMet && evaluation.metrics.qualityMet && !evaluation.violations.some(({ kind }) => kind === "safety" || kind === "quality"));
      if (attempt.stage !== "report" || !attempt.revisedSnapshot || !attempt.comparison || !evidenceReady || !safe) return invalid(state, "수정 결과의 안전·품질 조건과 네 가지 근거를 모두 확인하세요.");
      return withAttempt(state, Object.freeze({ ...attempt, completed: true }));
    }
    default:
      return state;
  }
}
