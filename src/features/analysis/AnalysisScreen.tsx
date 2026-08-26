import { useState } from "react";
import type { AttemptSnapshot } from "../../app/appTypes";
import { RequiredActionButton } from "../../components/RequiredActionButton";
import { LiveStatus } from "../../components/LiveStatus";
import type { ScenarioDefinition, WaitReason } from "../../domain/types";
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

export function AnalysisScreen({ snapshot, prediction, predictionExplanation, selectedFindingId, onSelect, onBeginRevision }: AnalysisScreenProps) {
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
  const canStart = !hasFindings || markedFindingId !== null;
  const firstWait = snapshot.result.waits[0];

  return (
    <section className="analysis-screen" aria-labelledby="analysis-screen-title">
      <h2 id="analysis-screen-title">병목 분석</h2>
      <p>실행 기록을 살펴보고, 단순히 오래 걸린 작업이 아니라 뒤 작업을 늦춘 원인을 찾아보세요.</p>
      <p className="analysis-total">전체 대기: {snapshot.bottlenecks.totalWaitUnits}단위</p>
      <BottleneckPanel
        analysis={snapshot.bottlenecks}
        selectedFindingId={localFindingId}
        onSelect={(id) => setLocalFindingId(id)}
      />
      <section className="prediction-record" aria-labelledby="prediction-record-title">
        <h3 id="prediction-record-title">내 예측과 실행 기록</h3>
        <dl>
          <div><dt>내 예측</dt><dd>{prediction ? reasonLabel[prediction] : "예측하지 않음"}{predictionExplanation ? ` — ${predictionExplanation}` : ""}</dd></div>
          <div><dt>실행 기록</dt><dd>{firstWait ? `${reasonLabel[firstWait.reason]} 때문에 ${firstWait.to - firstWait.from}단위 기다림이 기록되었습니다.` : "기다림 없음"}</dd></div>
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
