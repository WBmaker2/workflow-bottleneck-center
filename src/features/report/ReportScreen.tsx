import { useRef, useState, type RefObject } from "react";
import type { MissionAttempt } from "../../app/appTypes";
import type { ScenarioDefinition } from "../../domain/types";
import { isEvidenceComplete } from "../../domain/teacherSummary";
import { isSuccessfulEvaluation } from "../../domain/evaluator";
import { AttemptComparisonTable } from "../revision/AttemptComparisonTable";
import { EvidenceForm, type EvidenceFormHandle } from "./EvidenceForm";
import { ReportLearningWrapUp } from "./ReportLearningWrapUp";
import { TeacherSummaryView } from "./TeacherSummaryView";
import { LiveStatus } from "../../components/LiveStatus";

export interface ReportScreenProps {
  scenario: ScenarioDefinition;
  attempt: MissionAttempt;
  saveEnabled?: boolean;
  onEvidenceChange(field: keyof MissionAttempt["evidence"], value: string): void;
  onComplete(): void;
  onClearSavedProgress?(): void;
  clearTriggerRef?: RefObject<HTMLButtonElement | null>;
}

const titleFor = (scenario: ScenarioDefinition, taskId: string) => scenario.tasks.find((task) => task.id === taskId)?.title ?? taskId;
const scheduleText = (scenario: ScenarioDefinition, snapshot: NonNullable<MissionAttempt["initialSnapshot"]>) => snapshot.result.runs
  .slice().sort((left, right) => left.actualStart - right.actualStart || left.taskId.localeCompare(right.taskId))
  .map((run) => `${run.actualStart}단위: ${titleFor(scenario, run.taskId)} (${run.end - run.actualStart}단위)`).join(" · ");
const evaluationReady = (attempt: MissionAttempt) => Boolean(attempt.revisedSnapshot && isSuccessfulEvaluation(attempt.revisedSnapshot.evaluation));

export function ReportScreen({ scenario, attempt, saveEnabled = false, onEvidenceChange, onComplete, onClearSavedProgress, clearTriggerRef }: ReportScreenProps) {
  const formRef = useRef<EvidenceFormHandle>(null);
  const [message, setMessage] = useState("");
  const complete = () => {
    const evidenceReady = formRef.current?.validateAndFocus() ?? isEvidenceComplete(attempt.evidence);
    if (!evidenceReady) {
      return;
    }
    if (!evaluationReady(attempt)) {
      setMessage("수정 결과의 안전·품질·역할 공정성·목표 시간을 먼저 확인하세요.");
      return;
    }
    onComplete();
    setMessage("개선 보고서를 완성했습니다.");
  };
  const finding = attempt.initialSnapshot?.bottlenecks.findings.find(({ id }) => id === attempt.selectedFindingId);
  const initial = attempt.initialSnapshot;
  const revised = attempt.revisedSnapshot;
  const comparison = attempt.comparison;
  return <section className="report-screen" aria-labelledby="report-screen-title">
    <div className="report-interactive no-print" data-testid="report-interactive">
      <h2 id="report-screen-title">개선 보고서</h2>
      <p>처음 일정과 수정 일정을 비교하고, 근거를 문장으로 남겨 보세요.</p>
      {attempt.completed && <p className="report-complete">개선 보고서가 완성되었습니다.</p>}
      <section aria-labelledby="report-relationship-title"><h3 id="report-relationship-title">선행 관계 지도와 설명</h3><p>색과 선은 보조 표시이며, 아래 텍스트가 관계의 정확한 설명입니다.</p><ol>{attempt.relationEdges.map((edge) => <li key={`${edge.beforeTaskId}-${edge.afterTaskId}`}>{titleFor(scenario, edge.beforeTaskId)} 다음에 {titleFor(scenario, edge.afterTaskId)}를 시작합니다.</li>)}</ol>{attempt.relationEdges.length === 0 && <p>연결한 선행 관계가 없습니다.</p>}</section>
      {initial && <section aria-labelledby="report-initial-schedule-title"><h3 id="report-initial-schedule-title">최초 일정</h3><p>{scheduleText(scenario, initial) || "실행 기록이 없습니다."}</p><p>전체 시간 {initial.evaluation.metrics.finishTime}단위 · 대기 {initial.evaluation.metrics.totalWaitUnits}단위</p></section>}
      {revised && <section aria-labelledby="report-revised-schedule-title"><h3 id="report-revised-schedule-title">수정 일정</h3><p>{scheduleText(scenario, revised) || "실행 기록이 없습니다."}</p><p>전체 시간 {revised.evaluation.metrics.finishTime}단위 · 대기 {revised.evaluation.metrics.totalWaitUnits}단위</p></section>}
      {initial && revised && comparison && <AttemptComparisonTable initial={initial} revised={revised} comparison={comparison} />}
      <section aria-labelledby="report-bottleneck-title"><h3 id="report-bottleneck-title">선택한 병목</h3>{finding ? <p>{finding.blockerLabel} 때문에 {titleFor(scenario, finding.blockedTaskId)} 작업이 {finding.delayUnits}단위 늦어졌습니다. {finding.explanation}</p> : <p>이번 실행에서 선택한 병목이 없습니다. 기록된 기다림이 없는 흐름일 수 있습니다.</p>}</section>
      <EvidenceForm ref={formRef} scenario={scenario} attempt={attempt} onChange={onEvidenceChange} />
      <ReportLearningWrapUp scenario={scenario} comparison={comparison} selectedFinding={finding ?? null} />
      <p className="report-disclaimer">이 결과는 교육용 가상 모델이며 실제 사람의 생산성 평가에 사용할 수 없습니다.</p>
      <LiveStatus message={message} />
      <button type="button" className="no-print" onClick={complete} disabled={attempt.completed}>개선 보고서 완성</button>
      {onClearSavedProgress && <button ref={clearTriggerRef} type="button" className="no-print" aria-disabled={!saveEnabled} onClick={() => { if (saveEnabled) onClearSavedProgress(); }}>저장된 진행 지우기</button>}
    </div>
    <TeacherSummaryView scenario={scenario} attempt={attempt} />
  </section>;
}
