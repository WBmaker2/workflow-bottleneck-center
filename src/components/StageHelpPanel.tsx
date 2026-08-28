import type { LearningStage } from "../app/appTypes";
import { stageHelp } from "../app/stageHelp";

export interface StageHelpPanelProps {
  stage: LearningStage;
}

const helpId = (stage: LearningStage) => `stage-help-${stage}`;

export function StageHelpPanel({ stage }: StageHelpPanelProps) {
  const help = stageHelp[stage];
  const titleId = helpId(stage);
  return (
    <aside className="stage-help-panel" aria-labelledby={titleId}>
      <h3 id={titleId}>{help.title}</h3>
      <dl>
        <div><dt>지금 할 일</dt><dd>{help.whatToDo}</dd></div>
        <div><dt>성공하려면</dt><dd>{help.successHint}</dd></div>
      </dl>
    </aside>
  );
}
