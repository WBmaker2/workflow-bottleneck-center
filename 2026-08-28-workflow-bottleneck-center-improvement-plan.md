# Workflow Bottleneck Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to execute this plan task-by-task. Every task follows failing test → minimal implementation → passing test, and every task receives a separate specification and code-quality review.

## Goal

초등학교 5~6학년 학생이 첫 화면에서 해야 할 일을 바로 이해하고, 375px 모바일·키보드 환경에서도 `작업 카드 읽기 → 관계 연결 → 사람·도구 배치 → 가상 실행 → 기다림 원인 찾기 → 일정 수정 → 근거 설명`을 끝까지 수행하도록 학습자 흐름을 개선합니다. 기존의 결정적 판정 엔진, 네 가지 안전한 가상 시나리오, 로컬 전용 저장 경계를 유지하면서 다음 관찰 결과를 해결합니다.

- 안내 화면이 4,000px 이상으로 길어져 `조건 확인`이 첫 학습 행동으로 보이지 않습니다.
- 고정된 `업데이트 내역` 버튼이 모바일 콘텐츠 위에 겹칩니다.
- 모바일 관계 SVG의 작업 이름이 읽히지 않고, 필수 관계가 의미 목록에 직접 보이지 않습니다.
- 선택한 시나리오의 시각 상태가 다른 시나리오와 거의 구별되지 않습니다.
- 모바일 일정표가 가로로 넓은 시간축부터 열립니다.
- 단계 요약이 어느 화면에서나 같은 문장이고, 분석·보고 문장이 초등학생에게 어렵습니다.
- 마지막 보고서가 네 개의 긴 입력 묶음으로 끝나 학습한 내용과 다음 도전이 남지 않습니다.

## Architecture

`src/App.tsx`가 `AppProvider`의 단계 상태를 읽고 화면을 선택하는 얇은 셸로 남습니다. 시나리오·판정·시뮬레이션은 `src/data`와 `src/domain`에 두며, 이번 개선에서는 판정 규칙을 UI 문구와 섞지 않습니다. 학습자용 표현·단계 도움말·요약은 작은 프레젠테이션 컴포넌트와 타입이 있는 데이터 모듈로 분리합니다.

화면 구조는 다음과 같습니다.

```text
AppShell
├─ ScenarioNavigation + 저장 경계 안내
├─ StageHeader + StageHelpPanel
├─ BriefingScreen
│  ├─ MissionOverview
│  ├─ TaskCardSummary
│  └─ TaskCard(details로 점진 공개)
├─ RelationScreen
│  ├─ RelationEditor
│  ├─ RelationRequirementList(모바일·의미 fallback)
│  └─ RelationBoard(데스크톱 보조 SVG)
├─ ScheduleScreen(ScheduleEditor: desktop grid / small viewport list)
├─ SimulationScreen → AnalysisScreen → RevisionScreen
└─ ReportScreen
   ├─ EvidenceProgress + 단계별 근거 입력
   └─ ReportLearningWrapUp(오늘 배운 점·다음 도전)
```

`RequiredActionButton`은 `getRequiredAction`이 필수 행동을 반환하는 단계에서 실제로 눌러야 하는 버튼 하나에만 `gi-pulse`와 `data-pulse="true"`를 부여합니다. 이번 개선에서 필수 행동 ID는 `confirm-conditions`, `confirm-relations`, `run-simulation`, `mark-bottleneck`, `compare-revision`으로 고정하며, `getRequiredAction`과 모든 UI 테스트가 같은 유니온 타입을 사용합니다. 실행 단계의 재생·분석 이동과 보고서 완료는 각 화면의 별도 조건 버튼이며 이 다섯 값에 포함하지 않습니다.

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 7 정적 SPA
- Vitest + Testing Library + `vitest-axe` 단위·컴포넌트 접근성 테스트
- Playwright Chromium E2E, `page.goto('./')`를 사용하는 저장소 하위 경로 검증
- 기존 CSS 파일(`base.css`, `layout.css`, `components.css`, `motion.css`)과 시스템 글꼴
- 외부 API·로그인·분석 SDK·서버 저장소·학생 이름 입력 없음

## Spec

### 교육 목표와 차별성 연결

