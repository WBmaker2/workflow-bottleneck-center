import type { Dispatch } from "react";
import { getRequiredAction } from "../../app/appSelectors";
import type { AppAction, MissionAttempt } from "../../app/appTypes";
import type { ScenarioDefinition } from "../../domain/types";
import { RequiredActionButton } from "../../components/RequiredActionButton";
import { TaskCard } from "./TaskCard";
import { TaskCardSummary } from "./TaskCardSummary";

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
      <p className="briefing-differentiation">이 활동은 명령을 한 줄씩 실행하거나 물건을 나누는 활동이 아니라, 여러 작업의 선후 관계·동시 진행·제한 자원에서 생긴 기다림을 살펴봅니다.</p>
      <p className="briefing-human-centered">협력이 필요하면 도움을 요청하고 역할을 바꿀 수 있습니다. 도움 요청·확인·휴식은 낭비가 아닙니다.</p>
      <section className="mission-goals" aria-labelledby="mission-goals-title">
        <h3 id="mission-goals-title">이번 미션의 목표</h3>
        <p>{`목표 시간 ${scenario.timeGoal}단위`}</p>
        <p>이 시간은 유일한 정답이 아닌 목표입니다. 안전·품질 조건을 지키는 여러 일정이 가능합니다.</p>
        <ul><li>모든 작업을 빠뜨리지 않고 완료합니다.</li><li>공개된 안전 조건과 품질 조건을 지킵니다.</li><li>사람과 제한 자원을 살피며 협력합니다.</li></ul>
      </section>
      <p className="virtual-time-disclaimer">{`${scenario.disclaimer.replace("교육용 가상 단위", "교육용 가상 시간 단위")} 이 버튼을 누르면 관계 연결로 이동합니다.`}</p>
      <TaskCardSummary scenario={scenario} />
      <RequiredActionButton actionId="confirm-conditions" activeActionId={activeActionId} onClick={confirmConditions}>조건 확인</RequiredActionButton>
      <section aria-labelledby="task-cards-title">
        <h3 id="task-cards-title">작업 카드</h3>
        <div className="task-card-list">{scenario.tasks.map((task, index) => <TaskCard key={task.id} task={task} scenario={scenario} defaultOpen={index === 0} />)}</div>
      </section>
    </section>
  );
}
