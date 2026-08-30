import type { LearningStage } from "../domain/types";
import { learnerCopy } from "../data/learnerCopy";

export interface StageProgressProps { currentStage: LearningStage; }
const stages: readonly LearningStage[] = ["briefing", "relations", "schedule", "simulation", "analysis", "revision", "report"];

export function StageProgress({ currentStage }: StageProgressProps) {
  const current = stages.indexOf(currentStage);
  return (
    <aside className="stage-progress" data-testid="stage-progress" aria-label="학습 단계 진행">
      <h2>학습 단계</h2>
      <ol>
        {stages.map((stage, index) => {
          const state = index < current ? "complete" : index === current ? "current" : "locked";
          return <li key={stage} className={`stage-progress__item stage-progress__item--${state}`} aria-current={state === "current" ? "step" : undefined}>
            <span className="stage-progress__number" aria-hidden="true">{index + 1}</span>
            <span>{learnerCopy.stageLabels[stage]}</span>
            <small>{state === "complete" ? "완료" : state === "current" ? "지금" : "잠김"}</small>
          </li>;
        })}
      </ol>
    </aside>
  );
}
