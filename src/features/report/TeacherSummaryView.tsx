import { buildTeacherSummary } from "../../domain/teacherSummary";
import type { MissionAttempt } from "../../app/appTypes";
import type { ScenarioDefinition } from "../../domain/types";

export interface TeacherSummaryViewProps {
  scenario: ScenarioDefinition;
  attempt: MissionAttempt;
}
export function TeacherSummaryView({ scenario, attempt }: TeacherSummaryViewProps) {
  let summary;
  try {
    summary = buildTeacherSummary(scenario, attempt);
  } catch {
    return <section className="teacher-summary" aria-labelledby="teacher-summary-title"><h3 id="teacher-summary-title">교사용 요약</h3><p>수정 일정 비교가 저장되면 요약을 표시합니다.</p></section>;
  }
  return <section className="teacher-summary teacher-summary--printable" aria-labelledby="teacher-summary-title">
    <h3 id="teacher-summary-title">교사용 요약</h3>
    <p className="teacher-summary-scenario">{summary.scenarioTitle}</p>
    <dl>
      <div><dt>최초 일정</dt><dd>{summary.initialMetrics.finishTime}단위 · 대기 {summary.initialMetrics.totalWaitUnits}단위</dd></div>
      <div><dt>수정 일정</dt><dd>{summary.revisedMetrics.finishTime}단위 · 대기 {summary.revisedMetrics.totalWaitUnits}단위</dd></div>
    </dl>
    <ul>{summary.conditionSummary.map((condition) => <li key={condition}>{condition}</li>)}</ul>
    <section aria-labelledby="teacher-summary-evidence-title"><h4 id="teacher-summary-evidence-title">학습 근거</h4><ul>{Object.values(summary.explanations).map((explanation) => <li key={explanation}>{explanation}</li>)}</ul></section>
    <p className="teacher-summary-disclaimer">{summary.disclaimer}</p>
    <button type="button" className="print-summary-button no-print" onClick={() => window.print()}>교사용 요약 인쇄</button>
  </section>;
}
