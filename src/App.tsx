import { useEffect, useRef, useState } from "react";
import { AppProvider, useAppDispatch, useAppState } from "./app/AppProvider";
import { getScenario } from "./data/scenarios";
import { BriefingScreen } from "./features/briefing/BriefingScreen";
import { LiveStatus } from "./components/LiveStatus";
import { UpdateHistoryButton } from "./components/UpdateHistoryButton";
import { ScenarioNavigation } from "./components/ScenarioNavigation";
import { StageHelpPanel } from "./components/StageHelpPanel";
import { RelationScreen } from "./features/relations/RelationScreen";
import { ScheduleScreen } from "./features/schedule/ScheduleScreen";
import { SimulationScreen } from "./features/simulation/SimulationScreen";
import { AnalysisScreen } from "./features/analysis/AnalysisScreen";
import { RevisionScreen } from "./features/revision/RevisionScreen";
import { ReportScreen } from "./features/report/ReportScreen";
import { ModalDialog } from "./components/ModalDialog";
import { focusStageHeading } from "./a11y/focusStageHeading";

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
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const clearTriggerRef = useRef<HTMLButtonElement>(null);
  const previousStage = useRef(attempt.stage);

  useEffect(() => {
    if (previousStage.current !== attempt.stage) {
      previousStage.current = attempt.stage;
      focusStageHeading(attempt.stage);
    }
  }, [attempt.stage]);

  return (
    <main aria-labelledby="app-title">
      <h1 id="app-title" tabIndex={-1} data-stage-heading aria-describedby="current-stage-label">작업 순서 병목 해결소</h1>
      <span id="current-stage-label" className="visually-hidden">현재 단계 {stageLabels[attempt.stage]}</span>
      {attempt.stage !== "briefing" && <p className="app-disclaimer">모든 시간은 교육용 가상 시간 단위이며 실제 작업 시간을 예측하지 않습니다.</p>}
      <ScenarioNavigation selectedScenarioId={state.selectedScenarioId} onSelect={(scenarioId) => dispatch({ type: "SELECT_SCENARIO", scenarioId })} />
      <label className="save-toggle no-print" aria-describedby="save-toggle-description">
        <input type="checkbox" checked={state.saveEnabled} onChange={(event) => dispatch({ type: "SET_SAVE_ENABLED", enabled: event.target.checked })} />
        이 기기에 진행 저장
      </label>
      <p id="save-toggle-description" className="no-print">선택하면 이 브라우저에 역할 A·B·C의 활동만 저장합니다. 학생 이름이나 온라인 계정은 사용하지 않습니다.</p>
      {state.announcement && <LiveStatus message={state.announcement} blocked={state.announcement.includes("안전") || state.announcement.includes("품질")} />}
      <section className="stage-shell" aria-labelledby="scenario-title">
        <h2 id="scenario-title">{scenario.title}</h2>
        <p>{`현재 단계: ${stageLabels[attempt.stage]}`}</p>
        <StageHelpPanel stage={attempt.stage} />
        {attempt.stage === "briefing" ? (
          <BriefingScreen scenario={scenario} attempt={attempt} dispatch={dispatch} />
        ) : attempt.stage === "relations" ? (
          <RelationScreen
            scenario={scenario}
            attempt={attempt}
            onChange={(edges) => dispatch({ type: "SET_RELATIONS", edges })}
            onContinue={() => dispatch({ type: "ENTER_STAGE", stage: "schedule" })}
          />
        ) : attempt.stage === "schedule" ? (
          <ScheduleScreen
            scenario={scenario}
            attempt={attempt}
            onChange={(draft) => dispatch({ type: "SET_DRAFT_SCHEDULE", draft })}
            onRun={(snapshot) => {
              if (!snapshot) return;
              dispatch({ type: "SAVE_INITIAL_SNAPSHOT", snapshot });
              dispatch({ type: "ENTER_STAGE", stage: "simulation" });
            }}
          />
        ) : attempt.stage === "simulation" && attempt.initialSnapshot ? (
          <SimulationScreen
            key={`${scenario.id}:${attempt.initialSnapshot.result.finishTime}:${attempt.initialSnapshot.result.runs.length}`}
            scenario={scenario}
            snapshot={attempt.initialSnapshot}
            prediction={attempt.prediction}
            predictionExplanation={attempt.predictionExplanation}
            onSubmit={(reason, explanation) => dispatch({ type: "SET_PREDICTION", reason, explanation })}
            onEnterAnalysis={() => dispatch({ type: "ENTER_STAGE", stage: "analysis" })}
          />
        ) : attempt.stage === "analysis" && attempt.initialSnapshot ? (
          <AnalysisScreen
            scenario={scenario}
            snapshot={attempt.initialSnapshot}
            prediction={attempt.prediction}
            predictionExplanation={attempt.predictionExplanation}
            selectedFindingId={attempt.selectedFindingId}
            onSelect={(findingId) => dispatch({ type: "SELECT_BOTTLENECK", findingId })}
            onBeginRevision={() => dispatch({ type: "BEGIN_REVISION" })}
          />
        ) : attempt.stage === "revision" && attempt.initialSnapshot ? (
          <RevisionScreen
            scenario={scenario}
            initialSnapshot={attempt.initialSnapshot}
            revisedSchedule={attempt.revisedSchedule}
            revisedSnapshot={attempt.revisedSnapshot}
            comparison={attempt.comparison}
            onChange={(draft) => dispatch({ type: "SET_REVISED_SCHEDULE", draft })}
            onCompare={(snapshot, comparison) => dispatch({ type: "SAVE_REVISED_SNAPSHOT", snapshot, comparison })}
            onReport={() => dispatch({ type: "ENTER_STAGE", stage: "report" })}
          />
        ) : attempt.stage === "report" ? (
          <ReportScreen
            scenario={scenario}
            attempt={attempt}
            saveEnabled={state.saveEnabled}
            onEvidenceChange={(field, value) => dispatch({ type: "SET_EVIDENCE_FIELD", field, value })}
            onComplete={() => dispatch({ type: "COMPLETE_MISSION" })}
            onClearSavedProgress={() => setClearDialogOpen(true)}
            clearTriggerRef={clearTriggerRef}
          />
        ) : (
          <section aria-labelledby="next-stage-title">
            <h3 id="next-stage-title">{stageLabels[attempt.stage]}</h3>
            <p>앞에서 확인한 조건을 바탕으로 다음 활동을 준비합니다.</p>
          </section>
        )}
        <details className="mobile-summary-panel app-stage-summary">
          <summary role="button">요약 보기</summary>
          <p>현재 단계의 설명과 조작 방법을 다시 확인할 수 있습니다. 결과는 실제 측정값이 아닌 가상 모델입니다.</p>
        </details>
      </section>
      <ModalDialog open={clearDialogOpen} title="저장된 진행 지우기" returnFocusRef={clearTriggerRef} onClose={() => setClearDialogOpen(false)}>
        <p>이 기기에 저장된 진행을 지울까요? 현재 화면의 활동은 계속 사용할 수 있습니다.</p>
        <button type="button" onClick={() => { dispatch({ type: "SET_SAVE_ENABLED", enabled: false }); setClearDialogOpen(false); }}>저장된 진행 지우기 확인</button>
      </ModalDialog>
      <footer className="app-footer no-print"><UpdateHistoryButton /></footer>
    </main>
  );
}

export function App() {
  return <AppProvider><AppShell /></AppProvider>;
}
