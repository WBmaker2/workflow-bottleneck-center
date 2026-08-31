import type { Dispatch } from "react";
import { getRequiredAction } from "../../app/appSelectors";
import type { AppAction, MissionAttempt } from "../../app/appTypes";
import type { ScenarioDefinition } from "../../domain/types";
import { RequiredActionButton } from "../../components/RequiredActionButton";
import { TaskCard } from "./TaskCard";
import { TaskCardSummary } from "./TaskCardSummary";
import { MissionOverview } from "./MissionOverview";

export interface BriefingScreenProps {
  scenario: ScenarioDefinition;
  attempt: MissionAttempt;
  dispatch: Dispatch<AppAction>;
}

export function BriefingScreen({ scenario, attempt, dispatch }: BriefingScreenProps) {
  const activeActionId = getRequiredAction(attempt);
  const confirmConditions = () => {
    dispatch({ type: "ACKNOWLEDGE_CONDITIONS" });
    dispatch({ type: "ENTER_STAGE", stage: "relations" });
  };

  return (
    <section className="briefing-screen" aria-labelledby="briefing-title">
      <h2 id="briefing-title">의뢰 접수</h2>
      <p>{scenario.mission}</p>
      <p className="briefing-next-action">다음 행동: 조건을 읽고 <b>조건 확인</b>을 눌러 관계를 연결합니다.</p>
      <RequiredActionButton actionId="confirm-conditions" activeActionId={activeActionId} onClick={confirmConditions}>조건 확인</RequiredActionButton>
      <MissionOverview scenario={scenario} />
      <TaskCardSummary scenario={scenario} />
      <section aria-labelledby="task-cards-title">
        <h3 id="task-cards-title">작업 카드</h3>
        <div className="task-card-list">{scenario.tasks.map((task, index) => <TaskCard key={task.id} task={task} scenario={scenario} defaultOpen={index === 0} />)}</div>
      </section>
    </section>
  );
}