- `[6실05-01]`에 맞게 학생이 단순히 빠른 답을 고르는 대신 선행 작업·병렬 작업·제한 자원을 관계 목록과 일정 목록으로 표현합니다.
- 거북이 명령 실행 앱과 달리 여러 작업의 의존·동시 진행·자원 대기를 찾고, 수송 조건 앱과 달리 시간표의 기다림을 관찰하며, 배분 앱과 달리 선후 관계와 자원 흐름을 수정합니다.
- 안내 문구는 “최단 시간 하나가 정답”이라는 인상을 없애고 안전·품질·협력·역할 교대·휴식을 성공 조건의 일부로 계속 보여 줍니다.

### 핵심 학습 흐름과 콘텐츠·판정 모델

- 모든 시나리오 작업의 시간, 선행 조건, 사람 수, 자원, 동시 진행 조건, 안전·품질 조건, 다음 작업은 처음부터 공개합니다. 접힌 `TaskCard`도 `summary`에 작업명·시간·핵심 조건을 남기고, 펼치면 설계 문서의 전체 필드를 읽을 수 있어 숨은 판정 조건이 생기지 않습니다.
- 관계 화면은 학생이 만든 관계와 아직 확인하지 않은 필수 관계를 각각 문장 목록으로 보여 줍니다. SVG는 시각 보조물이고 목록이 판정과 접근성의 주 경로입니다.
- 일정 화면은 모바일에서 단계 목록을 먼저 열고, 데스크톱에서는 시간축을 유지합니다. 드래그 없이 기존 `PlacementForm`으로 작업·시점·담당을 선택할 수 있습니다.
- 빠르지만 안전·품질·역할 공정을 어긴 일정은 기존 `evaluateSchedule` 결과대로 실패합니다. 여러 안전한 일정과 동률 절충은 기존 결정적 엔진을 그대로 통과시킵니다.
- 마지막 화면은 최초·수정 시간과 대기를 비교하고, 학생이 네 가지 근거를 완성한 뒤 “오늘 배운 점”과 “다음 도전”을 읽게 합니다. 추가 이름·순위·서버 전송은 하지 않습니다.

### 접근성·개인정보·안전

- 375px에서 가로 스크롤 없이 안내·관계 목록·단계 목록·보고서의 핵심 행동을 조작합니다. 44px 이상 클릭 영역, 명확한 포커스 표시, `aria-current`, `aria-live`, 오류 이동을 유지합니다.
- 키보드 Tab/Shift+Tab/Enter/Space로 시나리오 선택, 접기·펼치기, 관계 추가·삭제, 일정 입력, 보고서 입력을 완료합니다. 스크린 리더에 대한 구현 계약은 유지하되 VoiceOver 제품 기능과 VoiceOver 검증은 이번 범위에서 수행하지 않습니다.
- `prefers-reduced-motion: reduce`에서는 펄스가 정지한 3px 윤곽 강조로 바뀌며, 진행 애니메이션을 정지 화면과 텍스트 상태로 대체합니다.
- 업데이트 버튼은 콘텐츠를 가리지 않는 일반 문서 흐름의 `footer`에 두고, `aria-haspopup="dialog"`, `aria-controls`, 날짜·구분·설명을 가진 기존 `UpdateEntry` 목록을 유지합니다.
- 로컬 저장은 선택한 경우에만 역할 ID와 학습 진행을 저장하며, 개인 식별 정보·네트워크 요청·실제 생산성 평가는 추가하지 않습니다.

### MVP와 완료 기준

- 시나리오 4개, 각 5~7개 작업, 선행·병렬·제한 자원 1~2개, 실행·일시 정지·병목·수정 비교·교사용 요약은 그대로 유지합니다.
- 완료 기준은 (1) 모든 판정 근거 사전 공개, (2) 안전·품질 위반 일정 실패, (3) 선행·병렬·병목 설명, (4) 최초·수정 시간·대기·조건 비교, (5) 375px 키보드 전 미션 완료입니다.
- 한 소스 파일은 500줄 미만입니다. 새 컴포넌트는 학습 기능별로 분리하고 `npm run check:file-length`가 최대 499줄을 확인합니다.

## Visual thesis, content plan, interaction thesis

