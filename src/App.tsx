import { AppProvider, useAppDispatch, useAppState } from "./app/AppProvider";
import { getScenario, scenarioCatalog } from "./data/scenarios";
import { BriefingScreen } from "./features/briefing/BriefingScreen";
import { LiveStatus } from "./components/LiveStatus";
import { UpdateHistoryButton } from "./components/UpdateHistoryButton";
import { RelationScreen } from "./features/relations/RelationScreen";

const stageLabels = {
  briefing: "안내",
  relations: "관계 설계",
  schedule: "일정표",
  simulation: "가상 실행",
  analysis: "병목 분석",
  revision: "수정",
  report: "개선 보고서",
} as const;

function AppShell() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const scenario = getScenario(state.selectedScenarioId);
  const attempt = state.attempts[state.selectedScenarioId]!;

  return (
    <main aria-labelledby="app-title">
      <h1 id="app-title">작업 순서 병목 해결소</h1>
      <p className="app-disclaimer">모든 시간은 교육용 가상 시간 단위이며 실제 작업 시간을 예측하지 않습니다.</p>
      <nav aria-label="시나리오 선택">
        <ul>
          {scenarioCatalog.map((item) => (
            <li key={item.id}>
              <button type="button" aria-current={item.id === scenario.id ? "page" : undefined} onClick={() => dispatch({ type: "SELECT_SCENARIO", scenarioId: item.id })}>
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <label className="save-toggle">
        <input type="checkbox" checked={state.saveEnabled} onChange={(event) => dispatch({ type: "SET_SAVE_ENABLED", enabled: event.target.checked })} />
        이 기기에 활동 저장
      </label>
      <LiveStatus message={state.announcement} blocked={state.announcement.includes("안전") || state.announcement.includes("품질")} />
      <section className="stage-shell" aria-labelledby="scenario-title">
        <h2 id="scenario-title">{scenario.title}</h2>
        <p>{`현재 단계: ${stageLabels[attempt.stage]}`}</p>
        {attempt.stage === "briefing" ? (
          <BriefingScreen scenario={scenario} attempt={attempt} dispatch={dispatch} />
        ) : attempt.stage === "relations" ? (
          <RelationScreen
            scenario={scenario}
            attempt={attempt}
            onChange={(edges) => dispatch({ type: "SET_RELATIONS", edges })}
            onContinue={() => dispatch({ type: "ENTER_STAGE", stage: "schedule" })}
          />
        ) : (
          <section aria-labelledby="next-stage-title">
            <h3 id="next-stage-title">{stageLabels[attempt.stage]}</h3>
            <p>앞에서 확인한 조건을 바탕으로 다음 활동을 준비합니다.</p>
          </section>
        )}
      </section>
      <UpdateHistoryButton />
    </main>
  );
}

export function App() {
  return <AppProvider><AppShell /></AppProvider>;
}
