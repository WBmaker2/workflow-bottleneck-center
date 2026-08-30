import { useState } from "react";
import type { AttemptSnapshot } from "../../app/appTypes";
import { LiveStatus } from "../../components/LiveStatus";
import { RequiredActionButton } from "../../components/RequiredActionButton";
import { compareAttempts } from "../../domain/comparison";
import { evaluateSchedule, isSuccessfulEvaluation } from "../../domain/evaluator";
import { analyzeBottlenecks } from "../../domain/bottleneckAnalyzer";
import { isScheduleReady } from "../../app/appSelectors";
import { simulateSchedule } from "../../domain/simulator";
import type { AttemptComparison, ScenarioDefinition, ScheduleDraft } from "../../domain/types";
import { ScheduleEditor } from "../schedule/ScheduleEditor";
import { AttemptComparisonTable } from "./AttemptComparisonTable";

export interface RevisionScreenProps {
  scenario: ScenarioDefinition;
  initialSnapshot: AttemptSnapshot;
  revisedSchedule: ScheduleDraft | null;
  revisedSnapshot: AttemptSnapshot | null;
  comparison: AttemptComparison | null;
  onChange(draft: ScheduleDraft): void;
  onCompare(snapshot: AttemptSnapshot, comparison: AttemptComparison): void;
  onReport(): void;
}

const snapshotFor = (scenario: ScenarioDefinition, draft: ScheduleDraft): AttemptSnapshot => {
  const result = simulateSchedule(scenario, draft);
  return { draft: { entries: draft.entries.map((entry) => ({ ...entry, roleIds: [...entry.roleIds] })), learnerEdges: draft.learnerEdges.map((edge) => ({ ...edge })) }, result, bottlenecks: analyzeBottlenecks(scenario, result), evaluation: evaluateSchedule(scenario, result) };
};

const failureMessages = (snapshot: AttemptSnapshot): readonly string[] => {
  const { evaluation } = snapshot;
  const lost = evaluation.violations.filter(({ kind }) => kind === "structure" || kind === "safety" || kind === "quality" || kind === "fairness" || kind === "time");
  if (lost.length === 0 && isSuccessfulEvaluation(evaluation)) return [];
  const messages = evaluation.feedback.length > 0 ? evaluation.feedback : lost.map(({ message }) => message);
  return messages.length > 0 ? messages : ["수정 결과가 성공 상태가 아닙니다."];
};

export function RevisionScreen({ scenario, initialSnapshot, revisedSchedule, revisedSnapshot, comparison, onChange, onCompare, onReport }: RevisionScreenProps) {
  const [message, setMessage] = useState("");
  const draft = revisedSchedule ?? initialSnapshot.draft;
  const ready = isScheduleReady(scenario, draft);
  const failures = revisedSnapshot ? failureMessages(revisedSnapshot) : [];
  const canCompare = draft.entries.length > 0;
  const compare = () => {
    if (!canCompare) {
      setMessage("수정 일정에 작업을 하나 이상 배치하세요.");
      return;
    }
    const revised = snapshotFor(scenario, draft);
    onCompare(revised, compareAttempts(scenario, initialSnapshot.draft, initialSnapshot.evaluation, draft, revised.evaluation));
    setMessage("수정안 실행 기록과 최초 일정을 비교했습니다.");
  };
  return (
    <section className="revision-screen" aria-labelledby="revision-screen-title">
      <h2 id="revision-screen-title">일정 수정</h2>
      <p>선택한 병목을 줄이되 안전·품질·역할 조건을 함께 지키는 수정안을 만들어 보세요.</p>
      <section className="revision-observation-card" aria-labelledby="revision-observation-title">
        <h3 id="revision-observation-title">수정 전 관찰</h3>
        <p>바꿀 작업을 고르고, 시간 변화와 안전·품질·역할 공정성을 함께 확인합니다.</p>
        <p><strong>최초 시간</strong> {initialSnapshot.evaluation.metrics.finishTime}단위 · <strong>최초 대기</strong> {initialSnapshot.evaluation.metrics.totalWaitUnits}단위</p>
      </section>
      <ScheduleEditor scenario={scenario} draft={draft} onChange={onChange} showPlacementStatus={false} />
      <LiveStatus message={message} />
      <RequiredActionButton actionId="compare-revision" activeActionId={canCompare && comparison === null ? "compare-revision" : null} disabled={!canCompare} onClick={compare}>수정안 실행·비교</RequiredActionButton>
      {revisedSnapshot && comparison && (
        <>
          {failures.length > 0 && <section className="revision-failure" role="alert" aria-labelledby="revision-failure-title"><h3 id="revision-failure-title">완료 조건을 먼저 확인하세요</h3><p>완료 조건이 충족되지 않았습니다.</p><ul>{failures.map((failure) => <li key={failure}>{failure}</li>)}</ul></section>}
          {failures.length === 0 && <p className="revision-summary">{comparison.summary}</p>}
          <AttemptComparisonTable initial={initialSnapshot} revised={revisedSnapshot} comparison={comparison} />
          <p className="revision-comparison-note" role="status">비교 카드에서 시간뿐 아니라 안전·품질·역할 조건의 보존 상태를 확인하세요.</p>
          {failures.length === 0 && <button type="button" onClick={onReport}>보고서 작성</button>}
        </>
      )}
      {!ready && <p>비교하려면 모든 작업을 빠짐없이 배치하고 역할 수와 시작 시점을 맞추세요.</p>}
    </section>
  );
}