- **Visual thesis:** 크림색 종이 위의 차분한 파랑 작업판을 유지하되, 반복되는 상자보다 한 화면의 주 행동과 현재 단계가 먼저 보이는 계층을 만듭니다. 선택 상태는 색·테두리·텍스트를 함께 바꾸고, 관계·일정의 시각 장식은 의미 목록을 가리지 않습니다.
- **Content plan:** 상단에서 “무엇을 배우는지·이번 미션의 목표·다음 행동”을 짧게 안내하고, 전체 작업은 요약으로 훑은 뒤 필요한 카드만 펼칩니다. 각 단계에는 현재 행동·성공 조건·다음 단계 도움말을 붙이고, 마지막에는 배운 개념과 다음 도전을 한 문장으로 회수합니다.
- **Interaction thesis:** 첫 행동은 접힌 정보와 함께 빠르게 찾고, 한 단계의 필수 버튼 하나만 `gi-pulse`로 강조합니다. 모바일 관계는 목록 우선, 모바일 일정은 목록 우선, 업데이트 기록은 흐름 안에 둡니다. 모션 감소 설정에서는 동일한 상태 정보를 정적 윤곽과 텍스트로 제공합니다.

## Global Constraints

1. `/Volumes/ External Drive 256G/Dev2/codex/workflow-bottleneck-center` 안에서만 파일을 읽고 수정합니다. 기존 `.playwright-mcp/`와 사용자 변경을 삭제하거나 덮어쓰지 않습니다.
2. 구현은 현재 `codex/learner-ux-improvements` 브랜치에서 진행하며, 구현 중 GitHub push·Pages 배포·HVC 등록은 실행하지 않습니다. 배포가 필요하면 구현 검증 후 별도 사용자 지시를 받습니다.
3. 소스·설정·테스트 파일은 500줄 미만이며, 반복 문자열은 타입이 있는 상수나 작은 컴포넌트로 분리합니다.
4. 기존 `src/domain`의 시뮬레이션·검증·평가 결과와 로컬 저장 fail-closed 동작을 변경하지 않습니다. UI 변경으로 필요한 타입 변경은 기존 테스트가 판정 결과를 동일하게 확인하는 범위에서만 허용합니다.
5. `getRequiredAction`이 값을 반환하는 단계에서는 교육용 핵심 버튼이 정확히 하나만 `data-pulse="true"`가 되며, 값이 없는 실행·보고 단계에서는 pulse를 만들지 않습니다. 모든 경우 `prefers-reduced-motion`에서도 키보드 포커스와 정적 강조가 보입니다.
6. 학생 이름·로그인·순위·외부 AI·실제 일정 연동·서버·분석 SDK·학생용 음성 재생/녹음을 추가하지 않습니다. VoiceOver 구현·검증은 수행하지 않습니다.
7. 작업마다 실패 테스트를 먼저 추가하고, 최소 코드로 통과시킨 뒤 해당 테스트와 관련 회귀 테스트를 실행합니다. 계획에 적은 명령은 구현 시점에만 실행합니다.
8. 각 기능 변경과 함께 `src/data/updateHistory.ts`에 실제 날짜 `2026-08-28`의 짧은 `개선` 기록을 추가하고 중복 날짜·설명을 만들지 않습니다.
9. 계획·코드·테스트·문서에는 미완성 자리표시자나 앞선 작업을 가리키는 대체 문구를 사용하지 않습니다.

## 예상 파일 구조와 책임

