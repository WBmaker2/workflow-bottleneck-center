import type { LearningStage } from "../domain/types";
import { learnerCopy } from "../data/learnerCopy";

export interface AppMastheadProps {
  stage: LearningStage;
  scenarioTitle: string;
}

export function AppMasthead({ stage, scenarioTitle }: AppMastheadProps) {
  return (
    <header className="app-masthead">
      <div>
        <p className="app-eyebrow">이번 미션 · {scenarioTitle}</p>
        <h1 id="app-title" tabIndex={-1} data-stage-heading aria-describedby="current-stage-label">작업 순서 병목 해결소</h1>
        <p className="app-learning-question">먼저 할 일과 함께 할 일을 구분하면 기다림을 줄일 수 있어요.</p>
        <span id="current-stage-label" className="visually-hidden">현재 단계 {learnerCopy.stageLabels[stage]}</span>
      </div>
      <span className="virtual-time-pill" aria-label="교육용 가상 시간">가상 시간</span>
    </header>
  );
}
