import { useState } from "react";
import { getRequiredAction, isScheduleReady } from "../../app/appSelectors";
import { RequiredActionButton } from "../../components/RequiredActionButton";
import { LiveStatus } from "../../components/LiveStatus";
import { analyzeBottlenecks } from "../../domain/bottleneckAnalyzer";
import { evaluateSchedule } from "../../domain/evaluator";
import { normalizeScheduleRoleIds } from "../../domain/scheduleBounds";
import { simulateSchedule } from "../../domain/simulator";
import type { AttemptSnapshot, MissionAttempt } from "../../app/appTypes";
import type { ScheduleDraft, ScenarioDefinition } from "../../domain/types";
import { ScheduleEditor } from "./ScheduleEditor";

export interface ScheduleScreenAttempt {
  stage: MissionAttempt["stage"];
  draftSchedule: ScheduleDraft;
  revisedSchedule?: ScheduleDraft | null;
  initialSnapshot?: AttemptSnapshot | null;
}

export interface ScheduleScreenProps {
  scenario: ScenarioDefinition;
  attempt: ScheduleScreenAttempt;
  onChange(draft: ScheduleDraft): void;
  onRun(snapshot?: AttemptSnapshot): void;
  onMove?(taskId: string, plannedStart: number): void;
}

const emptyDraft: ScheduleDraft = { entries: [], learnerEdges: [] };

const snapshotFor = (scenario: ScenarioDefinition, draft: ScheduleDraft): AttemptSnapshot => {
  const result = simulateSchedule(scenario, draft);
  return {
    draft: { entries: draft.entries.map((entry) => ({ ...entry, roleIds: normalizeScheduleRoleIds(scenario, entry.roleIds) })), learnerEdges: draft.learnerEdges.map((edge) => ({ ...edge })) },
    result,
    bottlenecks: analyzeBottlenecks(scenario, result),
    evaluation: evaluateSchedule(scenario, result),
  };
};

export function ScheduleScreen({ scenario, attempt, onChange, onRun, onMove }: ScheduleScreenProps) {
  const [message, setMessage] = useState("");
  const draft = attempt.stage === "revision" ? attempt.revisedSchedule ?? attempt.draftSchedule : attempt.draftSchedule;
  const ready = isScheduleReady(scenario, draft);
  const actionId = attempt.stage === "revision" ? "compare-revision" : "run-simulation";
  const actionLabel = attempt.stage === "revision" ? "수정안 실행·비교" : "실행";
  const activeActionId = getRequiredAction({ ...attempt, draftSchedule: draft } as MissionAttempt);
  const run = () => {
    if (!ready) {
      setMessage("모든 작업을 한 번씩 배치하고 공개된 관계·역할 조건을 확인하세요.");
      return;
    }
    const snapshot = snapshotFor(scenario, draft);
    onRun(snapshot);
  };

  return (
    <section className="schedule-screen" aria-labelledby="schedule-screen-title">
      <h2 id="schedule-screen-title">일정표</h2>
      <p>작업을 선택하고 시작 시점과 필요한 역할을 정해 배치하세요. 필요한 도구는 작업 카드에서 정해져 있습니다.</p>
      <p className="schedule-goal">목표 시간: {scenario.timeGoal}단위 · 모든 시간은 교육용 가상 시간입니다.</p>
      <ScheduleEditor scenario={scenario} draft={draft ?? emptyDraft} onChange={onChange} {...(onMove ? { onMove } : {})} />
      <LiveStatus message={message} />
      <RequiredActionButton actionId={actionId} activeActionId={activeActionId} disabled={!ready} onClick={run}>{actionLabel}</RequiredActionButton>
      {!ready && <p>실행하려면 모든 작업을 빠짐없이 배치하고 역할 수와 시작 시점을 맞추세요.</p>}
    </section>
  );
}