```text
src/
├─ App.tsx                              # 단계 셸, 시나리오 네비게이션, footer 배치
├─ app/appSelectors.ts                  # 단계별 RequiredActionId 판정
├─ app/stageHelp.ts                     # LearningStage별 학습자 도움말 타입·콘텐츠
├─ components/
│  ├─ RequiredActionButton.tsx          # 단일 gi-pulse 핵심 버튼
│  ├─ StageHelpPanel.tsx                # 단계별 요약·다음 행동
│  ├─ ScenarioNavigation.tsx            # 선택 상태·키보드 이름
│  ├─ UpdateHistoryButton.tsx           # 흐름 안의 기록 버튼·dialog 연결
│  └─ ModalDialog.tsx                   # 기존 focus/inert/trap + dialog id
├─ data/
│  ├─ learnerCopy.ts                    # 초등학생용 공통 용어·문장
│  └─ updateHistory.ts                  # 날짜별 개선 기록
├─ features/briefing/
│  ├─ BriefingScreen.tsx                # 목표·다음 행동 조합
│  ├─ TaskCardSummary.tsx               # 모든 작업의 compact 조건 요약
│  └─ TaskCard.tsx                       # details 기반 전체 조건 공개
├─ features/relations/
│  ├─ RelationScreen.tsx                # 검증 시점·오류 이동
│  ├─ RelationRequirementList.tsx       # 필수 관계의 의미 목록
│  └─ RelationBoard.tsx                 # 데스크톱 보조 그래프·학생 관계 목록
├─ features/schedule/ScheduleEditor.tsx # viewport-aware 초기 목록/그리드
└─ features/report/
   ├─ EvidenceForm.tsx                  # 진행률·작은 입력 단계
   ├─ EvidenceProgress.tsx              # 네 근거 완료 수
   └─ ReportLearningWrapUp.tsx          # 오늘 배운 점·다음 도전
tests/ui/                               # 컴포넌트·문구·접근성 계약
e2e/learner-improvements.spec.ts        # 375px·키보드·레이아웃 회귀
docs/qa/learner-usability-verification.md # VoiceOver 제외 범위의 검증 기록
```

## Task 1 — 안내 화면의 첫 행동과 작업 카드 점진 공개

**목표:** 긴 안내를 “목표 → 전체 조건 요약 → 필요한 카드 펼치기 → 조건 확인” 순서로 바꾸어 첫 핵심 행동을 찾기 쉽게 합니다.

**Files·Interfaces**

- `src/features/briefing/TaskCard.tsx`: `TaskCardProps`에 `defaultOpen?: boolean`을 추가하고 `<details>`의 `summary`에 작업명·`duration`·선행 여부·사람 수·도구 수를 표시합니다. 펼친 본문은 기존 시간·선행·사람·도구·동시 진행·안전·품질·열림 정보를 모두 유지합니다.
- `src/features/briefing/TaskCardSummary.tsx`: `TaskCardSummaryProps { scenario: ScenarioDefinition }`를 정의하고 5~7개 작업의 핵심 조건을 `<ol>`로 렌더링합니다. 각 항목은 `data-testid="task-summary-item"`을 가집니다.
- `src/features/briefing/BriefingScreen.tsx`: `TaskCardSummary`를 목표 아래에 배치하고 상세 카드의 첫 카드만 `defaultOpen`으로 열며 `조건 확인`을 상세 카드 뒤가 아닌 요약 직후에 둡니다. 중복 가상 시간 안내는 한 문단으로 합치고 “이 버튼을 누르면 관계 연결로 이동”을 명시합니다.
- `src/styles/components.css`, `src/styles/layout.css`: summary, compact list, details marker, 모바일 간격을 정의하고 CTA가 1,800px 문서 위치 안에 오도록 합니다. 기존 `gi-pulse`와 44px 최소 높이를 유지합니다.
- `tests/ui/briefing.test.tsx`: 접힘 상태, summary 핵심 조건, 중복 문장 제거, CTA·`data-pulse`를 검증합니다.
- `tests/ui/accessibility.test.tsx`: 안내 단계의 heading·summary·button 접근 이름과 단일 pulse를 검증합니다.

**TDD 순서와 합격 조건**

1. 실패 테스트를 추가합니다: 렌더 직후 `[data-testid="task-summary-item"]`가 시나리오 작업 수와 같고, 상세 `<details>` 중 첫 항목만 `open`, `조건 확인`이 존재하며 “모든 시간은 교육용” 문단이 한 번만 존재해야 합니다.
2. `TaskCardSummary`와 `details` 최소 구현을 넣습니다. `TaskCard`의 모든 판정 필드는 펼침 상태에서도 기존 문자열과 값이 유지되어야 합니다.
3. `npm test -- tests/ui/briefing.test.tsx tests/ui/accessibility.test.tsx`가 통과하고, `npm run check:file-length`에서 변경 파일이 499줄 이하이면 완료입니다.

## Task 2 — 단계 도움말, 미션 선택 상태, 업데이트 기록, 필수 버튼 강조

**목표:** 현재 단계와 다음 행동을 화면마다 구체적으로 알려 주고, 선택·업데이트 UI가 모바일 콘텐츠를 가리지 않게 합니다.

