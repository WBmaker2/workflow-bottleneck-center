import type { ScenarioDefinition } from "../../domain/types";

export interface MissionOverviewProps { scenario: ScenarioDefinition; }
export function MissionOverview({ scenario }: MissionOverviewProps) {
  return <section className="mission-overview" aria-labelledby="mission-overview-title">
    <h3 id="mission-overview-title">이번 미션 한눈에 보기</h3>
    <p className="mission-overview__context">여러 작업의 선후·동시 진행·제한 자원에서 생긴 기다림을 살펴보고, 도움 요청·확인·휴식도 책임 있는 협력으로 생각해요.</p>
    <div className="mission-overview__grid">
      <div><strong>목표</strong><p>{scenario.timeGoal}단위 안에 끝내 보세요. 유일한 정답은 아니에요.</p></div>
      <div><strong>안전·품질</strong><p>공개된 조건과 점검을 지켜요.</p></div>
      <div><strong>협력</strong><p>사람과 도구를 살펴 역할을 나눠요.</p></div>
    </div>
    <p className="mission-overview__disclaimer">모든 작업 조건은 카드와 요약에서 미리 공개해요. 모든 시간은 교육용 가상 시간 단위예요.</p>
  </section>;
}
