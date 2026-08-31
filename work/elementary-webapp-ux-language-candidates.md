# Learner Text Inventory

- Root: `/Volumes/ External Drive 256G/Dev2/codex/workflow-bottleneck-center`
- Files scanned: `69`
- Candidates: `1115`
- Status: `triage only`; not a grade-level certification or automatic rewrite.

## Candidate strings

| Source | Surface | Text | Role hints | Review signals |
| --- | --- | --- | --- | --- |
| src/App.tsx:32:18 | text | { if (previousStage.current !== attempt.stage) { previousStage.current = attempt.stage; focusStageHeading(attempt.stage); } }, [attempt.stage]); return ( | heading | long-or-dense |
| src/App.tsx:40:28 | text | app-title | learner-text-candidate | — |
| src/App.tsx:43:65 | text | save-toggle-description | learner-text-candidate | — |
| src/App.tsx:44:154 | text | 이 기기에 진행 저장 | input | — |
| src/App.tsx:47:60 | text | 선택하면 이 브라우저에 역할 A·B·C의 활동만 저장합니다. 학생 이름이나 온라인 계정은 사용하지 않습니다. | learner-text-candidate | long-or-dense |
| src/App.tsx:48:109 | text | 안전 | learner-text-candidate | repeated-text |
| src/App.tsx:48:146 | text | 품질 | learner-text-candidate | repeated-text |
| src/App.tsx:51:74 | text | {attempt.stage === "briefing" ? ( | learner-text-candidate | — |
| src/App.tsx:114:37 | text | next-stage-title | learner-text-candidate | — |
| src/App.tsx:115:39 | text | {stageLabels[attempt.stage]} | heading | — |
| src/App.tsx:116:16 | text | 앞에서 확인한 조건을 바탕으로 다음 활동을 준비합니다. | learner-text-candidate | — |
| src/App.tsx:120:34 | text | 요약 보기 | button-or-action | — |
| src/App.tsx:121:14 | text | 현재 단계의 설명과 조작 방법을 다시 확인할 수 있습니다. 결과는 실제 측정값이 아닌 가상 모델입니다. | learner-text-candidate | — |
| src/App.tsx:125:50 | title | 저장된 진행 지우기 | title | repeated-text |
| src/App.tsx:126:12 | text | 이 기기에 저장된 진행을 지울까요? 현재 화면의 활동은 계속 사용할 수 있습니다. | learner-text-candidate | — |
| src/App.tsx:127:66 | text | SET_SAVE_ENABLED | button-or-action | — |
| src/App.tsx:127:134 | text | 저장된 진행 지우기 확인 | button-or-action | — |
| src/a11y/focusStageHeading.ts:3:48 | text | = { briefing: "안내", relations: "관계 설계", schedule: "일정표", simulation: "가상 실행", analysis: "병목 분석", revision: "수정", report: "개선 보고서", }; /** Focuses the single app heading after a real stage transition. */ export function focusStageHeading(stage: LearningStage): void { const heading = document.querySelector | heading, instruction | abstract-or-formal, long-or-dense, technical-or-internal |
| src/a11y/focusStageHeading.ts:4:14 | text | 안내 | instruction | repeated-text |
| src/a11y/focusStageHeading.ts:5:15 | text | 관계 설계 | learner-text-candidate | repeated-text |
| src/a11y/focusStageHeading.ts:6:14 | text | 일정표 | learner-text-candidate | repeated-text |
| src/a11y/focusStageHeading.ts:7:16 | text | 가상 실행 | learner-text-candidate | repeated-text |
| src/a11y/focusStageHeading.ts:8:14 | text | 병목 분석 | learner-text-candidate | abstract-or-formal, repeated-text |
| src/a11y/focusStageHeading.ts:9:14 | text | 수정 | learner-text-candidate | repeated-text |
| src/a11y/focusStageHeading.ts:10:12 | text | 개선 보고서 | learner-text-candidate | repeated-text |
| src/a11y/focusStageHeading.ts:15:56 | text | [data-stage-heading] | heading | — |
| src/a11y/focusStageHeading.ts:17:25 | text | aria-describedby | heading | missing-term-explanation, technical-or-internal |
| src/a11y/focusStageHeading.ts:17:45 | text | current-stage-label | heading | repeated-text |
| src/a11y/focusStageHeading.ts:18:47 | text | current-stage-label | learner-text-candidate | repeated-text |
| src/a11y/focusStageHeading.ts:19:45 | text | 현재 단계 ${stageNames[stage]} | learner-text-candidate | — |
| src/app/AppProvider.tsx:32:58 | text | 저장된 진행을 불러오지 못해 새 활동으로 시작합니다. | learner-text-candidate | — |
| src/app/AppProvider.tsx:43:18 | text | { if (previousSaveEnabled.current && !state.saveEnabled) { const result = repository.clear(); if (!result.ok && !clearErrorAnnounced.current) { clearErrorAnnounced.current = true; dispatch({ type: "ANNOUNCE", message: "이 기기의 저장 내용을 지우지 못했지만 현재 활동은 계속할 수 있습니다." }); } saveErrorAnnounced.current = false; } else if (state.saveEnabled) { clearErrorAnnounced.current = false; const result = repository.persist(state); if (!result.ok && !saveErrorAnnounced.current) { saveErrorAnnounced.current = true; dispatch({ type: "ANNOUNCE", message: "이 기기에 저장하지 못했지만 현재 활동은 계속할 수 있습니다." }); } } previousSaveEnabled.current = state.saveEnabled; }, [repository, state]); return | feedback-or-error | long-or-dense, shaming-tone, technical-or-internal |
| src/app/AppProvider.tsx:48:48 | text | 이 기기의 저장 내용을 지우지 못했지만 현재 활동은 계속할 수 있습니다. | learner-text-candidate | shaming-tone |
| src/app/AppProvider.tsx:56:48 | text | 이 기기에 저장하지 못했지만 현재 활동은 계속할 수 있습니다. | learner-text-candidate | shaming-tone |
| src/app/AppProvider.tsx:62:151 | text | ; } // eslint-disable-next-line react-refresh/only-export-components export function useAppState(): AppState { const state = useContext(StateContext); if (!state) throw new Error("useAppState must be used inside AppProvider"); return state; } // eslint-disable-next-line react-refresh/only-export-components export function useAppDispatch(): React.Dispatch | feedback-or-error | long-or-dense, technical-or-internal |
| src/app/AppProvider.tsx:68:32 | text | useAppState must be used inside AppProvider | feedback-or-error | missing-term-explanation, technical-or-internal |
| src/app/AppProvider.tsx:75:35 | text | useAppDispatch must be used inside AppProvider | feedback-or-error | missing-term-explanation, technical-or-internal |
| src/app/appReducer.ts:61:50 | text | = { briefing: "안내를 확인하세요.", relations: "먼저 조건을 확인하고 관계를 설계하세요.", schedule: "먼저 필요한 관계를 모두 연결하고 순환 관계를 제거하세요.", simulation: "먼저 조건을 확인하고 일정표의 모든 작업을 배치하세요.", analysis: "먼저 실행 결과와 기다림 원인을 확인하세요.", revision: "먼저 병목 원인을 선택하세요.", report: "먼저 수정 결과와 비교를 저장하세요.", }; const updateDraft = (scenarioId: ScenarioId, draft: ScheduleDraft, updates: Partial | instruction | long-or-dense, multiple-actions, technical-or-internal |
| src/app/appReducer.ts:62:14 | text | 안내를 확인하세요. | instruction | — |
| src/app/appReducer.ts:63:15 | text | 먼저 조건을 확인하고 관계를 설계하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:64:14 | text | 먼저 필요한 관계를 모두 연결하고 순환 관계를 제거하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:65:16 | text | 먼저 조건을 확인하고 일정표의 모든 작업을 배치하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:66:14 | text | 먼저 실행 결과와 기다림 원인을 확인하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:67:14 | text | 먼저 병목 원인을 선택하세요. | learner-text-candidate | repeated-text |
| src/app/appReducer.ts:68:12 | text | 먼저 수정 결과와 비교를 저장하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:82:68 | text | 알 수 없는 시나리오입니다. | learner-text-candidate | — |
| src/app/appReducer.ts:95:64 | text | 조건 확인은 안내 단계에서 할 수 있습니다. | instruction | — |
| src/app/appReducer.ts:98:65 | text | 관계 설계 단계에서 관계를 연결하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:99:59 | text | 최초 실행 결과가 저장되어 관계를 수정할 수 없습니다. | learner-text-candidate | — |
| src/app/appReducer.ts:105:96 | text | 일정표 단계에서 작업을 배치하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:107:59 | text | 최초 실행 결과가 저장되어 일정을 수정할 수 없습니다. | learner-text-candidate | — |
| src/app/appReducer.ts:111:98 | text | 먼저 가상 실행 단계로 이동하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:116:34 | text | 완전한 현재 일정만 최초 실행 결과로 저장할 수 있습니다. | learner-text-candidate | repeated-text |
| src/app/appReducer.ts:119:87 | text | 완전한 현재 일정만 최초 실행 결과로 저장할 수 있습니다. | learner-text-candidate | repeated-text |
| src/app/appReducer.ts:124:66 | text | 실행 중에 기다림 원인을 예측하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:127:164 | text | 먼저 분석 결과에 표시된 병목 원인을 선택하세요. | learner-text-candidate | abstract-or-formal |
| src/app/appReducer.ts:130:94 | text | 먼저 병목 원인을 선택하세요. | learner-text-candidate | repeated-text |
| src/app/appReducer.ts:133:64 | text | 수정 단계에서 새 일정을 배치하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:136:122 | text | 먼저 수정 일정을 준비하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:140:62 | text | 보고서 단계에서 근거를 작성하세요. | learner-text-candidate | — |
| src/app/appReducer.ts:141:102 | text | 알 수 없는 근거 항목입니다. | learner-text-candidate | — |
| src/app/appReducer.ts:147:146 | text | 수정 결과의 안전·품질·역할 공정성·목표 시간과 네 가지 근거를 모두 확인하세요. | learner-text-candidate | — |
| src/app/stageHelp.ts:11:13 | text | 안내 단계 도움말 | hint, instruction | — |
| src/app/stageHelp.ts:12:16 | text | 작업 카드에서 시간, 필요한 사람과 도구, 먼저 할 일을 살펴보세요. | learner-text-candidate | — |
| src/app/stageHelp.ts:13:19 | text | 안전과 품질 조건을 확인한 뒤 ‘조건 확인’을 누르면 관계를 연결할 수 있어요. | hint | multiple-actions |
| src/app/stageHelp.ts:16:13 | text | 관계 설계 단계 도움말 | hint | — |
| src/app/stageHelp.ts:17:16 | text | 어떤 작업을 먼저 끝내야 다음 작업을 시작할 수 있는지 선으로 연결하세요. | learner-text-candidate | — |
| src/app/stageHelp.ts:18:19 | text | 필수 관계를 빠뜨리지 않고 서로 기다리는 순환을 만들지 않으면 일정표로 갈 수 있어요. | hint | multiple-conditions |
| src/app/stageHelp.ts:21:13 | text | 일정표 단계 도움말 | hint | — |
| src/app/stageHelp.ts:22:16 | text | 모든 작업의 시작 시점과 필요한 역할을 정해 시간표에 배치하세요. | learner-text-candidate | — |
| src/app/stageHelp.ts:23:19 | text | 모든 작업이 관계와 역할 조건에 맞게 놓이면 ‘실행’으로 결과를 살펴볼 수 있어요. | hint | — |
| src/app/stageHelp.ts:26:13 | text | 가상 실행 단계 도움말 | hint | — |
| src/app/stageHelp.ts:27:16 | text | 시간을 한 칸씩 움직이며 작업이 시작하고 멈추는 순간을 관찰하세요. | learner-text-candidate | — |
| src/app/stageHelp.ts:28:19 | text | 기다림이 보이면 왜 멈췄는지 예측하고 실행 기록과 비교해 보세요. | hint | multiple-actions |
| src/app/stageHelp.ts:31:13 | text | 병목 분석 단계 도움말 | hint | abstract-or-formal |
| src/app/stageHelp.ts:32:16 | text | 뒤 작업을 늦춘 기다림의 원인을 찾아 병목으로 표시하세요. | learner-text-candidate | — |
| src/app/stageHelp.ts:33:19 | text | 오래 걸린 작업이 아니라 다른 작업을 실제로 늦춘 원인을 고르면 수정할 수 있어요. | hint | — |
| src/app/stageHelp.ts:36:13 | text | 수정 단계 도움말 | hint | — |
| src/app/stageHelp.ts:37:16 | text | 찾은 병목을 줄이는 새 일정을 만들고 안전·품질·역할 조건도 지키세요. | learner-text-candidate | — |
| src/app/stageHelp.ts:38:19 | text | 처음 일정과 수정 일정을 실행해 비교하면 무엇이 달라졌는지 알 수 있어요. | hint | — |
| src/app/stageHelp.ts:41:13 | text | 개선 보고서 단계 도움말 | hint | — |
| src/app/stageHelp.ts:42:16 | text | 처음과 수정 결과를 비교하고, 왜 그렇게 바꿨는지 네 문장으로 설명하세요. | learner-text-candidate | — |
| src/app/stageHelp.ts:43:19 | text | 안전·품질·협력·시간을 함께 지킨 근거를 모두 적으면 오늘 배운 내용을 정리할 수 있어요. | hint | — |
| src/components/AppMasthead.tsx:13:36 | text | 작업 순서 병목 해결소 · {scenarioTitle} | learner-text-candidate | — |
| src/components/AppMasthead.tsx:14:79 | text | current-stage-label | heading | repeated-text |
| src/components/AppMasthead.tsx:14:100 | text | 작업 순서 병목 해결소 | heading | — |
| src/components/AppMasthead.tsx:15:46 | text | 먼저 할 일과 함께 할 일을 구분하면 기다림을 줄일 수 있어요. | learner-text-candidate | — |
| src/components/AppMasthead.tsx:16:68 | text | 현재 단계 {learnerCopy.stageLabels[stage]} | learner-text-candidate | — |
| src/components/AppMasthead.tsx:18:55 | aria-label | 교육용 가상 시간 | aria-label | — |
| src/components/AppMasthead.tsx:18:66 | text | 가상 시간 | learner-text-candidate | — |
| src/components/ModalDialog.tsx:10:55 | text | ; } const openDialogStack: symbol[] = []; export function ModalDialog({ open, title, dialogId, onClose, children, returnFocusRef }: ModalDialogProps) { const closeRef = useRef | learner-text-candidate | long-or-dense, technical-or-internal |
| src/components/ModalDialog.tsx:16:45 | text | (null); const dialogRef = useRef | learner-text-candidate | technical-or-internal |
| src/components/ModalDialog.tsx:53:10 | text | button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1']) | button-or-action, input | long-or-dense |
| src/components/ModalDialog.tsx:87:93 | text | true | learner-text-candidate | repeated-text |
| src/components/ModalDialog.tsx:89:64 | text | 닫기 | button-or-action | — |
| src/components/RequiredActionButton.tsx:6:55 | text | ; children: ReactNode; disabled?: boolean; onClick(): void; } export function RequiredActionButton({ actionId, activeActionId, children, disabled = false, onClick }: RequiredActionButtonProps) { const isActive = actionId === activeActionId; return ( | button-or-action | long-or-dense, technical-or-internal |
| src/components/ScenarioNavigation.tsx:4:57 | text | = { "science-display": "프린터 1대·선행 관계", "library-cart": "확인 먼저·카트 1대", "class-presentation": "개별 준비·합동 연습", "eco-campaign-booth": "안전 통로·역할 교대", }; export interface ScenarioNavigationProps { selectedScenarioId: ScenarioId; onSelect(id: ScenarioId): void; } export function ScenarioNavigation({ selectedScenarioId, onSelect }: ScenarioNavigationProps) { return ( | learner-text-candidate | long-or-dense, technical-or-internal |
| src/components/ScenarioNavigation.tsx:5:23 | text | 프린터 1대·선행 관계 | learner-text-candidate | — |
| src/components/ScenarioNavigation.tsx:6:20 | text | 확인 먼저·카트 1대 | learner-text-candidate | — |
| src/components/ScenarioNavigation.tsx:7:26 | text | 개별 준비·합동 연습 | learner-text-candidate | — |
| src/components/ScenarioNavigation.tsx:8:26 | text | 안전 통로·역할 교대 | learner-text-candidate | — |
| src/components/ScenarioNavigation.tsx:18:63 | aria-label | 시나리오 선택 | aria-label | — |
| src/components/ScenarioNavigation.tsx:26:40 | text | scenario-navigation__button scenario-navigation__button--selected | learner-text-candidate | long-or-dense |
| src/components/ScenarioNavigation.tsx:26:110 | text | scenario-navigation__button | learner-text-candidate | — |
| src/components/ScenarioNavigation.tsx:32:74 | text | · 선택됨 | learner-text-candidate | — |
| src/components/StageFrame.tsx:8:72 | text | scenario-title | learner-text-candidate | — |
| src/components/StageFrame.tsx:10:8 | text | 현재 단계: {learnerCopy.stageLabels[stage]} | learner-text-candidate | — |
| src/components/StageHelpPanel.tsx:8:41 | text | `stage-help-${stage}`; export function StageHelpPanel({ stage }: StageHelpPanelProps) { const help = stageHelp[stage]; const titleId = helpId(stage); return ( | hint | long-or-dense, technical-or-internal |
| src/components/StageHelpPanel.tsx:17:18 | text | 지금 할 일 | hint | — |
| src/components/StageHelpPanel.tsx:18:18 | text | 성공하려면 | hint | — |
| src/components/StageProgress.tsx:10:80 | aria-label | 학습 단계 진행 | aria-label | — |
| src/components/StageProgress.tsx:11:11 | text | 학습 단계 | heading | — |
| src/components/StageProgress.tsx:16:73 | text | {index + 1} | learner-text-candidate | — |
| src/components/StageProgress.tsx:17:19 | text | {learnerCopy.stageLabels[stage]} | learner-text-candidate | — |
| src/components/StageProgress.tsx:18:20 | text | {state === "complete" ? "완료" : state === "current" ? "지금" : "잠김"} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/components/StageProgress.tsx:18:45 | text | 완료 | learner-text-candidate | repeated-text |
| src/components/StageProgress.tsx:18:74 | text | 지금 | learner-text-candidate | — |
| src/components/StageProgress.tsx:18:81 | text | 잠김 | learner-text-candidate | — |
| src/components/UpdateHistoryButton.tsx:9:47 | text | (null); return ( | learner-text-candidate | technical-or-internal |
| src/components/UpdateHistoryButton.tsx:13:142 | text | dialog | button-or-action | — |
| src/components/UpdateHistoryButton.tsx:13:165 | text | update-history-dialog | button-or-action | — |
| src/components/UpdateHistoryButton.tsx:13:221 | text | OPEN_UPDATE_DIALOG | button-or-action | — |
| src/components/UpdateHistoryButton.tsx:13:245 | text | 업데이트 내역 | button-or-action | repeated-text |
| src/components/UpdateHistoryButton.tsx:16:57 | title | 업데이트 내역 | title | repeated-text |
| src/components/UpdateHistoryButton.tsx:16:160 | text | CLOSE_UPDATE_DIALOG | learner-text-candidate | — |
| src/data/learnerCopy.ts:4:45 | text | ; analysisTerms: Record | learner-text-candidate | — |
| src/data/learnerCopy.ts:5:40 | text | ; reportHints: Record | hint | — |
| src/data/learnerCopy.ts:12:16 | text | 안내 | instruction | repeated-text |
| src/data/learnerCopy.ts:13:17 | text | 관계 설계 | learner-text-candidate | repeated-text |
| src/data/learnerCopy.ts:14:16 | text | 일정표 | learner-text-candidate | repeated-text |
| src/data/learnerCopy.ts:15:18 | text | 가상 실행 | learner-text-candidate | repeated-text |
| src/data/learnerCopy.ts:16:16 | text | 병목 분석 | learner-text-candidate | abstract-or-formal, repeated-text |
| src/data/learnerCopy.ts:17:16 | text | 수정 | learner-text-candidate | repeated-text |
| src/data/learnerCopy.ts:18:14 | text | 개선 보고서 | learner-text-candidate | repeated-text |
| src/data/learnerCopy.ts:21:18 | text | 뒤 작업을 기다리게 만든 곳 | learner-text-candidate | — |
| src/data/learnerCopy.ts:22:29 | text | 긴 작업이 아니라 뒤 작업을 기다리게 만든 곳을 찾아보세요. | learner-text-candidate | — |
| src/data/learnerCopy.ts:23:13 | text | 기다림의 원인 | learner-text-candidate | — |
| src/data/learnerCopy.ts:24:24 | text | 어떤 원인 때문에 뒤 작업이 기다렸는지 살펴보세요. | learner-text-candidate | multiple-conditions |
| src/data/learnerCopy.ts:25:18 | text | 내가 먼저 예상한 이유 | learner-text-candidate | — |
| src/data/learnerCopy.ts:26:29 | text | 실행하기 전에 내가 먼저 예상한 이유를 적어 보세요. | learner-text-candidate | — |
| src/data/learnerCopy.ts:27:12 | text | 뒤 작업으로 이어진 흐름 | learner-text-candidate | — |
| src/data/learnerCopy.ts:30:18 | text | 앞 작업이 끝나야 다음 작업을 시작할 수 있는 까닭을 살펴보세요. | learner-text-candidate | — |
| src/data/learnerCopy.ts:31:16 | text | 서로 기다리지 않고 함께 할 수 있는 두 작업을 찾아보세요. | learner-text-candidate | — |
| src/data/learnerCopy.ts:32:18 | text | 뒤 작업을 기다리게 만든 원인 | learner-text-candidate | — |
| src/data/learnerCopy.ts:33:16 | text | 시간뿐 아니라 안전·품질·협력을 함께 지키는 방법을 생각해 보세요. | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:3:21 | text | 모든 시간은 교육용 가상 단위이며 실제 작업 수행 시간을 예측하지 않습니다. | learner-text-candidate | abstract-or-formal, repeated-text |
| src/data/scenarios/classPresentation.ts:7:11 | text | 교실 발표 준비 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:8:13 | text | 대본과 자료를 준비하고 교실 발표를 연습합니다. | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:11:12 | text | A | learner-text-candidate | repeated-text |
| src/data/scenarios/classPresentation.ts:11:24 | text | 역할 A | learner-text-candidate | repeated-text |
| src/data/scenarios/classPresentation.ts:12:12 | text | B | learner-text-candidate | repeated-text |
| src/data/scenarios/classPresentation.ts:12:24 | text | 역할 B | learner-text-candidate | repeated-text |
| src/data/scenarios/classPresentation.ts:13:12 | text | C | learner-text-candidate | repeated-text |
| src/data/scenarios/classPresentation.ts:13:24 | text | 역할 C | learner-text-candidate | repeated-text |
| src/data/scenarios/classPresentation.ts:16:12 | text | audio-device | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:16:35 | text | 음향 확인 기기 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:17:12 | text | practice-zone | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:17:36 | text | 합동 연습 공간 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:23:15 | text | 대본 확인 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:29:27 | text | verify-script:quality | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:29:58 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/classPresentation.ts:29:76 | text | 빠진 내용과 어려운 낱말을 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:35:15 | text | 자료 넘김 신호 정하기 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:37:77 | text | 대본을 먼저 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:41:27 | text | assign-slide-cues:quality | learner-text-candidate | technical-or-internal |
| src/data/scenarios/classPresentation.ts:41:62 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/classPresentation.ts:41:80 | text | 말과 화면 전환 신호를 맞춥니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:47:15 | text | 발표 말하기 연습 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:49:76 | text | 대본을 확인한 뒤 말하기를 연습합니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:53:27 | text | practice-speaking:safety | feedback-or-error | — |
| src/data/scenarios/classPresentation.ts:53:61 | text | safety | feedback-or-error | repeated-text |
| src/data/scenarios/classPresentation.ts:53:78 | text | 목소리 휴식을 실패나 낭비로 표현하지 않습니다 | feedback-or-error | — |
| src/data/scenarios/classPresentation.ts:59:15 | text | 자료 넘김 연습 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:61:80 | text | 넘김 신호를 정한 뒤 연습합니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:65:27 | text | practice-slide-turning:quality | learner-text-candidate | technical-or-internal |
| src/data/scenarios/classPresentation.ts:65:67 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/classPresentation.ts:65:85 | text | 모든 자료 순서를 한 번 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:71:15 | text | 음향 점검 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:73:77 | text | 대본 확인 뒤 음향을 점검합니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:77:27 | text | test-audio:safety | instruction | — |
| src/data/scenarios/classPresentation.ts:77:54 | text | safety | instruction | repeated-text |
| src/data/scenarios/classPresentation.ts:77:71 | text | 실제 전기 장비 조작을 지시하지 않습니다 | instruction | — |
| src/data/scenarios/classPresentation.ts:83:15 | text | 최종 합동 연습 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:86:66 | text | 말하기 연습을 마친 뒤 합동 연습을 합니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:87:71 | text | 자료 넘김 연습을 마친 뒤 합동 연습을 합니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:88:59 | text | 음향 점검을 마친 뒤 합동 연습을 합니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:96:27 | text | joint-rehearsal:quality | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:96:60 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/classPresentation.ts:96:78 | text | 개별 준비 뒤 합동 연습을 합니다 | learner-text-candidate | — |
| src/data/scenarios/classPresentation.ts:102:18 | text | 개별 준비와 합동 연습의 관계를 공개적으로 설명합니다. | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:3:21 | text | 모든 시간은 교육용 가상 단위이며 실제 작업 수행 시간을 예측하지 않습니다. | learner-text-candidate | abstract-or-formal, repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:7:11 | text | 환경 캠페인 부스 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:8:13 | text | 환경 캠페인 부스를 안전하게 가상 배치합니다. | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:11:12 | text | A | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:11:24 | text | 역할 A | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:12:12 | text | B | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:12:24 | text | 역할 B | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:13:12 | text | C | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:13:24 | text | 역할 C | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:16:12 | text | sign-kit | instruction | — |
| src/data/scenarios/ecoCampaignBooth.ts:16:31 | text | 안내판 꾸러미 | instruction | — |
| src/data/scenarios/ecoCampaignBooth.ts:17:12 | text | aisle-map | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:17:32 | text | 통로 지도 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:23:15 | text | 캠페인 내용 확인 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:29:27 | text | confirm-message:quality | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:29:60 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:29:78 | text | 실천 문장을 정확히 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:31:18 | text | make-guide-board | learner-text-candidate | missing-term-explanation, technical-or-internal |
| src/data/scenarios/ecoCampaignBooth.ts:31:38 | text | make-bin-labels | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:31:57 | text | plan-role-rotation | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:35:15 | text | 안내판 준비 | instruction | — |
| src/data/scenarios/ecoCampaignBooth.ts:37:78 | text | 캠페인 내용을 확인한 뒤 안내판을 준비합니다 | instruction | — |
| src/data/scenarios/ecoCampaignBooth.ts:41:27 | text | make-guide-board:quality | learner-text-candidate | technical-or-internal |
| src/data/scenarios/ecoCampaignBooth.ts:41:61 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:41:79 | text | 큰 글씨와 그림 설명을 함께 씁니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:46:12 | text | make-bin-labels | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:47:15 | text | 분리함 표지 준비 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:49:78 | text | 캠페인 내용을 확인한 뒤 표지를 준비합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:53:27 | text | make-bin-labels:quality | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:53:60 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:53:78 | text | 표지의 글과 그림을 함께 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:59:15 | text | 역할 교대 순서 정하기 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:61:79 | text | 캠페인 내용을 확인한 뒤 교대 순서를 정합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:65:27 | text | plan-role-rotation:safety | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:65:62 | text | safety | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:65:79 | text | 한 역할에 일이 계속 몰리지 않게 합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:71:15 | text | 안전 통로 점검 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:74:64 | text | 안내판 준비 뒤 통로를 점검합니다 | instruction | — |
| src/data/scenarios/ecoCampaignBooth.ts:75:20 | text | make-bin-labels | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:75:45 | text | safety | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:75:63 | text | 분리함 표지 준비 뒤 통로를 점검합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:80:27 | text | check-safe-path:safety | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:80:59 | text | safety | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:80:76 | text | 통로 폭을 가상 배치도에서 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:86:15 | text | 부스 배치 확인 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:89:66 | text | 안내판 준비 뒤 가상 부스를 배치합니다 | instruction | — |
| src/data/scenarios/ecoCampaignBooth.ts:90:20 | text | make-bin-labels | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:90:45 | text | workflow | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:90:65 | text | 분리함 표지 준비 뒤 가상 부스를 배치합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:91:68 | text | 역할 교대 순서를 정한 뒤 배치합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:96:27 | text | set-up-booth:safety | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:96:56 | text | safety | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:96:73 | text | 실제 설치 작업이 아닌 가상 배치만 합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:102:15 | text | 최종 안전·품질 확인 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:105:63 | text | 안전 통로 점검 뒤 최종 확인을 합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:106:61 | text | 부스 배치 확인 뒤 최종 확인을 합니다 | learner-text-candidate | multiple-actions |
| src/data/scenarios/ecoCampaignBooth.ts:112:16 | text | final-safety-walkthrough:safety | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:112:57 | text | safety | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:112:74 | text | 통로를 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:113:16 | text | final-safety-walkthrough:quality | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:113:58 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/ecoCampaignBooth.ts:113:76 | text | 역할 교대를 함께 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/ecoCampaignBooth.ts:120:18 | text | 안전과 품질 근거가 만나는 최종 점검을 설명합니다. | learner-text-candidate | — |
| src/data/scenarios/index.ts:19:35 | text | Unknown scenario: ${id} | feedback-or-error | technical-or-internal |
| src/data/scenarios/libraryCart.ts:3:21 | text | 모든 시간은 교육용 가상 단위이며 실제 작업 수행 시간을 예측하지 않습니다. | learner-text-candidate | abstract-or-formal, repeated-text |
| src/data/scenarios/libraryCart.ts:7:11 | text | 도서 반납 카트 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:8:13 | text | 반납 도서를 구역별로 확인하고 정리합니다. | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:11:12 | text | A | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:11:24 | text | 역할 A | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:12:12 | text | B | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:12:24 | text | 역할 B | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:13:12 | text | C | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:13:24 | text | 역할 C | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:15:22 | text | return-cart | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:15:44 | text | 반납 카트 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:20:15 | text | 반납 목록 확인 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:26:27 | text | check-return-list:quality | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:26:62 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:26:80 | text | 책 수와 목록 수를 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:32:15 | text | 선반 구역별 분류 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:34:81 | text | 반납 목록을 먼저 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:38:27 | text | sort-sections:quality | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:38:58 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:38:76 | text | 구역 표지를 보고 분류합니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:44:15 | text | 파손 여부 확인 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:46:80 | text | 목록을 확인한 뒤 파손 여부를 살핍니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:50:27 | text | inspect-damage:safety | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:50:58 | text | safety | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:50:75 | text | 무거운 더미를 들지 않고 한 권씩 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:56:15 | text | 수리 필요 책 표시 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:58:77 | text | 파손 여부 확인 뒤 수리 책을 표시합니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:62:27 | text | mark-repair-books:quality | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:62:62 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:62:80 | text | 수리 책은 선반 배치 대상에서 분리합니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:68:15 | text | 선반용 책 싣기 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:71:63 | text | 구역별 분류 뒤 선반용 책을 싣습니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:72:63 | text | 파손 여부를 확인한 책만 싣습니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:77:27 | text | load-shelf-books:safety | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:77:60 | text | safety | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:77:77 | text | 카트 한 대의 사용 순서를 지킵니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:83:15 | text | 수리 책 이동 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:85:80 | text | 수리 필요 책을 표시한 뒤 이동합니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:89:27 | text | move-repair-books:safety | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:89:61 | text | safety | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:89:78 | text | 이동 통로를 먼저 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:95:15 | text | 선반 구역 최종 확인 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:98:66 | text | 선반용 책을 실은 뒤 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:99:66 | text | 수리 책 이동 뒤 최종 확인을 합니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:104:27 | text | final-zone-check:quality | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:104:61 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/libraryCart.ts:104:79 | text | 확인 전에는 선반 배치를 완료로 보지 않습니다 | learner-text-candidate | — |
| src/data/scenarios/libraryCart.ts:110:18 | text | 공유 자원과 안전한 이동 순서를 근거로 설명합니다. | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:3:21 | text | 모든 시간은 교육용 가상 단위이며 실제 작업 수행 시간을 예측하지 않습니다. | learner-text-candidate | abstract-or-formal, repeated-text |
| src/data/scenarios/scienceDisplay.ts:7:11 | text | 과학 전시판 준비 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:8:13 | text | 자료를 확인하고 과학 전시판을 완성합니다. | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:11:12 | text | A | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:11:24 | text | 역할 A | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:12:12 | text | B | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:12:24 | text | 역할 B | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:13:12 | text | C | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:13:24 | text | 역할 C | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:15:22 | text | printer | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:15:40 | text | 프린터 | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:20:15 | text | 자료 확인 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:26:27 | text | verify-content:quality | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:26:59 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:26:77 | text | 출처와 제목을 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:32:15 | text | 인쇄 글 정리 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:34:77 | text | 확인한 글만 인쇄 파일에 넣습니다 | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:38:27 | text | prepare-print-file:quality | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:38:63 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:38:81 | text | 확인한 글만 인쇄 파일에 넣습니다 | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:44:15 | text | 글 인쇄 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:46:82 | text | 인쇄 파일을 먼저 정리합니다 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:50:27 | text | print-text:safety | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:50:54 | text | safety | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:50:71 | text | 프린터는 가상 자원으로만 다룹니다 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:56:15 | text | 그림 배치 준비 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:58:77 | text | 자료 확인 뒤 그림을 준비합니다 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:62:27 | text | prepare-illustrations:quality | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:62:66 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:62:84 | text | 그림과 설명의 짝을 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:68:15 | text | 글과 그림 부착 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:71:59 | text | 인쇄한 글을 확인하고 부착합니다 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:72:70 | text | 준비한 그림을 확인하고 부착합니다 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:77:27 | text | attach-materials:safety | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:77:60 | text | safety | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:77:77 | text | 통로를 막지 않는 책상 위에서 진행합니다 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:83:15 | text | 최종 점검 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:85:79 | text | 부착을 마친 뒤 최종 점검을 합니다 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:89:27 | text | final-review:quality | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:89:57 | text | quality | learner-text-candidate | repeated-text |
| src/data/scenarios/scienceDisplay.ts:89:75 | text | 제목·글·그림 누락을 함께 확인합니다 | learner-text-candidate | — |
| src/data/scenarios/scienceDisplay.ts:95:18 | text | 선행 작업과 품질 근거를 공개적으로 연결합니다. | learner-text-candidate | — |
| src/data/updateHistory.ts:5:14 | text | 설계 | learner-text-candidate | repeated-text |
| src/data/updateHistory.ts:5:21 | text | 개발 | learner-text-candidate | repeated-text |
| src/data/updateHistory.ts:5:28 | text | 개선 | learner-text-candidate | repeated-text |
| src/data/updateHistory.ts:10:36 | text | 설계 | learner-text-candidate | repeated-text |
| src/data/updateHistory.ts:10:55 | text | 최초 설계 문서 작성 | learner-text-candidate | — |
| src/data/updateHistory.ts:11:36 | text | 개발 | learner-text-candidate | repeated-text |
| src/data/updateHistory.ts:11:55 | text | MVP 구현과 네 시나리오 검수 | learner-text-candidate | technical-or-internal |
| src/data/updateHistory.ts:12:36 | text | 개선 | learner-text-candidate | repeated-text |
| src/data/updateHistory.ts:12:55 | text | AppProvider 손상 저장 복구 개선 | learner-text-candidate | missing-term-explanation, technical-or-internal |
| src/data/updateHistory.ts:13:36 | text | 개선 | instruction | repeated-text |
| src/data/updateHistory.ts:13:55 | text | 학습자 안내·모바일 탐색 흐름 개선 | instruction | — |
| src/data/updateHistory.ts:14:36 | text | 개선 | learner-text-candidate | repeated-text |
| src/data/updateHistory.ts:14:55 | text | 전체 학습 화면 계층과 모바일 읽기 순서 개선 | learner-text-candidate | — |
| src/data/updateHistory.ts:15:36 | text | 개선 | learner-text-candidate | repeated-text |
| src/data/updateHistory.ts:15:55 | text | 상태 강조 테두리와 근거 진행률 움직임 정돈 | learner-text-candidate | — |
| src/domain/bottleneckAnalyzer.ts:28:72 | text | 가 | learner-text-candidate | — |
| src/domain/bottleneckAnalyzer.ts:28:78 | text | 이 | learner-text-candidate | — |
| src/domain/bottleneckAnalyzer.ts:73:8 | text | 이후 ${affectedTaskIds.map((id) => taskTitle(scenario, id)).join(", ")}도 함께 늦어졌습니다. | learner-text-candidate | long-or-dense, technical-or-internal |
| src/domain/bottleneckAnalyzer.ts:77:13 | text | ${resource} 사용을 기다려 ${blocked}${particle(blocked)} ${delayUnits}단위 늦어졌습니다${affected} | learner-text-candidate | long-or-dense |
| src/domain/bottleneckAnalyzer.ts:81:13 | text | ${role}이(가) 맡은 작업을 기다려 ${blocked}${particle(blocked)} ${delayUnits}단위 늦어졌습니다${affected} | learner-text-candidate | long-or-dense |
| src/domain/bottleneckAnalyzer.ts:85:13 | text | ${blocker}${particle(blocker)} 끝나기를 기다려 ${blocked}${particle(blocked)} ${delayUnits}단위 늦어졌습니다${affected} | learner-text-candidate | long-or-dense |
| src/domain/bottleneckAnalyzer.ts:87:11 | text | 다른 작업이 끝나기를 기다려 ${blocked}${particle(blocked)} ${delayUnits}단위 늦어졌습니다${affected} | learner-text-candidate | long-or-dense |
| src/domain/bottleneckAnalyzer.ts:143:38 | text | resource | learner-text-candidate | repeated-text |
| src/domain/bottleneckAnalyzer.ts:147:77 | text | 다른 작업 | learner-text-candidate | — |
| src/domain/comparison.ts:12:16 | text | ${Math.abs(value)}단위 감소 | learner-text-candidate | — |
| src/domain/comparison.ts:12:56 | text | ${value}단위 증가 | learner-text-candidate | — |
| src/domain/comparison.ts:12:74 | text | ${unit} 변화 없음 | learner-text-candidate | — |
| src/domain/comparison.ts:38:35 | text | 안전 조건 | learner-text-candidate | repeated-text |
| src/domain/comparison.ts:39:36 | text | 품질 조건 | learner-text-candidate | repeated-text |
| src/domain/comparison.ts:42:8 | text | 역할 공정성을 유지했습니다. | learner-text-candidate | — |
| src/domain/comparison.ts:44:10 | text | 역할 공정성을 유지하지 못했습니다. | learner-text-candidate | shaming-tone |
| src/domain/comparison.ts:46:12 | text | 역할 공정성이 개선되었습니다. | learner-text-candidate | — |
| src/domain/comparison.ts:47:12 | text | 역할 공정성 조건이 아직 충족되지 않았습니다. | learner-text-candidate | — |
| src/domain/comparison.ts:48:37 | text | ${lost.join(", ")}을 유지하지 못했습니다. | learner-text-candidate | shaming-tone |
| src/domain/comparison.ts:52:8 | text | 안전·품질·역할 공정성을 유지했습니다. | learner-text-candidate | — |
| src/domain/comparison.ts:59:15 | text | ${prefix}${conditionSummary} 전체 시간 ${quantityChange(finishDelta, "시간")}, 대기 ${quantityChange(waitDelta, "대기단위")}입니다. | learner-text-candidate | long-or-dense |
| src/domain/evaluator.ts:13:63 | text | task.id === id)?.title ?? id); if (labels.length === 1) return `${labels[0]} 작업이 빠졌습니다.`; return `${labels.join(", ")} 작업이 빠졌습니다.`; }; const roleLoads = (scenario: ScenarioDefinition, runs: readonly TaskRun[]): Readonly | learner-text-candidate | long-or-dense, technical-or-internal |
| src/domain/evaluator.ts:14:36 | text | ${labels[0]} 작업이 빠졌습니다. | learner-text-candidate | — |
| src/domain/evaluator.ts:15:11 | text | ${labels.join(", ")} 작업이 빠졌습니다. | learner-text-candidate | — |
| src/domain/evaluator.ts:56:112 | text | 실행 기록 | learner-text-candidate | repeated-text |
| src/domain/evaluator.ts:57:52 | text | 모든 작업이 완료되지 않았습니다: ${details}. | learner-text-candidate | — |
| src/domain/evaluator.ts:58:20 | text | 완료 조건이 충족되지 않았습니다: 모든 작업을 실행하고 막힌 작업을 확인하세요. | feedback-or-error | — |
| src/domain/evaluator.ts:61:30 | text | safety | learner-text-candidate | repeated-text |
| src/domain/evaluator.ts:61:49 | text | 안전 필수 작업이 빠졌습니다: ${titles(scenario, safetyMissing)}. | learner-text-candidate | long-or-dense |
| src/domain/evaluator.ts:62:20 | text | 완료 조건이 충족되지 않았습니다: ${missingFeedback(scenario, safetyMissing)} | feedback-or-error | long-or-dense |
| src/domain/evaluator.ts:65:30 | text | quality | learner-text-candidate | repeated-text |
| src/domain/evaluator.ts:65:50 | text | 품질 필수 작업이 빠졌습니다: ${titles(scenario, qualityMissing)}. | learner-text-candidate | long-or-dense |
| src/domain/evaluator.ts:66:20 | text | 완료 조건이 충족되지 않았습니다: ${missingFeedback(scenario, qualityMissing)} | feedback-or-error | long-or-dense |
| src/domain/evaluator.ts:69:51 | text | 역할 참여 수 또는 역할별 부하 차이가 시나리오 조건을 충족하지 않습니다. | learner-text-candidate | — |
| src/domain/evaluator.ts:70:20 | text | 역할 공정성 조건이 충족되지 않았습니다: 참여 역할 수와 역할별 가상 부하 차이를 확인하세요. | feedback-or-error | — |
| src/domain/evaluator.ts:73:47 | text | 목표 시간이 ${result.finishTime - scenario.timeGoal}단위 초과되었습니다. | learner-text-candidate | long-or-dense |
| src/domain/evaluator.ts:74:20 | text | 목표 시간 ${scenario.timeGoal}단위 안에 완료하도록 시작 시점을 다시 살펴보세요. | feedback-or-error | long-or-dense |
| src/domain/scenarioValidation.ts:13:57 | text | id)); if (taskIds.size !== scenario.tasks.length) throw new Error(`${scenario.id}: duplicate task id`); if (scenario.tasks.length | feedback-or-error | long-or-dense, technical-or-internal |
| src/domain/scenarioValidation.ts:14:64 | text | ${scenario.id}: duplicate task id | feedback-or-error | technical-or-internal |
| src/domain/scenarioValidation.ts:16:22 | text | ${scenario.id}: task count must be 5..7 | feedback-or-error | technical-or-internal |
| src/domain/scenarioValidation.ts:24:24 | text | ${task.id}: duration must be a positive integer | feedback-or-error | technical-or-internal |
| src/domain/scenarioValidation.ts:26:65 | text | ${scenario.id}: empty task id or title | feedback-or-error | technical-or-internal |
| src/domain/scenarioValidation.ts:28:61 | text | ${task.id}: unknown prerequisite ${dependency.taskId} | feedback-or-error | long-or-dense, technical-or-internal |
| src/domain/scenarioValidation.ts:29:59 | text | ${task.id}: self dependency | feedback-or-error | technical-or-internal |
| src/domain/scenarioValidation.ts:30:55 | text | ${task.id}: empty prerequisite reason | feedback-or-error | technical-or-internal |
| src/domain/scenarioValidation.ts:35:52 | text | ${task.id}: unknown resource ${requirement.resourceId} | feedback-or-error | long-or-dense, technical-or-internal |
| src/domain/scenarioValidation.ts:36:61 | text | ${task.id}: resource quantity exceeds capacity | feedback-or-error | technical-or-internal |
| src/domain/scenarioValidation.ts:39:77 | text | ${task.id}: empty condition | feedback-or-error | technical-or-internal |
| src/domain/scenarioValidation.ts:46:65 | text | ${task.id}: unknown unlock target | feedback-or-error | technical-or-internal |
| src/domain/scenarioValidation.ts:48:24 | text | ${task.id}: unlock reverse index mismatch | feedback-or-error | technical-or-internal |
| src/domain/simulator.ts:55:46 | text | 예약할 수 없는 작업입니다: ${entry.taskId} | learner-text-candidate | technical-or-internal |
| src/domain/simulator.ts:76:24 | text | 1) { invalidTaskIds.add(taskId); for (const candidate of sorted) issues.push(makeIssue("duplicate-entry", "같은 작업을 두 번 예약할 수 없습니다.", candidate.taskId)); continue; } const entry = sorted[0]!; let valid = true; if (!Number.isSafeInteger(entry.plannedStart) \|\| entry.plannedStart | learner-text-candidate | long-or-dense, technical-or-internal |
| src/domain/simulator.ts:78:81 | text | 같은 작업을 두 번 예약할 수 없습니다. | learner-text-candidate | — |
| src/domain/simulator.ts:84:55 | text | 시작 시점은 0 이상의 정수여야 합니다. | learner-text-candidate | — |
| src/domain/simulator.ts:89:52 | text | 이 작업에는 역할 ${task.peopleRequired}명이 필요합니다. | learner-text-candidate | repeated-text |
| src/domain/simulator.ts:93:48 | text | 한 작업에 같은 역할을 두 번 배정할 수 없습니다. | learner-text-candidate | — |
| src/domain/simulator.ts:97:46 | text | 등록되지 않은 역할입니다. | learner-text-candidate | — |
| src/domain/simulator.ts:102:62 | text | 작업의 자원 요구를 충족할 수 없습니다. | learner-text-candidate | — |
| src/domain/simulator.ts:151:48 | text | 유효하지 않은 관계입니다: ${edgeKey(edge)} | learner-text-candidate | abstract-or-formal |
| src/domain/simulator.ts:155:46 | text | 0) { issues.push(makeIssue("cyclic-relation", "순환 관계는 실행할 수 없습니다.")); } const predecessors = new Map | learner-text-candidate | long-or-dense |
| src/domain/simulator.ts:156:47 | text | 순환 관계는 실행할 수 없습니다. | learner-text-candidate | — |
| src/domain/simulator.ts:187:55 | text | 시작 시점과 작업 시간의 계산 범위를 벗어났습니다. | learner-text-candidate | — |
| src/domain/simulator.ts:307:48 | text | 시뮬레이션 상한 안에서 실행되지 않았습니다. | learner-text-candidate | — |
| src/domain/teacherSummary.ts:14:21 | text | 이 결과는 교육용 가상 모델이며 실제 사람의 생산성 평가에 사용할 수 없습니다. | learner-text-candidate | repeated-text |
| src/domain/teacherSummary.ts:23:22 | text | Teacher summary requires a revised comparison | feedback-or-error | — |
| src/domain/teacherSummary.ts:34:8 | text | 안전 조건 ${metrics.safetyMet ? "충족" : "미충족"} | learner-text-candidate | — |
| src/domain/teacherSummary.ts:35:8 | text | 품질 조건 ${metrics.qualityMet ? "충족" : "미충족"} | learner-text-candidate | — |
| src/domain/teacherSummary.ts:36:8 | text | 역할 공정성 ${metrics.fairnessMet ? "충족" : "미충족"} | learner-text-candidate | — |
| src/domain/types.ts:53:26 | text | A | learner-text-candidate | repeated-text |
| src/domain/types.ts:53:32 | text | B | learner-text-candidate | repeated-text |
| src/domain/types.ts:53:38 | text | C | learner-text-candidate | repeated-text |
| src/features/analysis/AnalysisScreen.tsx:20:16 | text | 선행 작업 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:21:14 | text | 공유 도구 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:22:10 | text | 역할 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:23:10 | text | 혼자 하는 작업 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:34:16 | text | 이 대기가 뒤 작업의 시작을 늦췄습니다. 이제 수정할 수 있습니다. | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:43:69 | text | task.id === taskId)?.title ?? "해당 작업"; const taskPath = selectedFinding ? [selectedFinding.blockerLabel, titleFor(selectedFinding.blockedTaskId), ...selectedFinding.affectedTaskIds.map(titleFor)].join(" → ") : null; return ( | learner-text-candidate | ambiguous-reference, long-or-dense, technical-or-internal |
| src/features/analysis/AnalysisScreen.tsx:43:101 | text | 해당 작업 | learner-text-candidate | ambiguous-reference, repeated-text |
| src/features/analysis/AnalysisScreen.tsx:49:59 | text | analysis-screen-title | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:50:38 | text | 병목 분석 | heading | abstract-or-formal, repeated-text |
| src/features/analysis/AnalysisScreen.tsx:53:37 | text | 전체 대기: {snapshot.bottlenecks.totalWaitUnits}단위 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:54:71 | text | analysis-observation-title | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:55:45 | text | 실행 기록 관찰 | heading | — |
| src/features/analysis/AnalysisScreen.tsx:56:12 | text | 원인과 늦어진 작업, 대기 시간을 함께 비교한 뒤 병목을 선택하세요. | learner-text-candidate | multiple-actions |
| src/features/analysis/AnalysisScreen.tsx:57:20 | text | 기다림 | learner-text-candidate | repeated-text |
| src/features/analysis/AnalysisScreen.tsx:57:32 | text | {snapshot.bottlenecks.totalWaitUnits}단위 · | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:57:83 | text | 선택 상태 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:57:97 | text | {selectedFindingId ? "병목 선택됨" : "아직 선택하지 않음"} | learner-text-candidate | multiple-actions, technical-or-internal |
| src/features/analysis/AnalysisScreen.tsx:57:120 | text | 병목 선택됨 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:57:131 | text | 아직 선택하지 않음 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:67:9 | text | {selectedFinding && | learner-text-candidate | repeated-text |
| src/features/analysis/AnalysisScreen.tsx:68:82 | text | selected-finding-title | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:69:41 | text | 선택한 {learnerCopy.analysisTerms.cause} | heading | — |
| src/features/analysis/AnalysisScreen.tsx:70:15 | text | 원인 | learner-text-candidate | repeated-text |
| src/features/analysis/AnalysisScreen.tsx:71:15 | text | 실제 지연 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:71:24 | text | {selectedFinding.delayUnits}단위 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:72:15 | text | 설명 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:75:63 | text | prediction-record-title | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:78:67 | text | {prediction ? reasonLabel[prediction] : "예측하지 않음"}{predictionExplanation ? ` — ${predictionExplanation}` : ""} | learner-text-candidate | long-or-dense |
| src/features/analysis/AnalysisScreen.tsx:78:108 | text | 예측하지 않음 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:78:143 | text | — ${predictionExplanation} | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:79:20 | text | 실행 기록 | learner-text-candidate | repeated-text |
| src/features/analysis/AnalysisScreen.tsx:79:34 | text | {selectedFinding ? `${selectedFinding.blockerLabel} 때문에 ${selectedFinding.delayUnits}단위 기다림이 기록되었습니다.` : "기다림 없음"} | learner-text-candidate | long-or-dense, multiple-conditions |
| src/features/analysis/AnalysisScreen.tsx:79:54 | text | ${selectedFinding.blockerLabel} 때문에 ${selectedFinding.delayUnits}단위 기다림이 기록되었습니다. | learner-text-candidate | long-or-dense, multiple-conditions |
| src/features/analysis/AnalysisScreen.tsx:79:140 | text | 기다림 없음 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:85:135 | text | 병목 표시 | learner-text-candidate | — |
| src/features/analysis/AnalysisScreen.tsx:85:163 | text | {canStart && | button-or-action | — |
| src/features/analysis/AnalysisScreen.tsx:86:72 | text | 수정 시작 | button-or-action | repeated-text |
| src/features/analysis/AnalysisScreen.tsx:89:57 | text | 수정 시작 | button-or-action | repeated-text |
| src/features/analysis/BottleneckPanel.tsx:11:45 | text | findings | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:11:65 | text | type | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:11:80 | text | = { "dependency-path": "선행 관계 대기", "resource-wait": "공유 도구 대기", "role-wait": "역할 대기", "solo-wait": "혼자 하는 작업 대기", }; export function BottleneckPanel({ analysis, selectedFindingId, onSelect, scenario }: BottleneckPanelProps) { if (analysis.findings.length === 0) { return | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/analysis/BottleneckPanel.tsx:12:23 | text | 선행 관계 대기 | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:13:21 | text | 공유 도구 대기 | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:14:17 | text | 역할 대기 | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:15:17 | text | 혼자 하는 작업 대기 | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:20:44 | text | 이번 실행에서는 기록된 기다림이 없습니다. | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:20:71 | text | ; } return ( | learner-text-candidate | repeated-text |
| src/features/analysis/BottleneckPanel.tsx:24:60 | text | bottleneck-panel-title | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:26:10 | text | 긴 작업이라고 모두 병목은 아닙니다. | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:28:71 | aria-label | 병목 원인 선택 | aria-label | repeated-text |
| src/features/analysis/BottleneckPanel.tsx:30:110 | text | 해당 작업 | learner-text-candidate | ambiguous-reference, repeated-text |
| src/features/analysis/BottleneckPanel.tsx:32:60 | text | 0 ? finding.affectedTaskIds.map(titleFor).join(" → ") : "없음"; const path = [finding.blockerLabel, blocked, ...finding.affectedTaskIds.map(titleFor)].join(" → "); return ( | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/analysis/BottleneckPanel.tsx:32:118 | text | 없음 | learner-text-candidate | repeated-text |
| src/features/analysis/BottleneckPanel.tsx:42:30 | text | ${finding.blockerLabel}를 ${finding.delayUnits}단위 기다림. ${finding.explanation} | learner-text-candidate | long-or-dense |
| src/features/analysis/BottleneckPanel.tsx:45:25 | text | {`병목 ${index + 1}: ${typeLabel[finding.type]}`} | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:45:27 | text | 병목 ${index + 1}: ${typeLabel[finding.type]} | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:46:55 | text | 원인 | learner-text-candidate | repeated-text |
| src/features/analysis/BottleneckPanel.tsx:47:26 | text | 늦어진 작업 | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:48:26 | text | 대기 | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:48:32 | text | {finding.delayUnits}단위 | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:49:26 | text | 영향받은 뒤 작업 | learner-text-candidate | — |
| src/features/analysis/BottleneckPanel.tsx:50:26 | text | 텍스트 경로 | learner-text-candidate | — |
| src/features/briefing/BriefingScreen.tsx:18:34 | text | { dispatch({ type: "ACKNOWLEDGE_CONDITIONS" }); dispatch({ type: "ENTER_STAGE", stage: "relations" }); }; return ( | learner-text-candidate | long-or-dense |
| src/features/briefing/BriefingScreen.tsx:24:59 | text | briefing-title | learner-text-candidate | — |
| src/features/briefing/BriefingScreen.tsx:25:31 | text | 의뢰 접수 | heading | — |
| src/features/briefing/BriefingScreen.tsx:28:43 | text | 다음 행동: 조건을 읽고 | learner-text-candidate | — |
| src/features/briefing/BriefingScreen.tsx:28:60 | text | 조건 확인 | learner-text-candidate | repeated-text |
| src/features/briefing/BriefingScreen.tsx:28:69 | text | 을 눌러 관계를 연결합니다. | learner-text-candidate | — |
| src/features/briefing/BriefingScreen.tsx:29:119 | text | 조건 확인 | learner-text-candidate | repeated-text |
| src/features/briefing/BriefingScreen.tsx:31:33 | text | task-cards-title | learner-text-candidate | — |
| src/features/briefing/BriefingScreen.tsx:32:35 | text | 작업 카드 | heading | — |
| src/features/briefing/MissionOverview.tsx:5:65 | text | mission-overview-title | learner-text-candidate | — |
| src/features/briefing/MissionOverview.tsx:6:37 | text | 이번 미션 한눈에 보기 | heading | — |
| src/features/briefing/MissionOverview.tsx:7:46 | text | 여러 작업의 선후·동시 진행·제한 자원에서 생긴 기다림을 살펴보고, 도움 요청·확인·휴식도 책임 있는 협력으로 생각해요. | hint | long-or-dense, multiple-actions |
| src/features/briefing/MissionOverview.tsx:9:20 | text | 목표 | feedback-or-error | — |
| src/features/briefing/MissionOverview.tsx:9:34 | text | {scenario.timeGoal}단위 안에 끝내 보세요. 유일한 정답은 아니에요. | feedback-or-error | — |
| src/features/briefing/MissionOverview.tsx:10:20 | text | 안전·품질 | learner-text-candidate | — |
| src/features/briefing/MissionOverview.tsx:10:37 | text | 공개된 조건과 점검을 지켜요. | learner-text-candidate | — |
| src/features/briefing/MissionOverview.tsx:11:20 | text | 협력 | learner-text-candidate | — |
| src/features/briefing/MissionOverview.tsx:11:34 | text | 사람과 도구를 살펴 역할을 나눠요. | learner-text-candidate | — |
| src/features/briefing/MissionOverview.tsx:13:49 | text | 모든 작업 조건은 카드와 요약에서 미리 공개해요. 모든 시간은 교육용 가상 시간 단위예요. | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:16:61 | text | 선행 없음 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:16:71 | text | 선행: ${prerequisites.map(({ title }) => title).join(", ")} | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCard.tsx:19:8 | text | 도구 없음 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:21:61 | text | id === resource.resourceId); return `${definition?.label ?? resource.resourceId} ${resource.quantity}개`; }).join(", "); return ( | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/briefing/TaskCard.tsx:22:15 | text | ${definition?.label ?? resource.resourceId} ${resource.quantity}개 | learner-text-candidate | long-or-dense, missing-term-explanation, technical-or-internal |
| src/features/briefing/TaskCard.tsx:30:55 | text | 예상 시간 ${task.duration}단위 · ${prerequisiteSummary} · 필요한 사람 ${task.peopleRequired}명 · 도구 ${resourceCount}개${resourceCount > 0 ? | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCard.tsx:36:49 | text | 예상 시간 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:36:63 | text | {`예상 시간 ${task.duration}단위`} | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:36:65 | text | 예상 시간 ${task.duration}단위 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:38:17 | text | 먼저 할 작업 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:39:17 | text | {prerequisites.length === 0 ? "먼저 할 작업 없음" : ( | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:40:46 | text | 먼저 할 작업 없음 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:42:27 | text | 먼저: ${prerequisites.map(({ title }) => title).join(", ")} | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCard.tsx:42:65 | text | title).join(", ")}`} | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:43:83 | text | ${taskId}-reason | learner-text-candidate | missing-term-explanation, technical-or-internal |
| src/features/briefing/TaskCard.tsx:43:102 | text | {`${title} 공개 이유: ${reason}`} | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:43:104 | text | ${title} 공개 이유: ${reason} | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:49:17 | text | 사람과 도구 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:51:21 | text | {`필요한 사람 ${task.peopleRequired}명`} | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:51:23 | text | 필요한 사람 ${task.peopleRequired}명 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:53:52 | text | 필요한 도구 없음 | learner-text-candidate | repeated-text |
| src/features/briefing/TaskCard.tsx:54:73 | text | id === resource.resourceId); return | learner-text-candidate | technical-or-internal |
| src/features/briefing/TaskCard.tsx:55:56 | text | {`필요한 도구: ${definition?.label ?? resource.resourceId} ${resource.quantity}개`} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/briefing/TaskCard.tsx:55:58 | text | 필요한 도구: ${definition?.label ?? resource.resourceId} ${resource.quantity}개 | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/briefing/TaskCard.tsx:60:49 | text | 동시 진행 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:60:63 | text | {task.parallel === "solo" ? "동시에 진행: 단독 진행" : "동시에 진행: 역할·도구가 겹치지 않으면 동시 진행 가능"} | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCard.tsx:60:92 | text | 동시에 진행: 단독 진행 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:60:110 | text | 동시에 진행: 역할·도구가 겹치지 않으면 동시 진행 가능 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:62:17 | text | 안전·품질 조건 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:63:17 | text | {task.conditions.length === 0 ? "안전·품질 조건 없음" : | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:63:50 | text | 안전·품질 조건 없음 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:63:128 | text | {`${condition.kind === "safety" ? "안전" : "품질"}: ${condition.label}`} | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCard.tsx:63:130 | text | ${condition.kind === "safety" ? "안전" : "품질"}: ${condition.label} | learner-text-candidate | long-or-dense, repeated-text |
| src/features/briefing/TaskCard.tsx:65:49 | text | 끝난 뒤 열림 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:65:65 | text | {unlockTitles.length === 0 ? "이 작업이 마지막 단계입니다" : `끝난 뒤 열림: ${unlockTitles.join(", ")}`} | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCard.tsx:65:95 | text | 이 작업이 마지막 단계입니다 | learner-text-candidate | — |
| src/features/briefing/TaskCard.tsx:65:115 | text | 끝난 뒤 열림: ${unlockTitles.join(", ")} | learner-text-candidate | — |
| src/features/briefing/TaskCardSummary.tsx:9:61 | text | task-summary-title | learner-text-candidate | — |
| src/features/briefing/TaskCardSummary.tsx:10:35 | text | 작업 핵심 조건 요약 | heading | — |
| src/features/briefing/TaskCardSummary.tsx:11:76 | text | task-summary-constraints-title | learner-text-candidate | repeated-text |
| src/features/briefing/TaskCardSummary.tsx:12:49 | text | 시뮬레이터가 지키는 약속 | heading | — |
| src/features/briefing/TaskCardSummary.tsx:13:30 | text | task-summary-constraints-title | learner-text-candidate | repeated-text |
| src/features/briefing/TaskCardSummary.tsx:15:76 | text | {`${resource.label}는 한 번에 ${resource.capacity}개만 쓸 수 있어요.`} | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCardSummary.tsx:15:78 | text | ${resource.label}는 한 번에 ${resource.capacity}개만 쓸 수 있어요. | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCardSummary.tsx:17:15 | text | {`최소 ${scenario.fairness.minParticipatingRoles}개 역할이 참여해야 해요.`} | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCardSummary.tsx:17:17 | text | 최소 ${scenario.fairness.minParticipatingRoles}개 역할이 참여해야 해요. | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCardSummary.tsx:18:15 | text | {`역할별 맡은 양 차이는 ${scenario.fairness.maxLoadGap}단위 이하여야 공정해요.`} | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCardSummary.tsx:18:17 | text | 역할별 맡은 양 차이는 ${scenario.fairness.maxLoadGap}단위 이하여야 공정해요. | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCardSummary.tsx:26:16 | text | 없음 | learner-text-candidate | repeated-text |
| src/features/briefing/TaskCardSummary.tsx:29:23 | text | ${label} ${resource.quantity}개 | learner-text-candidate | — |
| src/features/briefing/TaskCardSummary.tsx:32:16 | text | 조건 없음 | learner-text-candidate | — |
| src/features/briefing/TaskCardSummary.tsx:33:49 | text | `${condition.kind === "safety" ? "안전" : "품질"}: ${condition.label}`).join(" · "); return ( | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCardSummary.tsx:33:51 | text | ${condition.kind === "safety" ? "안전" : "품질"}: ${condition.label} | learner-text-candidate | long-or-dense, repeated-text |
| src/features/briefing/TaskCardSummary.tsx:38:21 | text | {` · 예상 ${task.duration}단위 · ${prerequisiteTitles.length === 0 ? "선행 없음" : `선행: ${prerequisiteTitles.join(", ")}`} · 사람 ${task.peopleRequired}명 · 도구 ${resourceCount}개 (${resources}) · ${task.parallel === "solo" ? "단독 진행" : "역할·도구가 겹치지 않으면 동시 진행 가능"}`} | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCardSummary.tsx:38:23 | text | · 예상 ${task.duration}단위 · ${prerequisiteTitles.length === 0 ? "선행 없음" : | learner-text-candidate | long-or-dense |
| src/features/briefing/TaskCardSummary.tsx:38:134 | text | } · 사람 ${task.peopleRequired}명 · 도구 ${resourceCount}개 (${resources}) · ${task.parallel === "solo" ? "단독 진행" : "역할·도구가 겹치지 않으면 동시 진행 가능"} | learner-text-candidate | long-or-dense |
| src/features/relations/RelationBoard.tsx:50:45 | text | ${value}${hasFinalConsonant(value) ? "과" : "와"} | learner-text-candidate | — |
| src/features/relations/RelationBoard.tsx:57:34 | text | 학생이 추가한 관계입니다. 이 관계는 안전하지만 기다림이 늘어날 수 있습니다. | learner-text-candidate | — |
| src/features/relations/RelationBoard.tsx:63:124 | text | 알 수 없는 작업을 포함해 관계를 확인해야 합니다. | learner-text-candidate | multiple-conditions, repeated-text |
| src/features/relations/RelationBoard.tsx:64:135 | text | 같은 관계가 두 번 있어 하나만 남겨야 합니다. | learner-text-candidate | repeated-text |
| src/features/relations/RelationBoard.tsx:65:122 | text | 작업이 서로를 기다리는 순환 관계라 확인해야 합니다. | learner-text-candidate | multiple-conditions, repeated-text |
| src/features/relations/RelationBoard.tsx:69:49 | text | safety | learner-text-candidate | repeated-text |
| src/features/relations/RelationBoard.tsx:69:60 | text | 안전 먼저 | learner-text-candidate | — |
| src/features/relations/RelationBoard.tsx:69:79 | text | quality | learner-text-candidate | repeated-text |
| src/features/relations/RelationBoard.tsx:69:91 | text | 품질 먼저 | learner-text-candidate | — |
| src/features/relations/RelationBoard.tsx:69:101 | text | 먼저 | learner-text-candidate | — |
| src/features/relations/RelationBoard.tsx:117:35 | text | nodePositions.set(task.id, { x: 130 + depth * 180, y: 55 + index * 75 })); }); return ( | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/relations/RelationBoard.tsx:121:58 | text | relation-board-title | learner-text-candidate | — |
| src/features/relations/RelationBoard.tsx:122:37 | text | 학생이 만든 관계 | heading | — |
| src/features/relations/RelationBoard.tsx:123:71 | text | 연결한 관계 {edges.length}개 | heading | — |
| src/features/relations/RelationBoard.tsx:124:10 | text | 아래 순서 목록이 관계의 정확한 설명입니다. 선과 색은 이해를 돕는 보조 표시입니다. | learner-text-candidate | — |
| src/features/relations/RelationBoard.tsx:126:38 | text | { const { edge } = record; const before = taskTitle(scenario, edge.beforeTaskId); const after = taskTitle(scenario, edge.afterTaskId); const sentence = `${before} 다음에 ${after}: ${semanticReason(scenario, edge, validation, edges)}`; return ( | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/relations/RelationBoard.tsx:130:29 | text | ${before} 다음에 ${after}: ${semanticReason(scenario, edge, validation, edges)} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/relations/RelationBoard.tsx:134:103 | text | ${withAndParticle(before)} ${after} 관계 삭제 | button-or-action | — |
| src/features/relations/RelationBoard.tsx:134:147 | text | 삭제 | button-or-action | repeated-text |
| src/features/relations/RelationBoard.tsx:138:12 | text | {showRequirements && | heading | — |
| src/features/relations/RelationBoard.tsx:140:85 | aria-label | 관계 연결 보조 그림 | aria-label | — |
| src/features/relations/RelationBoard.tsx:140:111 | text | true | learner-text-candidate | repeated-text |
| src/features/relations/RelationBoard.tsx:161:38 | text | { const position = nodePositions.get(task.id)!; return | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/relations/RelationBoard.tsx:163:193 | text | middle | learner-text-candidate | missing-term-explanation, repeated-text, technical-or-internal |
| src/features/relations/RelationBoard.tsx:165:40 | text | { const { edge } = record; const before = nodePositions.get(edge.beforeTaskId); const after = nodePositions.get(edge.afterTaskId); if (!before \|\| !after) return null; const kind = edgeKind(scenario, edge); return | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/relations/RelationBoard.tsx:171:30 | text | ${record.key}-label | learner-text-candidate | — |
| src/features/relations/RelationBoard.tsx:171:189 | text | middle | learner-text-candidate | missing-term-explanation, repeated-text, technical-or-internal |
| src/features/relations/RelationBoard.tsx:171:197 | text | {edgeLabel(kind)} | learner-text-candidate | — |
| src/features/relations/RelationEditor.tsx:27:17 | text | 관계 연결 | learner-text-candidate | repeated-text |
| src/features/relations/RelationEditor.tsx:28:38 | text | 먼저 끝낼 작업 | learner-text-candidate | — |
| src/features/relations/RelationEditor.tsx:35:28 | text | 작업을 선택하세요 | learner-text-candidate | repeated-text |
| src/features/relations/RelationEditor.tsx:38:37 | text | 다음에 시작할 작업 | learner-text-candidate | — |
| src/features/relations/RelationEditor.tsx:45:28 | text | 작업을 선택하세요 | learner-text-candidate | repeated-text |
| src/features/relations/RelationEditor.tsx:50:38 | text | 같은 작업을 양쪽에 고를 수 없고, 이미 연결한 관계는 다시 추가할 수 없습니다. | hint | — |
| src/features/relations/RelationEditor.tsx:51:54 | text | 관계 연결 | button-or-action | repeated-text |
| src/features/relations/RelationRequirementList.tsx:16:18 | text | 이 순서를 지키면 작업의 안전과 품질을 확인할 수 있습니다. | learner-text-candidate | — |
| src/features/relations/RelationRequirementList.tsx:18:81 | text | `먼저 ${taskTitle(scenario, edge.beforeTaskId)}, 그 다음 ${taskTitle(scenario, edge.afterTaskId)} — ${requirementReason(scenario, edge)}`; export function RelationRequirementList({ scenario, missing, headingId }: RelationRequirementListProps) { return ( | heading | long-or-dense, technical-or-internal |
| src/features/relations/RelationRequirementList.tsx:19:4 | text | 먼저 ${taskTitle(scenario, edge.beforeTaskId)}, 그 다음 ${taskTitle(scenario, edge.afterTaskId)} — ${requirementReason(scenario, edge)} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/relations/RelationRequirementList.tsx:24:26 | text | 필수 관계 힌트 | heading, hint | — |
| src/features/relations/RelationRequirementList.tsx:30:12 | text | 필수 관계를 모두 연결했습니다. | learner-text-candidate | — |
| src/features/relations/RelationScreen.tsx:27:4 | text | 작업 카드에 공개된 관계를 다시 확인하세요: ${titleFor(scenario, edge.beforeTaskId)} 뒤에 ${titleFor(scenario, edge.afterTaskId)}${hasFinalConsonant(titleFor(scenario, edge.afterTaskId)) ? "을" : "를"} 시작합니다. | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/relations/RelationScreen.tsx:31:49 | text | 알 수 없는 작업을 포함해 관계를 확인해야 합니다. | learner-text-candidate | multiple-conditions, repeated-text |
| src/features/relations/RelationScreen.tsx:32:51 | text | 같은 관계가 두 번 있어 하나만 남겨야 합니다. | learner-text-candidate | repeated-text |
| src/features/relations/RelationScreen.tsx:33:54 | text | 작업이 서로를 기다리는 순환 관계라 확인해야 합니다. | learner-text-candidate | multiple-conditions, repeated-text |
| src/features/relations/RelationScreen.tsx:34:60 | text | missingMessage(scenario, edge))); return messages; }; export function RelationScreen({ scenario, attempt, onChange, onContinue, dispatch }: RelationScreenProps) { const edges = attempt.relationEdges; const validation = validateRelationMap(scenario, edges); const [announcement, setAnnouncement] = useState(""); const [hasValidated, setHasValidated] = useState(false); const [validationAttempt, setValidationAttempt] = useState(0); const listHeadingRef = useRef | heading | long-or-dense, technical-or-internal |
| src/features/relations/RelationScreen.tsx:44:52 | text | (null); const errorSummaryRef = useRef | heading, feedback-or-error | technical-or-internal |
| src/features/relations/RelationScreen.tsx:52:24 | text | 관계 ${edges.length}개가 연결되어 있습니다. | learner-text-candidate | — |
| src/features/relations/RelationScreen.tsx:58:48 | text | invalid | feedback-or-error | missing-term-explanation, technical-or-internal |
| src/features/relations/RelationScreen.tsx:68:40 | text | current + 1); return; } if (onContinue) onContinue(); else dispatch?.({ type: "ENTER_STAGE", stage: "schedule" }); }; return ( | learner-text-candidate | long-or-dense |
| src/features/relations/RelationScreen.tsx:76:59 | text | relation-screen-title | learner-text-candidate | — |
| src/features/relations/RelationScreen.tsx:77:38 | text | 관계 설계판 | heading | — |
| src/features/relations/RelationScreen.tsx:78:10 | text | 작업 카드를 읽고 먼저 끝낼 작업과 다음에 시작할 작업을 연결하세요. 함께 할 수 있는 작업은 연결하지 않아도 됩니다. | learner-text-candidate | long-or-dense |
| src/features/relations/RelationScreen.tsx:88:114 | text | relation-feedback-title | feedback-or-error | — |
| src/features/relations/RelationScreen.tsx:89:44 | text | 관계 확인 안내 | heading, feedback-or-error, instruction | — |
| src/features/relations/RelationScreen.tsx:91:19 | text | )} {validation.status === "valid-with-extra" && ( | feedback-or-error | technical-or-internal |
| src/features/relations/RelationScreen.tsx:94:48 | text | 학생이 추가한 관계는 안전하지만 기다림이 늘어날 수 있습니다. 필요하다면 삭제하고 흐름을 비교해 보세요. | feedback-or-error | long-or-dense |
| src/features/relations/RelationScreen.tsx:96:122 | text | 관계 확인 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:8:22 | text | 순서 바꾸기 | hint | — |
| src/features/report/EvidenceForm.tsx:8:32 | text | 동시에 하기 | hint | — |
| src/features/report/EvidenceForm.tsx:8:42 | text | 도구 사용 순서 바꾸기 | hint | — |
| src/features/report/EvidenceForm.tsx:8:58 | text | 도움 요청하기 | hint | — |
| src/features/report/EvidenceForm.tsx:8:69 | text | 역할 교대하기 | hint | — |
| src/features/report/EvidenceForm.tsx:8:80 | text | 확인·휴식 유지하기 | hint | — |
| src/features/report/EvidenceForm.tsx:9:29 | text | 품질을 확인하기 위해서 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:9:45 | text | 필요한 자료를 준비하기 위해서 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:9:65 | text | 앞 작업의 결과가 필요해서 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:10:27 | text | 선행 조건과 도구가 겹치지 않아서 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:10:49 | text | 서로 다른 역할로 진행할 수 있어서 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:10:72 | text | 두 작업이 서로를 기다리지 않아서 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:11:19 | text | 줄어들었 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:11:27 | text | 늘어났 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:11:34 | text | 같았 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:13:72 | text | = { dependencyExplanation: "자료 확인이 끝나야 인쇄 글을 정리할 수 있어요. 먼저 확인한 자료가 필요하기 때문이에요.", parallelExplanation: "그림 배치 준비와 인쇄 글 정리는 서로 기다리지 않아 함께 할 수 있어요.", bottleneckExplanation: "프린터를 기다려 글 인쇄가 2단위 늦어졌어요. 뒤 작업도 함께 늦어졌어요.", tradeoffExplanation: "순서를 바꾸어도 안전·품질·역할 공정성을 지키는 방법을 골랐어요.", }; type EvidenceField = keyof MissionAttempt["evidence"]; export interface EvidenceStep { label: string; complete: boolean; } type FormState = { dependencyBefore: string; dependencyAfter: string; dependencyReason: string; dependencyText: string; parallelFirst: string; parallelSecond: string; parallelReason: string; parallelText: string; bottleneckFindingId: string; bottleneckTaskId: string; bottleneckUnits: string; bottleneckText: string; tradeoffTask: string; tradeoffStrategy: string; tradeoffChange: string; tradeoffCondition: string; tradeoffText: string; }; export interface EvidenceFormHandle { validateAndFocus(): boolean; } export interface EvidenceFormProps { scenario: ScenarioDefinition; attempt: Pick | learner-text-candidate | long-or-dense, multiple-actions, multiple-conditions, technical-or-internal |
| src/features/report/EvidenceForm.tsx:14:27 | text | 자료 확인이 끝나야 인쇄 글을 정리할 수 있어요. 먼저 확인한 자료가 필요하기 때문이에요. | learner-text-candidate | multiple-actions, multiple-conditions |
| src/features/report/EvidenceForm.tsx:15:25 | text | 그림 배치 준비와 인쇄 글 정리는 서로 기다리지 않아 함께 할 수 있어요. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:16:27 | text | 프린터를 기다려 글 인쇄가 2단위 늦어졌어요. 뒤 작업도 함께 늦어졌어요. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:17:25 | text | 순서를 바꾸어도 안전·품질·역할 공정성을 지키는 방법을 골랐어요. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:58:37 | text | 선택하세요 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:76:8 | text | ${titleFor(scenario, value.dependencyBefore)} 작업이 끝나야 ${titleFor(scenario, value.dependencyAfter)} 작업을 시작할 수 있는 이유는 ${value.dependencyReason} ${value.dependencyText.trim()}. | learner-text-candidate | long-or-dense |
| src/features/report/EvidenceForm.tsx:81:8 | text | ${titleFor(scenario, value.parallelFirst)} 작업과 ${titleFor(scenario, value.parallelSecond)} 작업을 함께 할 수 있는 이유는 ${value.parallelReason} ${value.parallelText.trim()}. | learner-text-candidate | long-or-dense |
| src/features/report/EvidenceForm.tsx:88:10 | text | 표시된 병목이 없기 때문에 ${titleFor(scenario, value.bottleneckTaskId)} 작업이 0단위 기다렸습니다. ${value.bottleneckText.trim()}. | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:91:10 | text | ${finding.blockerLabel} 때문에 ${titleFor(scenario, finding.blockedTaskId)} 작업이 ${units}단위 기다렸습니다. ${value.bottleneckText.trim()}. | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:95:8 | text | ${titleFor(scenario, value.tradeoffTask)}을 바꾸어 시간/대기가 ${value.tradeoffChange}고, 안전·품질·역할 공정성은 ${value.tradeoffCondition}했습니다. ${value.tradeoffText.trim()}. | learner-text-candidate | long-or-dense |
| src/features/report/EvidenceForm.tsx:101:32 | text | 끝나야 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:101:39 | text | 시작할 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:102:30 | text | 함께 할 수 있는 이유는 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:103:32 | text | 때문에 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:103:39 | text | 작업이 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:103:46 | text | 단위 기다렸습니다 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:104:30 | text | 안전·품질·역할 공정성은 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:104:47 | text | 했습니다 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:118:95 | text | !step.complete)?.label ?? "이 근거는 완성했습니다."; const evidenceSteps: Record | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:118:123 | text | 이 근거는 완성했습니다. | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:121:17 | text | 선행 작업 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:122:17 | text | 시작 작업 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:123:17 | text | 선행 이유 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:124:17 | text | 선행 관계 설명 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:127:17 | text | 함께 할 첫 작업 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:128:17 | text | 함께 할 둘째 작업 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:129:17 | text | 병렬 이유 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:130:17 | text | 병렬 관계 설명 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:133:17 | text | 기다림을 설명할 작업 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:134:17 | text | 기다림 단위 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:135:17 | text | 병목 근거 설명 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:137:17 | text | 병목 원인 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:138:17 | text | 기다림 단위 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:139:17 | text | 병목 근거 설명 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:142:17 | text | 바꾼 작업 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:143:17 | text | 수정 전략 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:144:17 | text | 시간/대기 변화 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:145:17 | text | 조건 결과 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:146:17 | text | 절충 근거 설명 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:149:53 | text | evidenceValues[field] ? "이 근거는 완성했습니다." : firstIncompleteStep(evidenceSteps[field]); const update = | hint | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:149:79 | text | 이 근거는 완성했습니다. | hint | repeated-text |
| src/features/report/EvidenceForm.tsx:173:28 | text | 0 \|\| !isEvidenceComplete(values)) { setMessage("네 가지 근거 문장을 모두 완성하세요."); const textKey = incomplete[0]?.replace("Explanation", "Text") ?? "dependencyText"; const target = document.querySelector | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:174:19 | text | 네 가지 근거 문장을 모두 완성하세요. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:181:17 | text | 네 가지 근거 문장을 저장했습니다. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:186:187 | text | {selectOptions(scenario)} | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:187:234 | text | 선택하세요 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:189:133 | text | 저장된 근거 문장: {persistedValue(field)} | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:189:171 | text | : null; return | learner-text-candidate | technical-or-internal |
| src/features/report/EvidenceForm.tsx:191:62 | text | evidence-form-title | learner-text-candidate | missing-term-explanation, technical-or-internal |
| src/features/report/EvidenceForm.tsx:192:34 | text | 네 가지 근거 문장 | heading | — |
| src/features/report/EvidenceForm.tsx:193:8 | text | 선택한 조건과 짧은 설명으로 근거를 완성하세요. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:196:50 | text | 선행 관계 근거 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:197:43 | text | 1번 근거 · {evidenceValues.dependencyExplanation ? "완료" : "작성 중"} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:197:92 | text | 완료 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:197:99 | text | 작성 중 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:198:10 | text | ___ 작업이 끝나야 ___ 작업을 시작할 수 있는 이유는 ___입니다. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:199:39 | text | 예시: {evidenceExamples.dependencyExplanation} | learner-text-candidate | technical-or-internal |
| src/features/report/EvidenceForm.tsx:200:36 | text | 다음에 채울 칸: {nextHint("dependencyExplanation")} | hint | — |
| src/features/report/EvidenceForm.tsx:200:85 | text | {saved("dependencyExplanation")}{taskSelect("선행 작업 선택", form.dependencyBefore, "dependencyBefore")}{taskSelect("시작 작업 선택", form.dependencyAfter, "dependencyAfter")}{reasonSelect("선행 이유 선택", dependencyReasons, form.dependencyReason, "dependencyReason")}{reasoning("선행 관계 설명", form.dependencyText, "dependencyText")} | hint | long-or-dense, multiple-actions |
| src/features/report/EvidenceForm.tsx:201:52 | text | 선행 작업 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:201:119 | text | 시작 작업 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:201:186 | text | 선행 이유 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:201:271 | text | 선행 관계 설명 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:204:50 | text | 병렬 관계 근거 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:205:43 | text | 2번 근거 · {evidenceValues.parallelExplanation ? "완료" : "작성 중"} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:205:90 | text | 완료 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:205:97 | text | 작성 중 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:206:10 | text | ___ 작업과 ___ 작업을 함께 할 수 있는 이유는 ___입니다. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:207:39 | text | 예시: {evidenceExamples.parallelExplanation} | learner-text-candidate | technical-or-internal |
| src/features/report/EvidenceForm.tsx:208:36 | text | 다음에 채울 칸: {nextHint("parallelExplanation")} | hint | — |
| src/features/report/EvidenceForm.tsx:208:83 | text | {saved("parallelExplanation")}{taskSelect("함께 할 첫 작업", form.parallelFirst, "parallelFirst")}{taskSelect("함께 할 둘째 작업", form.parallelSecond, "parallelSecond")}{reasonSelect("병렬 이유 선택", parallelReasons, form.parallelReason, "parallelReason")}{reasoning("병렬 관계 설명", form.parallelText, "parallelText")}{form.parallelFirst && form.parallelSecond && !parallelValid(form) && | hint | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:209:50 | text | 함께 할 첫 작업 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:209:112 | text | 함께 할 둘째 작업 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:209:179 | text | 병렬 이유 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:209:258 | text | 병렬 관계 설명 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:209:409 | text | 필수 선행 경로가 있는 두 작업은 함께 할 수 없습니다. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:212:50 | text | 병목 근거 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:213:43 | text | 3번 근거 · {evidenceValues.bottleneckExplanation ? "완료" : "작성 중"} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:213:92 | text | 완료 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:213:99 | text | 작성 중 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:214:44 | text | {learnerCopy.analysisTerms.cause}: 어떤 원인 때문에 뒤 작업이 기다렸는지 적어 보세요. | learner-text-candidate | long-or-dense |
| src/features/report/EvidenceForm.tsx:215:10 | text | ___ 때문에 ___ 작업이 ___단위 기다렸습니다. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:216:39 | text | 예시: {evidenceExamples.bottleneckExplanation} | learner-text-candidate | technical-or-internal |
| src/features/report/EvidenceForm.tsx:217:36 | text | 다음에 채울 칸: {nextHint("bottleneckExplanation")} | hint | — |
| src/features/report/EvidenceForm.tsx:217:85 | text | {saved("bottleneckExplanation")}{findings.length === 0 ? | hint | long-or-dense |
| src/features/report/EvidenceForm.tsx:218:15 | text | bottleneckExplanation | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:218:69 | text | 이번 실행에는 표시된 병목과 기다림이 없습니다. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:218:99 | text | {taskSelect("기다림을 설명할 작업 선택", form.bottleneckTaskId, "bottleneckTaskId")} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:218:112 | text | 기다림을 설명할 작업 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:218:153 | text | bottleneckTaskId | learner-text-candidate | missing-term-explanation, technical-or-internal |
| src/features/report/EvidenceForm.tsx:218:175 | text | 표시된 기다림: 0단위 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:218:198 | text | 기다림 단위 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:218:227 | aria-label | 기다림 단위 선택 | aria-label | repeated-text |
| src/features/report/EvidenceForm.tsx:218:296 | text | bottleneckUnits | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:218:353 | text | 0단위 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:218:397 | text | 병목 원인 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:218:425 | aria-label | 병목 원인 선택 | aria-label | repeated-text |
| src/features/report/EvidenceForm.tsx:218:497 | text | bottleneckFindingId | learner-text-candidate | missing-term-explanation, technical-or-internal |
| src/features/report/EvidenceForm.tsx:218:557 | text | 선택하세요 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:218:642 | text | {finding.blockerLabel} · {titleFor(scenario, finding.blockedTaskId)} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:218:738 | text | {selectedFinding && | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:218:761 | text | 표시된 실제 지연: {selectedFinding.delayUnits}단위 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:218:814 | text | 기다림 단위 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:218:843 | aria-label | 기다림 단위 선택 | aria-label | repeated-text |
| src/features/report/EvidenceForm.tsx:218:912 | text | bottleneckUnits | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:218:968 | text | 선택하세요 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:218:1121 | text | {index}단위 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:218:1161 | text | }{reasoning("병목 근거 설명", form.bottleneckText, "bottleneckText")} | learner-text-candidate | long-or-dense |
| src/features/report/EvidenceForm.tsx:218:1174 | text | 병목 근거 설명 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:218:1207 | text | bottleneckText | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:221:50 | text | 절충 근거 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:222:43 | text | 4번 근거 · {evidenceValues.tradeoffExplanation ? "완료" : "작성 중"} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/EvidenceForm.tsx:222:90 | text | 완료 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:222:97 | text | 작성 중 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:223:10 | text | ___을 바꾸어 시간/대기가 ___했고, 안전·품질·역할 공정성은 ___했습니다. | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:224:39 | text | 예시: {evidenceExamples.tradeoffExplanation} | learner-text-candidate | technical-or-internal |
| src/features/report/EvidenceForm.tsx:225:36 | text | 다음에 채울 칸: {nextHint("tradeoffExplanation")} | hint | — |
| src/features/report/EvidenceForm.tsx:225:83 | text | {saved("tradeoffExplanation")}{taskSelect("바꾼 작업 선택", form.tradeoffTask, "tradeoffTask")} | hint | long-or-dense |
| src/features/report/EvidenceForm.tsx:226:15 | text | tradeoffExplanation | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:226:50 | text | 바꾼 작업 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:226:81 | text | tradeoffTask | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:226:103 | text | 수정 전략 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:226:131 | aria-label | 수정 전략 선택 | aria-label | repeated-text |
| src/features/report/EvidenceForm.tsx:226:200 | text | tradeoffStrategy | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:226:257 | text | 선택하세요 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:226:379 | text | {reasonSelect("시간/대기 변화 선택", changes, form.tradeoffChange, "tradeoffChange")}{reasonSelect("조건 결과 선택", ["지켰", "지키지 못했"], form.tradeoffCondition, "tradeoffCondition")}{reasoning("절충 근거 설명", form.tradeoffText, "tradeoffText")} | learner-text-candidate | long-or-dense, multiple-actions, shaming-tone |
| src/features/report/EvidenceForm.tsx:226:394 | text | 시간/대기 변화 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:226:439 | text | tradeoffChange | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:226:471 | text | 조건 결과 선택 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:226:484 | text | 지켰 | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:226:490 | text | 지키지 못했 | learner-text-candidate | shaming-tone |
| src/features/report/EvidenceForm.tsx:226:525 | text | tradeoffCondition | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:226:557 | text | 절충 근거 설명 | learner-text-candidate | repeated-text |
| src/features/report/EvidenceForm.tsx:226:588 | text | tradeoffText | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:227:16 | text | {message && | learner-text-candidate | — |
| src/features/report/EvidenceForm.tsx:229:54 | text | 근거 문장 확인 | button-or-action | — |
| src/features/report/EvidenceProgress.tsx:12:19 | aria-label | 근거 문장 진행률 | aria-label | repeated-text |
| src/features/report/EvidenceProgress.tsx:18:13 | text | 근거 문장 진행률 | learner-text-candidate | repeated-text |
| src/features/report/ReportLearningWrapUp.tsx:12:36 | text | 안전 | learner-text-candidate | repeated-text |
| src/features/report/ReportLearningWrapUp.tsx:12:43 | text | 안전 확인 | learner-text-candidate | — |
| src/features/report/ReportLearningWrapUp.tsx:13:37 | text | 품질 | learner-text-candidate | repeated-text |
| src/features/report/ReportLearningWrapUp.tsx:13:44 | text | 품질 확인 | learner-text-candidate | — |
| src/features/report/ReportLearningWrapUp.tsx:14:38 | text | 역할 공정성 | learner-text-candidate | — |
| src/features/report/ReportLearningWrapUp.tsx:14:49 | text | 협력 방법 | learner-text-candidate | — |
| src/features/report/ReportLearningWrapUp.tsx:26:50 | text | ${word}${hasFinalConsonant(word) ? "이" : "가"} | learner-text-candidate | — |
| src/features/report/ReportLearningWrapUp.tsx:30:8 | text | ${selectedFinding.blockerLabel} 때문에 ${subjectPhrase(scenario.tasks.find((task) => task.id === selectedFinding.blockedTaskId)?.title ?? "뒤 작업")} 기다린 까닭을 찾아보았어요. 병목은 가장 오래 걸린 일이 아니라 ${learnerCopy.reportHints.bottleneck}이에요. | hint | long-or-dense, multiple-conditions, technical-or-internal |
| src/features/report/ReportLearningWrapUp.tsx:30:89 | text | task.id === selectedFinding.blockedTaskId)?.title ?? "뒤 작업")} 기다린 까닭을 찾아보았어요. 병목은 가장 오래 걸린 일이 아니라 ${learnerCopy.reportHints.bottleneck}이에요.` : hasRecordedWaits === false ? "이번 실행에는 기다림을 만든 원인이 없었다는 기록도 흐름을 설명하는 근거예요." : "아직 병목을 선택하지 않았어요. 실행 기록의 기다림을 확인해 보세요."; const comparisonLesson = comparison ? `수정 결과를 보며 시간이 ${comparison.finishDelta | hint | long-or-dense, multiple-actions, technical-or-internal |
| src/features/report/ReportLearningWrapUp.tsx:32:10 | text | 이번 실행에는 기다림을 만든 원인이 없었다는 기록도 흐름을 설명하는 근거예요. | learner-text-candidate | — |
| src/features/report/ReportLearningWrapUp.tsx:33:10 | text | 아직 병목을 선택하지 않았어요. 실행 기록의 기다림을 확인해 보세요. | learner-text-candidate | multiple-actions |
| src/features/report/ReportLearningWrapUp.tsx:35:8 | text | 수정 결과를 보며 시간이 ${comparison.finishDelta <= 0 ? "줄거나 그대로인지" : "늘었는지"}만 보지 않고 ${conditionText(comparison)}을 함께 확인했어요. | learner-text-candidate | long-or-dense |
| src/features/report/ReportLearningWrapUp.tsx:36:8 | text | 아직 수정 결과를 비교하지 않았어요. 시간과 함께 안전·품질·협력 조건도 살펴보세요. | learner-text-candidate | multiple-actions |
| src/features/report/ReportLearningWrapUp.tsx:39:67 | text | report-learning-wrap-up-title | learner-text-candidate | — |
| src/features/report/ReportLearningWrapUp.tsx:40:46 | text | 오늘 배운 점 | heading | — |
| src/features/report/ReportLearningWrapUp.tsx:43:13 | text | 앞 작업과 함께 할 작업을 구분하고, 역할을 나누어 협력하는 방법을 생각했어요. | learner-text-candidate | — |
| src/features/report/ReportLearningWrapUp.tsx:46:44 | text | 다음 도전 | heading | — |
| src/features/report/ReportLearningWrapUp.tsx:47:27 | text | report-next-challenge-title | learner-text-candidate | — |
| src/features/report/ReportLearningWrapUp.tsx:47:56 | text | 다음에는 {scenario.title}의 새 일정에서도 병목 원인을 먼저 찾고 안전·품질·협력 조건을 모두 지켜 보세요. | learner-text-candidate | long-or-dense |
| src/features/report/ReportScreen.tsx:22:97 | text | task.id === taskId)?.title ?? taskId; const scheduleText = (scenario: ScenarioDefinition, snapshot: NonNullable | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/ReportScreen.tsx:25:18 | text | ${run.actualStart}단위: ${titleFor(scenario, run.taskId)} (${run.end - run.actualStart}단위) | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/ReportScreen.tsx:37:19 | text | 수정 결과의 안전·품질·역할 공정성·목표 시간을 먼저 확인하세요. | learner-text-candidate | — |
| src/features/report/ReportScreen.tsx:41:17 | text | 개선 보고서를 완성했습니다. | learner-text-candidate | — |
| src/features/report/ReportScreen.tsx:43:81 | text | id === attempt.selectedFindingId); const initial = attempt.initialSnapshot; const revised = attempt.revisedSnapshot; const comparison = attempt.comparison; return | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/report/ReportScreen.tsx:47:62 | text | report-screen-title | learner-text-candidate | — |
| src/features/report/ReportScreen.tsx:49:36 | text | 개선 보고서 | heading | repeated-text |
| src/features/report/ReportScreen.tsx:50:10 | text | 처음 일정과 수정 일정을 비교하고, 근거를 문장으로 남겨 보세요. | learner-text-candidate | — |
| src/features/report/ReportScreen.tsx:51:60 | text | 개선 보고서가 완성되었습니다. | learner-text-candidate | — |
| src/features/report/ReportScreen.tsx:52:33 | text | report-relationship-title | heading | — |
| src/features/report/ReportScreen.tsx:52:95 | text | 선행 관계 지도와 설명 | heading | — |
| src/features/report/ReportScreen.tsx:52:115 | text | 색과 선은 보조 표시이며, 아래 텍스트가 관계의 정확한 설명입니다. | heading | — |
| src/features/report/ReportScreen.tsx:52:207 | text | ${edge.beforeTaskId}-${edge.afterTaskId} | heading | missing-term-explanation, technical-or-internal |
| src/features/report/ReportScreen.tsx:52:250 | text | {titleFor(scenario, edge.beforeTaskId)} 다음에 {titleFor(scenario, edge.afterTaskId)}를 시작합니다. | heading | long-or-dense, technical-or-internal |
| src/features/report/ReportScreen.tsx:52:352 | text | {attempt.relationEdges.length === 0 && | heading | — |
| src/features/report/ReportScreen.tsx:52:394 | text | 연결한 선행 관계가 없습니다. | heading | — |
| src/features/report/ReportScreen.tsx:52:425 | text | {initial && | heading | — |
| src/features/report/ReportScreen.tsx:53:45 | text | report-initial-schedule-title | heading | — |
| src/features/report/ReportScreen.tsx:53:115 | text | 최초 일정 | heading | repeated-text |
| src/features/report/ReportScreen.tsx:53:128 | text | {scheduleText(scenario, initial) \|\| "실행 기록이 없습니다."} | heading | long-or-dense |
| src/features/report/ReportScreen.tsx:53:165 | text | 실행 기록이 없습니다. | heading | repeated-text |
| src/features/report/ReportScreen.tsx:53:186 | text | 전체 시간 {initial.evaluation.metrics.finishTime}단위 · 대기 {initial.evaluation.metrics.totalWaitUnits}단위 | heading | long-or-dense |
| src/features/report/ReportScreen.tsx:53:298 | text | } {revised && | heading | — |
| src/features/report/ReportScreen.tsx:54:45 | text | report-revised-schedule-title | heading | — |
| src/features/report/ReportScreen.tsx:54:115 | text | 수정 일정 | heading | repeated-text |
| src/features/report/ReportScreen.tsx:54:128 | text | {scheduleText(scenario, revised) \|\| "실행 기록이 없습니다."} | heading | long-or-dense |
| src/features/report/ReportScreen.tsx:54:165 | text | 실행 기록이 없습니다. | heading | repeated-text |
| src/features/report/ReportScreen.tsx:54:186 | text | 전체 시간 {revised.evaluation.metrics.finishTime}단위 · 대기 {revised.evaluation.metrics.totalWaitUnits}단위 | heading | long-or-dense |
| src/features/report/ReportScreen.tsx:54:298 | text | } {initial && revised && comparison && | heading | — |
| src/features/report/ReportScreen.tsx:56:33 | text | report-bottleneck-title | heading | — |
| src/features/report/ReportScreen.tsx:56:91 | text | 선택한 병목 | heading | — |
| src/features/report/ReportScreen.tsx:56:102 | text | {finding ? | heading | — |
| src/features/report/ReportScreen.tsx:56:116 | text | {finding.blockerLabel} 때문에 {titleFor(scenario, finding.blockedTaskId)} 작업이 {finding.delayUnits}단위 늦어졌습니다. {finding.explanation} | heading | long-or-dense, technical-or-internal |
| src/features/report/ReportScreen.tsx:56:253 | text | 이번 실행에서 선택한 병목이 없습니다. 기록된 기다림이 없는 흐름일 수 있습니다. | heading | multiple-actions |
| src/features/report/ReportScreen.tsx:59:40 | text | 이 결과는 교육용 가상 모델이며 실제 사람의 생산성 평가에 사용할 수 없습니다. | learner-text-candidate | repeated-text |
| src/features/report/ReportScreen.tsx:61:98 | text | 개선 보고서 완성 | button-or-action | — |
| src/features/report/ReportScreen.tsx:61:116 | text | {onClearSavedProgress && | button-or-action | — |
| src/features/report/ReportScreen.tsx:62:187 | text | 저장된 진행 지우기 | button-or-action | repeated-text |
| src/features/report/TeacherSummaryView.tsx:14:66 | text | teacher-summary-title | heading | repeated-text |
| src/features/report/TeacherSummaryView.tsx:14:120 | text | 교사용 요약 | heading | repeated-text |
| src/features/report/TeacherSummaryView.tsx:14:134 | text | 수정 일정 비교가 저장되면 요약을 표시합니다. | heading | — |
| src/features/report/TeacherSummaryView.tsx:14:173 | text | ; } return | heading | — |
| src/features/report/TeacherSummaryView.tsx:16:91 | text | teacher-summary-title | learner-text-candidate | repeated-text |
| src/features/report/TeacherSummaryView.tsx:17:36 | text | 교사용 요약 | heading | repeated-text |
| src/features/report/TeacherSummaryView.tsx:20:16 | text | 최초 일정 | learner-text-candidate | repeated-text |
| src/features/report/TeacherSummaryView.tsx:20:30 | text | {summary.initialMetrics.finishTime}단위 · 대기 {summary.initialMetrics.totalWaitUnits}단위 | learner-text-candidate | long-or-dense |
| src/features/report/TeacherSummaryView.tsx:21:16 | text | 수정 일정 | learner-text-candidate | repeated-text |
| src/features/report/TeacherSummaryView.tsx:21:30 | text | {summary.revisedMetrics.finishTime}단위 · 대기 {summary.revisedMetrics.totalWaitUnits}단위 | learner-text-candidate | long-or-dense |
| src/features/report/TeacherSummaryView.tsx:24:31 | text | teacher-summary-evidence-title | heading | missing-term-explanation, technical-or-internal |
| src/features/report/TeacherSummaryView.tsx:24:103 | text | 학습 근거 | heading | — |
| src/features/report/TeacherSummaryView.tsx:26:100 | text | 교사용 요약 인쇄 | button-or-action | — |
| src/features/revision/AttemptComparisonTable.tsx:10:50 | text | 충족 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:10:57 | text | 미충족 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:11:72 | text | 변화 없음 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:22:7 | text | 전체 시간 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:22:16 | text | ${initialMetrics.finishTime}단위 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:22:50 | text | ${revisedMetrics.finishTime}단위 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:22:115 | text | 단위 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:23:7 | text | 전체 대기 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:23:16 | text | ${initialMetrics.totalWaitUnits}단위 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:23:54 | text | ${revisedMetrics.totalWaitUnits}단위 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:23:121 | text | 단위 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:24:7 | text | 안전 조건 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:24:105 | text | 유지 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:24:112 | text | 잃음 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:25:7 | text | 품질 조건 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:25:108 | text | 유지 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:25:115 | text | 잃음 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:26:7 | text | 역할 분포 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:26:99 | text | 변화 없음 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:26:133 | text | signed(value, "부하")).join(" · ")], ["목표 시간", initialMetrics.timeGoalMet ? "충족" : "미충족", revisedMetrics.timeGoalMet ? "충족" : "미충족", revisedMetrics.timeGoalMet === initialMetrics.timeGoalMet ? "변화 없음" : revisedMetrics.timeGoalMet ? "충족" : "미충족"], ] as const; return ( | learner-text-candidate | long-or-dense |
| src/features/revision/AttemptComparisonTable.tsx:26:149 | text | 부하 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:27:7 | text | 목표 시간 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:27:45 | text | 충족 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:27:52 | text | 미충족 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:27:88 | text | 충족 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:27:95 | text | 미충족 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:27:162 | text | 변화 없음 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:27:201 | text | 충족 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:27:208 | text | 미충족 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:30:62 | text | attempt-comparison-title | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:31:41 | text | 최초 일정과 수정 일정 비교 | heading | — |
| src/features/revision/AttemptComparisonTable.tsx:33:18 | text | 최초 실행과 수정안 실행의 조건 비교 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:34:36 | text | 조건 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:34:59 | text | 최초 일정 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:34:85 | text | 수정 일정 | learner-text-candidate | repeated-text |
| src/features/revision/AttemptComparisonTable.tsx:34:111 | text | 변화 | learner-text-candidate | — |
| src/features/revision/AttemptComparisonTable.tsx:35:89 | text | row | learner-text-candidate | — |
| src/features/revision/RevisionScreen.tsx:35:45 | text | 수정 결과가 성공 상태가 아닙니다. | learner-text-candidate | — |
| src/features/revision/RevisionScreen.tsx:44:24 | text | { if (!canCompare) { setMessage("수정 일정에 작업을 하나 이상 배치하세요."); return; } const revised = snapshotFor(scenario, draft); onCompare(revised, compareAttempts(scenario, initialSnapshot.draft, initialSnapshot.evaluation, draft, revised.evaluation)); setMessage("수정안 실행 기록과 최초 일정을 비교했습니다."); }; return ( | learner-text-candidate | long-or-dense, multiple-actions |
| src/features/revision/RevisionScreen.tsx:46:19 | text | 수정 일정에 작업을 하나 이상 배치하세요. | learner-text-candidate | — |
| src/features/revision/RevisionScreen.tsx:51:17 | text | 수정안 실행 기록과 최초 일정을 비교했습니다. | learner-text-candidate | multiple-actions |
| src/features/revision/RevisionScreen.tsx:54:59 | text | revision-screen-title | learner-text-candidate | — |
| src/features/revision/RevisionScreen.tsx:55:38 | text | 일정 수정 | heading | — |
| src/features/revision/RevisionScreen.tsx:56:10 | text | 선택한 병목을 줄이되 안전·품질·역할 조건을 함께 지키는 수정안을 만들어 보세요. | learner-text-candidate | multiple-actions |
| src/features/revision/RevisionScreen.tsx:57:71 | text | revision-observation-title | learner-text-candidate | — |
| src/features/revision/RevisionScreen.tsx:58:45 | text | 수정 전 관찰 | heading | — |
| src/features/revision/RevisionScreen.tsx:59:12 | text | 바꿀 작업을 고르고, 시간 변화와 안전·품질·역할 공정성을 함께 확인합니다. | learner-text-candidate | multiple-actions |
| src/features/revision/RevisionScreen.tsx:60:20 | text | 최초 시간 | learner-text-candidate | — |
| src/features/revision/RevisionScreen.tsx:60:34 | text | {initialSnapshot.evaluation.metrics.finishTime}단위 · | learner-text-candidate | long-or-dense |
| src/features/revision/RevisionScreen.tsx:60:95 | text | 최초 대기 | learner-text-candidate | — |
| src/features/revision/RevisionScreen.tsx:60:109 | text | {initialSnapshot.evaluation.metrics.totalWaitUnits}단위 | learner-text-candidate | long-or-dense |
| src/features/revision/RevisionScreen.tsx:64:110 | text | compare-revision | learner-text-candidate | — |
| src/features/revision/RevisionScreen.tsx:64:177 | text | 수정안 실행·비교 | learner-text-candidate | repeated-text |
| src/features/revision/RevisionScreen.tsx:64:209 | text | {revisedSnapshot && comparison && ( | learner-text-candidate | — |
| src/features/revision/RevisionScreen.tsx:67:103 | text | revision-failure-title | heading | — |
| src/features/revision/RevisionScreen.tsx:67:159 | text | 완료 조건을 먼저 확인하세요 | heading | — |
| src/features/revision/RevisionScreen.tsx:67:182 | text | 완료 조건이 충족되지 않았습니다. | heading | — |
| src/features/revision/RevisionScreen.tsx:67:284 | text | } {failures.length === 0 && | heading | — |
| src/features/revision/RevisionScreen.tsx:70:65 | text | 비교 카드에서 시간뿐 아니라 안전·품질·역할 조건의 보존 상태를 확인하세요. | learner-text-candidate | multiple-actions |
| src/features/revision/RevisionScreen.tsx:70:111 | text | {failures.length === 0 && | button-or-action | — |
| src/features/revision/RevisionScreen.tsx:71:78 | text | 보고서 작성 | button-or-action | — |
| src/features/revision/RevisionScreen.tsx:74:21 | text | 비교하려면 모든 작업을 빠짐없이 배치하고 역할 수와 시작 시점을 맞추세요. | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:36:61 | text | { event.preventDefault(); if (!task \|\| !valid) return; onPlace({ taskId: task.id, plannedStart: Number(plannedStart), roleIds: normalizeScheduleRoleIds(scenario, roleIds) }); }; return ( | button-or-action | long-or-dense, technical-or-internal |
| src/features/schedule/PlacementForm.tsx:43:72 | text | placement-title | button-or-action | — |
| src/features/schedule/PlacementForm.tsx:45:38 | text | 작업 배치 | learner-text-candidate | repeated-text |
| src/features/schedule/PlacementForm.tsx:46:41 | text | 배치할 작업 | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:48:28 | text | 작업을 선택하세요 | learner-text-candidate | repeated-text |
| src/features/schedule/PlacementForm.tsx:52:71 | text | 몇 단위부터 시작할까요? | hint | — |
| src/features/schedule/PlacementForm.tsx:53:42 | text | 시작 시점 | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:55:122 | text | {value}단위 | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:58:56 | text | {`이 작업에는 역할 ${task.peopleRequired}명이 필요합니다.`} | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:58:58 | text | 이 작업에는 역할 ${task.peopleRequired}명이 필요합니다. | learner-text-candidate | repeated-text |
| src/features/schedule/PlacementForm.tsx:59:30 | text | 이미 배치한 작업입니다. 다시 배치하면 시작 시점과 역할을 교체합니다. | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:61:19 | text | 담당 역할 | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:62:71 | text | 역할 A·B·C는 능력 이름이 아니라 맡은 자리 이름입니다. 작업에 필요한 자리를 골라 주세요. | hint | — |
| src/features/schedule/PlacementForm.tsx:79:16 | text | 필요한 도구: ${task.resources.map((requirement) => scenario.resources.find((resource) => resource.id === requirement.resourceId)?.label ?? requirement.resourceId).join(", ")}. 작업 카드의 조건으로 정해져 있어 선택할 수 없습니다. | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/schedule/PlacementForm.tsx:79:99 | text | resource.id === requirement.resourceId)?.label ?? requirement.resourceId).join(", ")}. 작업 카드의 조건으로 정해져 있어 선택할 수 없습니다.` : "필요한 도구: 없음." : "작업을 선택하면 필요한 도구가 표시됩니다."} | learner-text-candidate | long-or-dense, multiple-actions, technical-or-internal |
| src/features/schedule/PlacementForm.tsx:80:16 | text | 필요한 도구: 없음. | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:81:14 | text | 작업을 선택하면 필요한 도구가 표시됩니다. | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:81:43 | text | {showStatus && | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:83:21 | text | 작업을 선택하세요. | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:83:46 | text | 0 ? `${remaining}명 더 선택하세요.` : "필요한 역할을 모두 선택했습니다."} | learner-text-candidate | multiple-actions |
| src/features/schedule/PlacementForm.tsx:83:52 | text | ${remaining}명 더 선택하세요. | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:83:79 | text | 필요한 역할을 모두 선택했습니다. | learner-text-candidate | — |
| src/features/schedule/PlacementForm.tsx:85:49 | text | 일정에 배치 | button-or-action | — |
| src/features/schedule/ScheduleEditor.tsx:46:62 | text | item.taskId === taskId ? { ...item, plannedStart } : item) }); }; return ( | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/schedule/ScheduleEditor.tsx:50:59 | text | schedule-editor-title | learner-text-candidate | — |
| src/features/schedule/ScheduleEditor.tsx:51:38 | text | 작업 배치 | heading | repeated-text |
| src/features/schedule/ScheduleEditor.tsx:52:72 | aria-label | 일정 보기 방식 | aria-label | — |
| src/features/schedule/ScheduleEditor.tsx:53:55 | text | grid | button-or-action | missing-term-explanation, repeated-text, technical-or-internal |
| src/features/schedule/ScheduleEditor.tsx:53:86 | text | grid | button-or-action | missing-term-explanation, repeated-text, technical-or-internal |
| src/features/schedule/ScheduleEditor.tsx:53:94 | text | 시간표 보기 | button-or-action | repeated-text |
| src/features/schedule/ScheduleEditor.tsx:54:55 | text | list | button-or-action | repeated-text |
| src/features/schedule/ScheduleEditor.tsx:54:86 | text | list | button-or-action | repeated-text |
| src/features/schedule/ScheduleEditor.tsx:54:94 | text | 단계 목록 보기 | button-or-action | repeated-text |
| src/features/schedule/ScheduleScreen.tsx:45:42 | text | revision | learner-text-candidate | — |
| src/features/schedule/ScheduleScreen.tsx:45:55 | text | 수정안 실행·비교 | learner-text-candidate | repeated-text |
| src/features/schedule/ScheduleScreen.tsx:45:69 | text | 실행 | learner-text-candidate | — |
| src/features/schedule/ScheduleScreen.tsx:47:20 | text | { if (!ready) { setMessage("모든 작업을 한 번씩 배치하고 공개된 관계·역할 조건을 확인하세요."); return; } const snapshot = snapshotFor(scenario, draft); onRun(snapshot); }; return ( | learner-text-candidate | long-or-dense |
| src/features/schedule/ScheduleScreen.tsx:49:19 | text | 모든 작업을 한 번씩 배치하고 공개된 관계·역할 조건을 확인하세요. | learner-text-candidate | — |
| src/features/schedule/ScheduleScreen.tsx:57:59 | text | schedule-screen-title | learner-text-candidate | — |
| src/features/schedule/ScheduleScreen.tsx:58:38 | text | 일정표 | heading | repeated-text |
| src/features/schedule/ScheduleScreen.tsx:59:10 | text | 작업을 선택하고 시작 시점과 필요한 역할을 정해 배치하세요. 필요한 도구는 작업 카드에서 정해져 있습니다. | learner-text-candidate | long-or-dense |
| src/features/schedule/ScheduleScreen.tsx:60:36 | text | 목표 시간: {scenario.timeGoal}단위 · 모든 시간은 교육용 가상 시간입니다. | learner-text-candidate | — |
| src/features/schedule/ScheduleScreen.tsx:67:149 | text | {!ready && | learner-text-candidate | — |
| src/features/schedule/ScheduleScreen.tsx:68:21 | text | 실행하려면 모든 작업을 빠짐없이 배치하고 역할 수와 시작 시점을 맞추세요. | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:34:54 | text | 0 && entryById.has(taskId)) onMove(taskId, time); }; const dragStart = (event: DragEvent | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/schedule/TimelineGrid.tsx:42:66 | text | index); return ( | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:44:65 | text | timeline-title | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:45:31 | text | 시간표 보기 | heading | repeated-text |
| src/features/schedule/TimelineGrid.tsx:46:10 | text | 시간은 교육용 가상 단위입니다. 작업 카드는 드래그로 옮길 수 있지만, 아래 작업 배치 선택만으로도 모두 진행할 수 있습니다. | learner-text-candidate | long-or-dense |
| src/features/schedule/TimelineGrid.tsx:47:48 | text | 옆으로 움직여 시간 보기 | hint | — |
| src/features/schedule/TimelineGrid.tsx:48:62 | aria-label | 작업 시간표 | aria-label | — |
| src/features/schedule/TimelineGrid.tsx:50:37 | text | 역할·도구 | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:51:69 | text | {`시간 ${time}`} | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:51:71 | text | 시간 ${time} | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:54:85 | text | ${entries.filter((entry) => entry.roleIds.includes(role.id)).map((entry) => | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/schedule/TimelineGrid.tsx:54:240 | text | ).join("")}${role.label} | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:63:32 | text | 시간 ${time} ${role.label} | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:74:121 | text | ${task.title} ${task.duration}단위 | button-or-action | — |
| src/features/schedule/TimelineGrid.tsx:75:50 | text | {task.duration}단위 | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:75:74 | text | {onDelete && | button-or-action | — |
| src/features/schedule/TimelineGrid.tsx:76:73 | text | ${task.title} 일정 삭제 | button-or-action | — |
| src/features/schedule/TimelineGrid.tsx:76:129 | text | 삭제 | button-or-action | repeated-text |
| src/features/schedule/TimelineGrid.tsx:78:71 | text | ${task.title} ${task.duration}단위 ${role.label} 역할 점유 | learner-text-candidate | long-or-dense |
| src/features/schedule/TimelineGrid.tsx:78:132 | text | ${task.id}-${role.id} | learner-text-candidate | missing-term-explanation, technical-or-internal |
| src/features/schedule/TimelineGrid.tsx:78:156 | text | {`${task.title} · ${task.duration}단위`} | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:78:158 | text | ${task.title} · ${task.duration}단위 | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:86:118 | text | 도구 ${resource.label} | learner-text-candidate | repeated-text |
| src/features/schedule/TimelineGrid.tsx:87:36 | text | {`도구 ${resource.label}`} | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:87:38 | text | 도구 ${resource.label} | learner-text-candidate | repeated-text |
| src/features/schedule/TimelineGrid.tsx:88:33 | text | { const entry = resourceTask(resource.id, time); const task = entry ? taskById.get(entry.taskId) : undefined; return ( | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/schedule/TimelineGrid.tsx:92:76 | text | ${resource.id}-${time} | learner-text-candidate | missing-term-explanation, technical-or-internal |
| src/features/schedule/TimelineGrid.tsx:92:114 | text | 시간 ${time} 도구 ${resource.label} | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:92:148 | text | {task && | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:93:65 | text | {`${task.title} (${task.duration}단위)`} | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:93:67 | text | ${task.title} (${task.duration}단위) | learner-text-candidate | — |
| src/features/schedule/TimelineGrid.tsx:100:45 | text | 도구 줄의 내용은 작업 카드에서 정해진 필요 자원을 보여 줍니다. 학생이 자원을 바꿀 수 없습니다. | learner-text-candidate | — |
| src/features/schedule/TimelineStepList.tsx:16:38 | text | entry.plannedStart === start), })); return ( | learner-text-candidate | — |
| src/features/schedule/TimelineStepList.tsx:20:62 | text | step-list-title | learner-text-candidate | — |
| src/features/schedule/TimelineStepList.tsx:21:32 | text | 단계 목록 보기 | heading | repeated-text |
| src/features/schedule/TimelineStepList.tsx:22:10 | text | 시작 시점과 시나리오 작업 순서에 따라 정리한 일정입니다. | learner-text-candidate | — |
| src/features/schedule/TimelineStepList.tsx:23:41 | text | 역할 A·B·C는 능력 이름이 아니라 맡은 자리 이름입니다. 각 작업이 맡은 자리를 확인하세요. | learner-text-candidate | — |
| src/features/schedule/TimelineStepList.tsx:24:10 | text | 함께 진행 가능 여부는 역할·도구 조건에 따라 실행에서 확인합니다. | learner-text-candidate | — |
| src/features/schedule/TimelineStepList.tsx:25:34 | text | 아직 배치한 작업이 없습니다. | learner-text-candidate | — |
| src/features/schedule/TimelineStepList.tsx:27:48 | text | time-heading-${start} | heading | — |
| src/features/schedule/TimelineStepList.tsx:28:44 | text | {`시간 ${start}단위`} | heading | — |
| src/features/schedule/TimelineStepList.tsx:28:46 | text | 시간 ${start}단위 | heading | — |
| src/features/schedule/TimelineStepList.tsx:33:156 | text | 역할 ${roleId} | learner-text-candidate | missing-term-explanation, technical-or-internal |
| src/features/schedule/TimelineStepList.tsx:35:20 | text | 필요한 도구 없음 | learner-text-candidate | repeated-text |
| src/features/schedule/TimelineStepList.tsx:36:92 | text | resource.id === requirement.resourceId)?.label ?? requirement.resourceId).join(", "); return | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/schedule/TimelineStepList.tsx:37:45 | text | {`시작 ${start}단위 · ${task.title} · ${task.duration}단위 · ${roles} · ${resources}`} | learner-text-candidate | long-or-dense |
| src/features/schedule/TimelineStepList.tsx:37:47 | text | 시작 ${start}단위 · ${task.title} · ${task.duration}단위 · ${roles} · ${resources} | learner-text-candidate | long-or-dense |
| src/features/simulation/BottleneckPrediction.tsx:13:13 | text | 먼저 끝날 작업을 기다림 | learner-text-candidate | — |
| src/features/simulation/BottleneckPrediction.tsx:13:38 | text | dependency | learner-text-candidate | — |
| src/features/simulation/BottleneckPrediction.tsx:14:13 | text | 한정된 도구를 기다림 | learner-text-candidate | — |
| src/features/simulation/BottleneckPrediction.tsx:14:36 | text | resource | learner-text-candidate | repeated-text |
| src/features/simulation/BottleneckPrediction.tsx:15:13 | text | 담당 역할을 기다림 | learner-text-candidate | — |
| src/features/simulation/BottleneckPrediction.tsx:15:35 | text | role | learner-text-candidate | — |
| src/features/simulation/BottleneckPrediction.tsx:16:13 | text | 단독 작업 차례를 기다림 | learner-text-candidate | — |
| src/features/simulation/BottleneckPrediction.tsx:16:38 | text | solo | learner-text-candidate | — |
| src/features/simulation/BottleneckPrediction.tsx:19:115 | text | 기다림 | learner-text-candidate | repeated-text |
| src/features/simulation/BottleneckPrediction.tsx:20:88 | text | /[가-힣]/.test(character)).length; export function BottleneckPrediction({ onSubmit, submittedReason = null, submittedExplanation = "", engineReason = null }: BottleneckPredictionProps) { const [reason, setReason] = useState | button-or-action | long-or-dense, technical-or-internal |
| src/features/simulation/BottleneckPrediction.tsx:25:74 | text | = 10; if (submittedReason) { const correct = engineReason !== null && submittedReason === engineReason; return | button-or-action, feedback-or-error | long-or-dense, technical-or-internal |
| src/features/simulation/BottleneckPrediction.tsx:28:65 | aria-label | 예측 결과 | aria-label, feedback-or-error | — |
| src/features/simulation/BottleneckPrediction.tsx:29:11 | text | 예측을 저장했습니다. | heading | — |
| src/features/simulation/BottleneckPrediction.tsx:30:10 | text | {correct ? "실행 기록과 같은 기다림 원인입니다." : "예측과 실행 기록이 달라도 괜찮습니다. 작업 카드와 기다림 표시를 다시 비교해 보세요."} | learner-text-candidate | long-or-dense, multiple-actions |
| src/features/simulation/BottleneckPrediction.tsx:30:22 | text | 실행 기록과 같은 기다림 원인입니다. | learner-text-candidate | — |
| src/features/simulation/BottleneckPrediction.tsx:30:47 | text | 예측과 실행 기록이 달라도 괜찮습니다. 작업 카드와 기다림 표시를 다시 비교해 보세요. | learner-text-candidate | multiple-actions |
| src/features/simulation/BottleneckPrediction.tsx:31:35 | text | 내 설명: {submittedExplanation} | button-or-action | technical-or-internal |
| src/features/simulation/BottleneckPrediction.tsx:32:10 | text | 실행 기록: {engineReason ? reasonLabel(engineReason) : "확인할 기다림이 없습니다."} | learner-text-candidate | long-or-dense, multiple-actions |
| src/features/simulation/BottleneckPrediction.tsx:32:62 | text | 확인할 기다림이 없습니다. | learner-text-candidate | — |
| src/features/simulation/BottleneckPrediction.tsx:33:15 | text | ; } return ( | learner-text-candidate | repeated-text |
| src/features/simulation/BottleneckPrediction.tsx:36:55 | aria-label | 기다림 원인 예측 | aria-label | — |
| src/features/simulation/BottleneckPrediction.tsx:43:47 | text | 기다림을 예상한 이유 (10자 이상) | learner-text-candidate | — |
| src/features/simulation/BottleneckPrediction.tsx:45:114 | text | 예측 저장 | button-or-action | — |
| src/features/simulation/SimulationControls.tsx:15:54 | aria-label | 가상 실행 조작 | aria-label | — |
| src/features/simulation/SimulationControls.tsx:15:64 | text | {!reducedMotion && playback.mode !== "complete" && playback.mode !== "playing" && ( | button-or-action | long-or-dense |
| src/features/simulation/SimulationControls.tsx:17:48 | text | 가상 실행 시작 | button-or-action | — |
| src/features/simulation/SimulationControls.tsx:17:65 | text | )} {!reducedMotion && playback.mode === "playing" && | button-or-action | long-or-dense |
| src/features/simulation/SimulationControls.tsx:19:45 | text | playing | button-or-action | — |
| src/features/simulation/SimulationControls.tsx:19:97 | text | 일시 정지 | button-or-action | repeated-text |
| src/features/simulation/SimulationControls.tsx:19:111 | text | } {reducedMotion && playback.mode !== "complete" && ( | button-or-action | long-or-dense |
| src/features/simulation/SimulationControls.tsx:21:48 | text | 다음 단계 | button-or-action | — |
| src/features/simulation/SimulationControls.tsx:21:62 | text | )} {(playback.mode === "paused" \|\| playback.mode === "complete") && ( | button-or-action | long-or-dense |
| src/features/simulation/SimulationControls.tsx:24:49 | text | 처음부터 | button-or-action | — |
| src/features/simulation/SimulationControls.tsx:26:25 | aria-label | 가상 실행 시간 | aria-label | — |
| src/features/simulation/SimulationControls.tsx:26:35 | text | {playback.currentTime} / {finishTime}단위 | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:119:28 | text | idle | learner-text-candidate | missing-term-explanation, repeated-text, technical-or-internal |
| src/features/simulation/SimulationScreen.tsx:119:70 | text | start:${playback.currentTime}:${starts.join(",")} | learner-text-candidate | long-or-dense |
| src/features/simulation/SimulationScreen.tsx:119:123 | text | ${starts.map((id) => scenario.tasks.find((task) => task.id === id)?.title ?? id).join(", ")} 시작 | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/simulation/SimulationScreen.tsx:120:28 | text | idle | learner-text-candidate | missing-term-explanation, repeated-text, technical-or-internal |
| src/features/simulation/SimulationScreen.tsx:120:72 | text | finish:${playback.currentTime}:${finishes.join(",")} | learner-text-candidate | long-or-dense |
| src/features/simulation/SimulationScreen.tsx:120:128 | text | ${finishes.map((id) => scenario.tasks.find((task) => task.id === id)?.title ?? id).join(", ")} 완료 | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/simulation/SimulationScreen.tsx:121:164 | text | 기다림이 나타나 실행을 멈췄습니다. | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:122:85 | text | 실행이 일시 정지되었습니다. | learner-text-candidate | repeated-text |
| src/features/simulation/SimulationScreen.tsx:123:116 | text | 실행이 일시 정지되었습니다. | learner-text-candidate | repeated-text |
| src/features/simulation/SimulationScreen.tsx:124:89 | text | 가상 실행이 끝났습니다. | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:136:43 | text | wait.from === playback.currentTime) ?? null; const feedbackWait = currentWait ?? waits[0] ?? null; return ( | feedback-or-error | long-or-dense, technical-or-internal |
| src/features/simulation/SimulationScreen.tsx:139:61 | text | simulation-screen-title | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:139:124 | text | true | learner-text-candidate | repeated-text |
| src/features/simulation/SimulationScreen.tsx:139:133 | text | false | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:140:40 | text | 가상 실행 | heading | repeated-text |
| src/features/simulation/SimulationScreen.tsx:141:10 | text | 미리 계산된 실행 기록을 시간 단위별로 살펴봅니다. 실제 작업 시간의 측정값이 아닙니다. | learner-text-candidate | multiple-actions |
| src/features/simulation/SimulationScreen.tsx:142:73 | text | simulation-observation-title | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:143:47 | text | 지금 관찰할 것 | heading | — |
| src/features/simulation/SimulationScreen.tsx:144:20 | text | 현재 시간 | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:144:34 | text | {playback.currentTime}단위 · | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:144:70 | text | 실행 상태 | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:144:84 | text | {playback.mode === "idle" ? "시작 전" : playback.mode === "complete" ? "완료" : playback.mode === "paused" ? "일시 정지" : "진행 중"} | learner-text-candidate | long-or-dense, technical-or-internal |
| src/features/simulation/SimulationScreen.tsx:144:114 | text | 시작 전 | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:144:154 | text | 완료 | learner-text-candidate | repeated-text |
| src/features/simulation/SimulationScreen.tsx:144:190 | text | 일시 정지 | learner-text-candidate | repeated-text |
| src/features/simulation/SimulationScreen.tsx:144:200 | text | 진행 중 | learner-text-candidate | repeated-text |
| src/features/simulation/SimulationScreen.tsx:145:44 | text | 기다림이 나타났어요. 멈춘 까닭을 먼저 예상해 보세요. | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:145:92 | text | 0 ? "시간을 움직이며 작업 시작·완료와 기다림을 살펴보세요." : "작업이 시작하고 끝나는 순서를 살펴보세요."} | learner-text-candidate | long-or-dense, multiple-actions |
| src/features/simulation/SimulationScreen.tsx:145:98 | text | 시간을 움직이며 작업 시작·완료와 기다림을 살펴보세요. | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:145:133 | text | 작업이 시작하고 끝나는 순서를 살펴보세요. | learner-text-candidate | — |
| src/features/simulation/SimulationScreen.tsx:150:106 | text | } {submittedReason && !playback.predictionRequired && ( | button-or-action, feedback-or-error | long-or-dense, technical-or-internal |
| src/features/simulation/SimulationScreen.tsx:152:208 | text | )} {((submittedReason && !playback.predictionRequired) \|\| (waits.length === 0 && playback.mode === "complete")) && | button-or-action, feedback-or-error | long-or-dense, technical-or-internal |
| src/features/simulation/SimulationScreen.tsx:154:104 | text | complete | button-or-action | — |
| src/features/simulation/SimulationScreen.tsx:154:167 | text | 분석으로 이동 | button-or-action | abstract-or-formal |
| src/features/simulation/SimulationScreen.tsx:154:183 | text | } {submittedExplanation && | button-or-action | missing-term-explanation, technical-or-internal |
| src/features/simulation/SimulationScreen.tsx:155:66 | text | 예측 설명이 저장되었습니다. | button-or-action | — |
| src/features/simulation/SimulationTimeline.tsx:12:34 | text | 가상 시간 ${currentTime}단위 정지 화면 | heading | — |
| src/features/simulation/SimulationTimeline.tsx:12:67 | text | 가상 시간 ${currentTime}단위 | heading | — |
| src/features/simulation/SimulationTimeline.tsx:17:56 | text | 아직 시작 전 | learner-text-candidate | — |
| src/features/simulation/SimulationTimeline.tsx:18:41 | text | 완료 | learner-text-candidate | repeated-text |
| src/features/simulation/SimulationTimeline.tsx:19:13 | text | 진행 중 | learner-text-candidate | repeated-text |
| src/features/simulation/SimulationTimeline.tsx:24:63 | text | simulation-time-title | learner-text-candidate | — |
| src/features/simulation/SimulationTimeline.tsx:26:23 | aria-label | 작업 진행 상태 | aria-label | — |
| src/features/simulation/SimulationTimeline.tsx:27:93 | text | {stateFor(task.id)} | learner-text-candidate | technical-or-internal |
| src/features/simulation/SimulationTimeline.tsx:30:56 | aria-label | 기다림 구간 | aria-label | — |
| src/features/simulation/SimulationTimeline.tsx:31:88 | text | {taskTitle.get(wait.taskId) ?? wait.taskId}: 가상 시간 {wait.from}~{wait.to}단위 기다림 | learner-text-candidate | long-or-dense, technical-or-internal |
| src/main.tsx:15:20 | text | 앱을 표시할 루트 요소를 찾을 수 없습니다. | feedback-or-error | — |
| src/storage/localProgressRepository.ts:23:80 | text | 저장할 수 없습니다. | feedback-or-error | — |
| src/storage/localProgressRepository.ts:31:80 | text | 저장 내용을 지울 수 없습니다. | feedback-or-error | — |
| src/test/fixtures.ts:3:51 | text | & Pick | learner-text-candidate | — |
| src/test/fixtures.ts:3:76 | text | id | learner-text-candidate | missing-term-explanation, technical-or-internal |
| src/test/fixtures.ts:3:83 | text | title | learner-text-candidate | — |
| src/test/fixtures.ts:3:110 | text | ({ duration: 1, prerequisites: [], peopleRequired: 1, resources: [], parallel: "allowed", conditions: [{ id: `${task.id}:quality`, kind: "quality", label: "확인합니다" }], evidenceKinds: ["quality"], unlocks: [], ...task, }); export function makeScenario(overrides: Partial | learner-text-candidate | long-or-dense, technical-or-internal |
| src/test/fixtures.ts:9:23 | text | ${task.id}:quality | learner-text-candidate | technical-or-internal |
| src/test/fixtures.ts:9:51 | text | quality | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:9:69 | text | 확인합니다 | learner-text-candidate | — |
| src/test/fixtures.ts:17:24 | text | task-1 | learner-text-candidate | — |
| src/test/fixtures.ts:17:41 | text | 첫 번째 작업 | learner-text-candidate | — |
| src/test/fixtures.ts:17:62 | text | task-2 | learner-text-candidate | — |
| src/test/fixtures.ts:20:15 | text | 두 번째 작업 | learner-text-candidate | — |
| src/test/fixtures.ts:21:70 | text | 앞 작업을 확인합니다 | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:26:15 | text | 세 번째 작업 | learner-text-candidate | — |
| src/test/fixtures.ts:27:70 | text | 앞 작업을 확인합니다 | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:33:15 | text | 네 번째 작업 | learner-text-candidate | — |
| src/test/fixtures.ts:34:69 | text | 앞 작업을 확인합니다 | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:39:15 | text | 다섯 번째 작업 | learner-text-candidate | — |
| src/test/fixtures.ts:40:69 | text | 앞 작업을 확인합니다 | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:45:13 | text | 테스트 시나리오 | learner-text-candidate | — |
| src/test/fixtures.ts:46:15 | text | 테스트 시나리오를 완성합니다. | learner-text-candidate | — |
| src/test/fixtures.ts:49:14 | text | A | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:49:26 | text | 역할 A | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:50:14 | text | B | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:50:26 | text | 역할 B | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:51:14 | text | C | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:51:26 | text | 역할 C | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:53:24 | text | printer | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:53:42 | text | 프린터 | learner-text-candidate | repeated-text |
| src/test/fixtures.ts:56:18 | text | 모든 시간은 교육용 가상 단위이며 실제 작업 수행 시간을 예측하지 않습니다. | learner-text-candidate | abstract-or-formal, repeated-text |
| src/test/fixtures.ts:57:20 | text | 공개된 근거를 바탕으로 순서를 설명합니다. | learner-text-candidate | — |

## Limitations

- Candidates are triage signals, not an automatic grade-level or readability certification.
- Static scanning can miss runtime-composed text, fetched content, canvas/image text, and some template syntax.
- Every candidate requires rendered-state, target-grade, learning-intent, and curriculum-accuracy review.
- This command reads source files and writes only the optional report path; it never rewrites source files.

## Configuration

- Extensions: `.ts, .tsx`
- Excluded directories: `.git, .next, .nuxt, .parcel-cache, .playwright-mcp, .superpowers, .turbo, .vite, .worktrees, build, coverage, dist, docs, e2e, node_modules, out, target, tests, vendor, work`