**Files·Interfaces**

- `src/app/appSelectors.ts`: `RequiredActionId = "confirm-conditions" | "confirm-relations" | "run-simulation" | "mark-bottleneck" | "compare-revision"`; `getRequiredAction(attempt): RequiredActionId | null`로 관계 단계의 `confirm-relations`를 추가합니다.
- `src/app/stageHelp.ts`: `StageHelp { title: string; whatToDo: string; successHint: string }`와 `stageHelp: Record<LearningStage, StageHelp>`를 정의하고 안내·관계·일정·실행·분석·수정·보고의 초등학생용 문장을 제공합니다.
- `src/components/ScenarioNavigation.tsx`: `ScenarioNavigationProps { selectedScenarioId: ScenarioId; onSelect(id: ScenarioId): void }`; 선택 버튼에 `aria-current="page"`, `선택됨` 상태 텍스트, 시각적 배경·테두리 차이를 적용합니다.
- `src/components/StageHelpPanel.tsx`: `StageHelpPanelProps { stage: LearningStage }`; 현재 단계의 `whatToDo`와 `successHint`를 `<aside aria-labelledby>`로 렌더링합니다.
- `src/components/UpdateHistoryButton.tsx`: `aria-haspopup="dialog"`, `aria-controls="update-history-dialog"`, 문서 흐름용 `data-testid="update-history-trigger"`를 추가합니다.
- `src/components/ModalDialog.tsx`: `ModalDialogProps`에 `dialogId?: string`을 추가하고 dialog root에 id를 전달합니다.
- `src/features/relations/RelationScreen.tsx`: 관계 확인 버튼을 `RequiredActionButton actionId="confirm-relations"`로 연결합니다.
- `src/App.tsx`, `src/styles/layout.css`, `src/styles/components.css`: 네비게이션·도움말·업데이트 footer 배치, 선택 상태, `padding-bottom` 확보를 적용합니다. 업데이트 trigger를 `position: fixed`에서 일반 flow로 바꿉니다.
- `src/data/updateHistory.ts`: `{ date: "2026-08-28", category: "개선", description: "학습자 안내·모바일 탐색 흐름 개선" }` 한 항목을 추가합니다.
- `tests/app/appReducer.test.ts`: `getRequiredAction` 관계 단계 기대값을 추가합니다.
- `tests/ui/accessibility.test.tsx`, `tests/ui/update-history.test.tsx`(신규): 단계 도움말, 선택 상태, dialog 연결, footer 겹침 없음, pulse 하나를 검증합니다.

**TDD 순서와 합격 조건**

1. 실패 테스트로 관계 단계 `getRequiredAction`가 `confirm-relations`이고, 선택 버튼 하나만 `aria-current="page"`와 다른 computed background/border를 가지며, dialog id·`aria-controls`가 일치하도록 고정합니다.
2. 타입·컴포넌트·스타일을 최소 구현하고 `RelationScreen`의 `관계 확인`에 `RequiredActionButton actionId="confirm-relations"`를 사용합니다. 다른 단계는 기존 필수 행동 ID를 유지합니다.
3. `npm test -- tests/app/appReducer.test.ts tests/ui/accessibility.test.tsx tests/ui/update-history.test.tsx` 통과, 모바일 trigger와 주요 section의 bounding box가 겹치지 않음, `prefers-reduced-motion`에서 애니메이션 지속 시간이 `0s`인 조건을 확인합니다.

## Task 3 — 모바일 관계 이해와 검증 피드백

**목표:** 관계 그림을 읽지 못해도 필수 관계의 이유를 문장으로 확인하고, 처음부터 오류 경고가 화면을 점령하지 않도록 합니다.

**Files·Interfaces**

