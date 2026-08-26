import type { BottleneckAnalysis, ScenarioDefinition } from "../../domain/types";

export interface BottleneckPanelProps {
  analysis: BottleneckAnalysis;
  selectedFindingId: string | null;
  onSelect(id: string): void;
  scenario?: ScenarioDefinition;
}

const typeLabel: Record<BottleneckAnalysis["findings"][number]["type"], string> = {
  "dependency-path": "선행 관계 대기",
  "resource-wait": "공유 도구 대기",
  "role-wait": "역할 대기",
  "solo-wait": "혼자 하는 작업 대기",
};

export function BottleneckPanel({ analysis, selectedFindingId, onSelect, scenario }: BottleneckPanelProps) {
  if (analysis.findings.length === 0) {
    return <p className="bottleneck-empty">이번 실행에서는 기록된 기다림이 없습니다.</p>;
  }

  return (
    <section className="bottleneck-panel" aria-labelledby="bottleneck-panel-title">
      <h3 id="bottleneck-panel-title">기다림에서 병목 찾기</h3>
      <p>긴 작업이라고 모두 병목은 아닙니다.</p>
      <p>뒤 작업의 시작을 늦춘 원인을 고르세요.</p>
      <div className="bottleneck-cards" role="radiogroup" aria-label="병목 원인 선택">
        {analysis.findings.map((finding, index) => {
          const titleFor = (taskId: string) => scenario?.tasks.find((task) => task.id === taskId)?.title ?? "해당 작업";
          const blocked = titleFor(finding.blockedTaskId);
          const affected = finding.affectedTaskIds.length > 0 ? finding.affectedTaskIds.map(titleFor).join(" → ") : "없음";
          const path = [finding.blockerLabel, blocked, ...finding.affectedTaskIds.map(titleFor)].join(" → ");
          return (
            <label className={`bottleneck-card bottleneck-card--${finding.type}`} key={finding.id}>
              <input
                type="radio"
                name="bottleneck-finding"
                value={finding.id}
                checked={selectedFindingId === finding.id}
                onChange={() => onSelect(finding.id)}
                aria-label={`${finding.blockerLabel}를 ${finding.delayUnits}단위 기다림. ${finding.explanation}`}
              />
              <span className="bottleneck-card-content">
                <strong>{`병목 ${index + 1}: ${typeLabel[finding.type]}`}</strong>
                <span className="bottleneck-cause"><b>원인</b> {finding.blockerLabel}</span>
                <span><b>늦어진 작업</b> {blocked}</span>
                <span><b>대기</b> {finding.delayUnits}단위</span>
                <span><b>영향받은 뒤 작업</b> {affected}</span>
                <span><b>텍스트 경로</b> {path}</span>
              </span>
              <span className={`bottleneck-path bottleneck-path--${finding.type}`} aria-hidden="true">
                <span>{finding.blockerLabel}</span><span>→</span><span>{blocked}</span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
