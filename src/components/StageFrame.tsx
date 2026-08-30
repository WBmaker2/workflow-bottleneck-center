import type { ReactNode } from "react";
import type { LearningStage } from "../domain/types";
import { learnerCopy } from "../data/learnerCopy";
import { StageHelpPanel } from "./StageHelpPanel";

export interface StageFrameProps { scenarioTitle: string; stage: LearningStage; children: ReactNode; }
export function StageFrame({ scenarioTitle, stage, children }: StageFrameProps) {
  return <section className="stage-frame stage-shell" aria-labelledby="scenario-title">
    <h2 id="scenario-title">{scenarioTitle}</h2>
    <p>현재 단계: {learnerCopy.stageLabels[stage]}</p>
    <StageHelpPanel stage={stage} />
    {children}
  </section>;
}
