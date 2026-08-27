import { useState } from "react";
import type { AttemptSnapshot } from "../../app/appTypes";
import { LiveStatus } from "../../components/LiveStatus";
import { RequiredActionButton } from "../../components/RequiredActionButton";
import { compareAttempts } from "../../domain/comparison";
import { evaluateSchedule } from "../../domain/evaluator";
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
  const lost = evaluation.violations.filter(({ kind }) => kind === "safety" || kind === "quality" || kind === "fairness");
  if (lost.length === 0) return [];
  const messages = evaluation.feedback.filter((message) => message.includes("완료 조건이 충족되지 않았습니다") || message.includes("공정성 조건이 충족되지 않았습니다"));
  return messages.length > 0 ? messages : lost.map(({ message }) => message);
};

export function RevisionScreen({ scenario, initialSnapshot, revisedSchedule, revisedSnapshot, comparison, onChange, onCompare, onReport }: RevisionScreenProps) {
  const [message, setMessage] = useState("");
  const draft = revisedSchedule ?? initialSnapshot.draft;
  const ready = isScheduleReady(scenario, draft);
  const failures = revisedSnapshot ? failureMessages(revisedSnapshot) : [];
  const compare = () => {
    if (!ready) {
      setMessage("모든 작업을 한 번씩 배치하고 공개된 관계·역할 조건을 확인하세요.");
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
      <ScheduleEditor scenario={scenario} draft={draft} onChange={onChange} showPlacementStatus={false} />
      <LiveStatus message={message} />
      <RequiredActionButton actionId="compare-revision" activeActionId={ready && comparison === null ? "compare-revision" : null} disabled={!ready} onClick={compare}>수정안 실행·비교</RequiredActionButton>
      {revisedSnapshot && comparison && (
        <>
          {failures.length > 0 && <section className="revision-failure" role="alert" aria-labelledby="revision-failure-title"><h3 id="revision-failure-title">완료 조건을 먼저 확인하세요</h3><p>완료 조건이 충족되지 않았습니다.</p><ul>{failures.map((failure) => <li key={failure}>{failure}</li>)}</ul></section>}
          {failures.length === 0 && <p className="revision-summary">{comparison.summary}</p>}
          <AttemptComparisonTable initial={initialSnapshot} revised={revisedSnapshot} comparison={comparison} />
          <button type="button" onClick={onReport}>보고서 작성</button>
        </>
      )}
      {!ready && <p>비교하려면 모든 작업을 빠짐없이 배치하고 역할 수와 시작 시점을 맞추세요.</p>}
    </section>
  );
}