- `src/features/relations/RelationRequirementList.tsx`: `RelationRequirementListProps { scenario: ScenarioDefinition; missing: readonly DependencyEdge[]; headingId: string }`; `자료 확인 → 글 인쇄` 같은 관계를 “먼저 …, 그 다음 … — 안전/품질 이유”로 `<ol>`에 표시합니다.
- `src/features/relations/RelationBoard.tsx`: `RelationRequirementList`를 의미 목록과 SVG 사이에 렌더링하고, SVG는 `aria-hidden="true"` 보조물로 유지합니다. 학생이 만든 관계 목록과 필수 관계 힌트를 각각 제목으로 구분합니다.
- `src/features/relations/RelationScreen.tsx`: `hasValidated` 상태를 추가해 첫 진입에는 `필수 관계 힌트`를 안내하고 `관계 확인` 클릭 후에만 invalid 오류 summary를 `role="alert"`로 포커스합니다. valid-with-extra 설명은 유지합니다.
- `src/styles/components.css`, `src/styles/layout.css`: 모바일에서 SVG를 숨기거나 장식 크기를 줄이고 의미 목록을 전체 너비로 표시하며, 데스크톱에서는 SVG 최소 높이 280px과 목록 가독성을 유지합니다.
- `tests/ui/relations.test.tsx`: 초기 필수 관계 목록 개수·문장, 클릭 전 alert 부재, 잘못된 확인 뒤 alert·포커스, 여분 관계 안내를 검증합니다.
- `e2e/learner-improvements.spec.ts`: 375px에서 필수 관계 목록이 보이고 SVG 텍스트가 유일한 학습 경로가 아님을 검증합니다.

**TDD 순서와 합격 조건**

1. 실패 테스트로 zero-edge 시나리오에서 `missingRequired.length`와 같은 수의 문장 목록이 존재하고, 첫 렌더에는 `role="alert"`가 없으며, `관계 확인` 클릭 뒤 invalid alert가 생기는 동작을 고정합니다.
2. `RelationRequirementList`, 검증 상태, 반응형 CSS를 구현하고 관계 확인 버튼은 작업 2의 `RequiredActionButton`으로 교체합니다.
3. `npm test -- tests/ui/relations.test.tsx`와 관계 E2E가 통과하고, 375px `scrollWidth === clientWidth`, 각 목록 삭제·추가 버튼의 높이 44px 이상을 확인합니다.

## Task 4 — 모바일 일정 목록 기본값과 용어 정리

**목표:** 작은 화면에서 시간축을 억지로 밀지 않고 단계 목록부터 작업을 배치하며, 역할·도구 안내를 어린이가 이해할 말로 바꿉니다.

**Files·Interfaces**

- `src/features/schedule/ScheduleEditor.tsx`: `ScheduleView = "grid" | "list"`를 export하고 `initialScheduleView(): ScheduleView`를 정의합니다. `matchMedia("(max-width: 600px)")`가 true인 브라우저에서만 `list`, 그 밖에는 `grid`로 시작하며 사용자가 버튼으로 전환할 수 있습니다.
- `src/features/schedule/TimelineStepList.tsx`, `src/features/schedule/PlacementForm.tsx`: “역할 A·B·C는 능력 이름이 아니라 맡은 자리 이름입니다” 안내와 “몇 단위부터 시작할까요?” 같은 어린이용 label을 추가하되 기존 field name·검증값은 유지합니다.
- `src/styles/components.css`, `src/styles/layout.css`: `.timeline-grid`의 34rem 최소 폭은 데스크톱에만 적용하고 모바일 list·switch를 우선 표시합니다. 가로 스크롤이 필요한 grid에는 명시적인 “옆으로 움직여 시간 보기” 안내를 둡니다.
- `tests/ui/schedule.test.tsx`: `window.matchMedia` mock에서 list 기본값, grid 전환, native select 키보드 입력, role 안내를 검증합니다.
- `e2e/learner-improvements.spec.ts`: 375px 일정 화면에서 `단계 목록 보기`가 기본이고 전체 문서 가로 폭이 viewport와 같음을 검증합니다.

**TDD 순서와 합격 조건**

1. 실패 테스트로 small viewport에서 `TimelineStepList`가 보이고 `TimelineGrid`가 보이지 않으며, desktop mock에서는 반대인 동작을 추가합니다.
2. viewport-safe 초기 상태와 문구·CSS를 최소 구현하고 기존 `PlacementForm`의 task/start/role 선택 순서를 그대로 둡니다.
3. `npm test -- tests/ui/schedule.test.tsx`와 E2E가 통과하고 Tab 순서가 view switch → 작업 선택 → 시작 시점 → 담당 선택 → 실행으로 이어지는지 확인합니다.

