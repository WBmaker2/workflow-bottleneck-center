import { useState } from "react";
import type { AttemptSnapshot } from "../../app/appTypes";
import { RequiredActionButton } from "../../components/RequiredActionButton";
import { LiveStatus } from "../../components/LiveStatus";
import type { ScenarioDefinition, WaitReason } from "../../domain/types";
import { learnerCopy } from "../../data/learnerCopy";
import { BottleneckPanel } from "./BottleneckPanel";

export interface AnalysisScreenProps {
  scenario: ScenarioDefinition;
  snapshot: AttemptSnapshot;
  prediction: WaitReason | null;
  predictionExplanation: string;
  selectedFindingId: string | null;
  onSelect(id: string): void;
  onBeginRevision(): void;
}

const reasonLabel: Record<WaitReason, string> = {
  dependency: "선행 작업",
  resource: "공유 도구",
  role: "역할",
  solo: "혼자 하는 작업",
};

export function AnalysisScreen({ scenario, snapshot, prediction, predictionExplanation, selectedFindingId, onSelect, onBeginRevision }: AnalysisScreenProps) {
  const [localFindingId, setLocalFindingId] = useState(selectedFindingId);
  const [markedFindingId, setMarkedFindingId] = useState(selectedFindingId);
  const [status, setStatus] = useState("");
  const mark = () => {
    if (!localFindingId) return;
    onSelect(localFindingId);
    setMarkedFindingId(localFindingId);
    setStatus("이 대기가 뒤 작업의 시작을 늦췄습니다. 이제 수정할 수 있습니다.");
  };
  const hasFindings = snapshot.bottlenecks.findings.length > 0;
  const persistedFindingIsCurrent = selectedFindingId !== null && snapshot.bottlenecks.findings.some(({ id }) => id === selectedFindingId);
  const canStart = !hasFindings
    ? selectedFindingId === null
    : persistedFindingIsCurrent && localFindingId === markedFindingId && markedFindingId === selectedFindingId;
  const selectedFinding = snapshot.bottlenecks.findings.find(({ id }) => id === localFindingId)
    ?? snapshot.bottlenecks.findings.find(({ id }) => id === selectedFindingId);
  const titleFor = (taskId: string) => scenario.tasks.find((task) => task.id === taskId)?.title ?? "해당 작업";
  const taskPath = selectedFinding
    ? [selectedFinding.blockerLabel, titleFor(selectedFinding.blockedTaskId), ...selectedFinding.affectedTaskIds.map(titleFor)].join(" → ")
    : null;

  return (
    <section className="analysis-screen" aria-labelledby="analysis-screen-title">
      <h2 id="analysis-screen-title">병목 분석</h2>
      <p className="analysis-learner-term"><strong>{learnerCopy.analysisTerms.bottleneck}</strong></p>
      <p>{learnerCopy.analysisTerms.bottleneckDescription}</p>
      <p className="analysis-total">전체 대기: {snapshot.bottlenecks.totalWaitUnits}단위</p>
      <BottleneckPanel
        analysis={snapshot.bottlenecks}
        selectedFindingId={localFindingId}
        scenario={scenario}
        onSelect={(id) => {
          setLocalFindingId(id);
          if (id !== markedFindingId) setMarkedFindingId(null);
        }}
      />
      {selectedFinding && <section className="selected-finding" aria-labelledby="selected-finding-title">
        <h3 id="selected-finding-title">{learnerCopy.analysisTerms.cause}</h3>
        <p><b>원인</b> {selectedFinding.blockerLabel}</p>
        <p><b>실제 지연</b> {selectedFinding.delayUnits}단위</p>
        <p><b>설명</b> {selectedFinding.explanation}</p>
        <p><b>인과·영향 경로</b> {taskPath}</p>
      </section>}
      <section className="prediction-record" aria-labelledby="prediction-record-title">
        <h3 id="prediction-record-title">{learnerCopy.analysisTerms.prediction}</h3>
        <dl>
          <div><dt>{learnerCopy.analysisTerms.prediction}</dt><dd>{prediction ? reasonLabel[prediction] : "예측하지 않음"}{predictionExplanation ? ` — ${predictionExplanation}` : ""}</dd></div>
          <div><dt>실행 기록</dt><dd>{selectedFinding ? `${selectedFinding.blockerLabel} 때문에 ${selectedFinding.delayUnits}단위 기다림이 기록되었습니다.` : "기다림 없음"}</dd></div>
        </dl>
      </section>
      <LiveStatus message={status} />
      {hasFindings ? (
        <>
          <RequiredActionButton actionId="mark-bottleneck" activeActionId="mark-bottleneck" disabled={!localFindingId} onClick={mark}>병목 표시</RequiredActionButton>
          {canStart && <button type="button" onClick={onBeginRevision}>수정 시작</button>}
        </>
      ) : (
        <button type="button" onClick={onBeginRevision}>수정 시작</button>
      )}
    </section>
  );
}
