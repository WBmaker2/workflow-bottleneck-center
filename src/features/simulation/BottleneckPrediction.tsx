import { useState } from "react";
import type { WaitReason } from "../../domain/types";
import { learnerCopy } from "../../data/learnerCopy";

export interface BottleneckPredictionProps {
  onSubmit(reason: WaitReason, explanation: string): void;
  submittedReason?: WaitReason | null;
  submittedExplanation?: string;
  engineReason?: WaitReason | null;
}

const choices: readonly { label: string; reason: WaitReason }[] = [
  { label: "먼저 끝날 작업을 기다림", reason: "dependency" },
  { label: "한정된 도구를 기다림", reason: "resource" },
  { label: "담당 역할을 기다림", reason: "role" },
  { label: "단독 작업 차례를 기다림", reason: "solo" },
];

const reasonLabel = (reason: WaitReason): string => choices.find((choice) => choice.reason === reason)?.label ?? "기다림";
const koreanSyllableCount = (value: string): number => [...value].filter((character) => /[가-힣]/.test(character)).length;

export function BottleneckPrediction({ onSubmit, submittedReason = null, submittedExplanation = "", engineReason = null }: BottleneckPredictionProps) {
  const [reason, setReason] = useState<WaitReason | null>(submittedReason);
  const [explanation, setExplanation] = useState("");
  const canSubmit = reason !== null && koreanSyllableCount(explanation) >= 10;
  if (submittedReason) {
    const correct = engineReason !== null && submittedReason === engineReason;
    return <section className="prediction-feedback" aria-label="예측 결과">
      <h4>예측을 저장했습니다.</h4>
      <p>{correct ? "실행 기록과 같은 기다림 원인입니다." : "예측과 실행 기록이 달라도 괜찮습니다. 작업 카드와 기다림 표시를 다시 비교해 보세요."}</p>
      {submittedExplanation && <p>내 설명: {submittedExplanation}</p>}
      <p>실행 기록: {engineReason ? reasonLabel(engineReason) : "확인할 기다림이 없습니다."}</p>
    </section>;
  }
  return (
    <fieldset className="prediction-gate" aria-label="기다림 원인 예측">
      <legend>{learnerCopy.analysisTerms.prediction}</legend>
      <p>{learnerCopy.analysisTerms.predictionDescription}</p>
      {choices.map((choice) => <label key={choice.reason}>
        <input type="radio" name="wait-reason" value={choice.reason} checked={reason === choice.reason} onChange={() => setReason(choice.reason)} />
        {choice.label}
      </label>)}
      <label htmlFor="prediction-explanation">기다림을 예상한 이유 (10자 이상)</label>
      <textarea id="prediction-explanation" value={explanation} onChange={(event) => setExplanation(event.target.value)} minLength={10} />
      <button type="button" onClick={() => reason && onSubmit(reason, explanation.trim())} disabled={!canSubmit}>예측 저장</button>
    </fieldset>
  );
}