## Task 5 — 분석·보고 문장과 학습 회수 개선

**목표:** “병목·인과·영향 경로”를 쉬운 문장으로 안내하고, 보고서에 진행률과 배운 점을 추가해 학생이 완료 의미를 이해하게 합니다.

**Files·Interfaces**

- `src/data/learnerCopy.ts`: `LearnerCopy { stageLabels: Record<LearningStage, string>; analysisTerms: Record<string, string>; reportHints: Record<"dependency" | "parallel" | "bottleneck" | "tradeoff", string> }`와 검증된 문구를 export합니다.
- `src/features/analysis/AnalysisScreen.tsx`, `src/features/analysis/BottleneckPanel.tsx`, `src/features/simulation/BottleneckPrediction.tsx`: 제목·설명을 “뒤 작업을 기다리게 만든 곳”, “기다림의 원인”, “내가 먼저 예상한 이유”로 바꾸고 도메인 `finding.id`·`blockerLabel`은 그대로 사용합니다.
- `src/features/report/EvidenceProgress.tsx`: `EvidenceProgressProps { completed: number; total: number }`; `aria-label="근거 문장 진행률"`과 `completed/total`을 표시합니다.
- `src/features/report/EvidenceForm.tsx`: 네 근거의 완료 여부를 계산해 `EvidenceProgress`를 위에 표시하고 각 fieldset에 한 줄 예시와 “다음에 채울 칸” 안내를 추가합니다. 저장 필드명·select 값·완료 판정은 바꾸지 않습니다.
- `src/features/report/ReportLearningWrapUp.tsx`: `ReportLearningWrapUpProps { scenario: ScenarioDefinition; comparison: AttemptComparison | null; selectedFinding: BottleneckFinding | null }`; 시간 단축만 칭찬하지 않고 “오늘 배운 점” 세 문장과 “다음 도전” 한 문장을 렌더링합니다.
- `src/features/report/ReportScreen.tsx`, `src/styles/components.css`: wrap-up을 완료 버튼 전에 배치하고 모바일 fieldset 간격·예시 대비·완료 버튼을 정리합니다. 교사용 `TeacherSummaryView`와 print 제외 규칙은 유지합니다.
- `tests/ui/analysis-report.test.tsx`: 쉬운 제목, evidence progress `0/4`→`4/4`, 배운 점·다음 도전, 기존 안전 실패 문구를 검증합니다.

**TDD 순서와 합격 조건**

1. 실패 테스트로 보고서 초기 상태에서 진행률 `0/4`, 각 네 입력의 example, `오늘 배운 점`, `다음 도전`이 존재하고, 완성 상태에서 `4/4`와 기존 완료 버튼이 존재하도록 고정합니다.
2. copy 상수·진행률·wrap-up을 최소 구현하고 `evaluator`의 성공/실패 문구와 교사용 출력은 변경하지 않습니다.
3. `npm test -- tests/ui/analysis-report.test.tsx tests/domain/teacherSummary.test.ts` 통과, 375px에서 fieldset·버튼이 잘리지 않음, 인쇄 스타일에서 learner controls가 제외됨을 확인합니다.

## Task 6 — 회귀 E2E, 문서 동기화, 검증 원장

**목표:** 개선된 학습자 여정과 배포 하위 경로·네트워크·모션·파일 길이 계약을 한 번에 확인하고 설계 문서의 낡은 표현을 정리합니다.

**Files·Interfaces**

- `playwright.config.ts`: `WORKFLOW_E2E_PORT` 환경변수를 숫자로 검증해 기본 4173 또는 지정 포트의 `baseURL`·preview command를 만들도록 합니다. 기본 포트가 사용 중인 경우 `WORKFLOW_E2E_PORT=4174 npm run test:e2e`로 안전하게 실행합니다.
- `e2e/learner-improvements.spec.ts`: 375px 안내 CTA 위치(문서 y < 1,800), scenario selected computed style, update trigger와 콘텐츠 비겹침, 관계 required list, schedule list default, 7개 단계의 제목·고유 도움말 문장, 네 시나리오 전체 경로의 no external request·console/page error 0을 검증합니다. 모든 하위 경로 이동은 `page.goto('./')`를 사용합니다.
- `docs/qa/learner-usability-verification.md`: 375px·키보드·reduced-motion·네트워크·인쇄 검증 결과와 VoiceOver 제외 범위를 기록합니다. VoiceOver 통과를 주장하지 않습니다.
- `README.md`: 모바일 지원을 “관계 의미 목록과 일정 단계 목록을 우선 제공하며 시간축은 필요시 가로로 본다”로 수정하고 최신 개선 기록·검증 명령을 추가합니다.
- `2026-08-26-workflow-bottleneck-center-design.md`: 문서 상태를 구현 완료 검토본으로, 업데이트 표의 구현일 placeholder를 실제 `2026-08-27` 기존 기록과 `2026-08-28` 개선 기록으로 동기화하고, 모바일 목록 우선 상호작용을 반영합니다.
- `src/data/updateHistory.ts`: 앞선 작업에서 추가한 날짜 기록이 정확히 한 번만 존재하는지 확인합니다.

**TDD 순서와 합격 조건**

1. 실패 E2E를 먼저 추가합니다: CTA 위치·non-overlap·selected style·mobile relation/schedule·stage help·same-origin requests·console/page errors·reduced motion·print controls exclusion 각각을 명시적으로 assert합니다.
2. 포트 설정·E2E·문서 동기화를 최소 구현합니다. 기존 public URL이나 GitHub workflow 파일은 수정하지 않습니다.
3. 다음 명령을 순서대로 실행합니다.

```sh
npm run lint
npm run typecheck
npm test
npm run check:file-length
npm run build
WORKFLOW_E2E_PORT=4174 npm run test:e2e
git diff --check
```

예상 결과는 lint/typecheck/build 성공, Vitest 전체 기존 173개 이상 + 새 UI 테스트 통과, file-length 최대 499줄, Playwright 기존 31개 이상 + 개선 E2E 전체 통과, diff whitespace 오류 0입니다. `Canvas getContext`·localStorage jsdom 경고가 남으면 테스트 실패와 분리해 기록하고 제품 오류로 판정하지 않습니다.

## 향후 커밋 단계

구현 에이전트는 각 작업의 테스트와 소스만 묶어 다음 로컬 커밋을 만들고, 커밋·푸시·배포는 이 계획의 모든 검증과 최종 리뷰가 끝난 뒤 사용자 지시가 있을 때만 실행합니다.

```sh
git add src/features/briefing src/styles tests/ui/briefing.test.tsx tests/ui/accessibility.test.tsx
git commit -m "feat: simplify learner briefing flow"
git add src/app src/components src/data/updateHistory.ts src/App.tsx src/styles tests/app/appReducer.test.ts tests/ui/update-history.test.tsx
git commit -m "feat: clarify stage actions and selection state"
git add src/features/relations src/styles tests/ui/relations.test.tsx
git commit -m "feat: make relation guidance readable on mobile"
git add src/features/schedule src/styles tests/ui/schedule.test.tsx
git commit -m "feat: default mobile scheduling to step list"
git add src/data/learnerCopy.ts src/features/analysis src/features/report src/styles tests/ui/analysis-report.test.tsx
git commit -m "feat: add learner-friendly report wrap-up"
git add playwright.config.ts e2e/learner-improvements.spec.ts docs/qa/learner-usability-verification.md README.md 2026-08-26-workflow-bottleneck-center-design.md src/data/updateHistory.ts
git commit -m "test: record learner usability regression gates"
```

## 자체 검토 체크리스트

- [ ] 설계 문서의 학습 목표·앱 차별성·핵심 흐름·콘텐츠·판정 모델을 작업 1·3·4·5에 연결했습니다.
- [ ] 접근성·개인정보·안전·MVP·완료 기준을 Global Constraints와 작업 2·3·4·6에 연결했습니다.
- [ ] `gi-pulse`, reduced motion, 업데이트 날짜 기록, 모바일·키보드·스크린 리더 계약(VoiceOver 제외)을 별도 작업으로 적었습니다.
- [ ] 모든 작업에 정확한 경로·인터페이스·테스트 대상·합격 조건·TDD 순서·향후 명령이 있습니다.
- [ ] 계획 자체에 자리표시자 표현을 사용하지 않았고, 각 새 소스 파일을 500줄 미만으로 분리했습니다.
