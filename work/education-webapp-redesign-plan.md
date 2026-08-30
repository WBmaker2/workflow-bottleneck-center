# Workflow Bottleneck Center Implementation Plan

> 실행 범위: 기존 Vite + React + TypeScript 교육용 SPA의 안전한 표현 계층 리디자인
> 작성일: 2026-08-29
> 현재 기준 브랜치: `codex/learner-ux-improvements`

## Goal

초등학교 5~6학년 학생이 “무엇을 배우는지 → 지금 무엇을 하는지 → 왜 필요한지 → 다음에 무엇을 누르는지”를 첫 화면과 모든 학습 단계에서 즉시 이해하도록 화면 계층을 다시 설계합니다. `[6실05-01]`의 알고리즘 표현 목표에 맞춰 `작업 카드 읽기 → 선행·병렬 관계 연결 → 사람·도구 배치 → 가상 실행 → 기다림 원인 예측 → 병목 표시 → 일정 수정 → 근거 설명` 흐름을 유지하면서, 다음을 개선합니다.

- 375px 첫 화면에서 핵심 행동을 문서 1,200px 이내에 배치하고, 긴 조건은 접을 수 있는 상세 영역으로 남깁니다.
- 일곱 단계 진행 상황을 텍스트와 `aria-current`로 보여 주어 현재 위치와 다음 행동을 빠르게 파악하게 합니다.
- 네 시나리오를 제목만 나열하지 않고 연습할 제약을 한 줄로 설명하며 선택 상태를 색·테두리·텍스트로 함께 구분합니다.
- 관계·일정·실행·분석·수정·보고 화면을 활동별 카드 계층으로 나누되, 도메인 판정·저장·안전 문구는 바꾸지 않습니다.
- 모바일·키보드·reduced-motion·인쇄·업데이트 기록을 별도 검증하고 VoiceOver 구현·검증은 범위에서 제외합니다.

## Architecture

현재 `src/App.tsx`의 상태 셸과 `AppProvider`를 유지합니다. `src/domain`의 시나리오·검증·시뮬레이션·평가 엔진을 UI에서 분리한 현재 구조를 보존하고, 새 컴포넌트는 읽기 전용 표현과 레이아웃만 담당합니다.

```text
AppProvider
└─ AppShell
   ├─ AppMasthead                         # 서비스명·학습 질문·가상 시간 경계
   ├─ ScenarioNavigation                   # 미션 카드·선택 상태
   ├─ AppProgressAside
   │  └─ StageProgress                     # 일곱 단계·완료/현재/잠김 상태
   ├─ StageFrame
   │  ├─ StageHelpPanel                    # 지금 할 일·성공 조건
   │  └─ stage-owned screen
   │     ├─ BriefingScreen                  # 목표·조건·작업 카드
   │     ├─ RelationScreen                  # 문장 우선 관계 편집
   │     ├─ ScheduleScreen                  # 목록/시간표 배치
   │     ├─ SimulationScreen                # 실행·기다림 예측
   │     ├─ AnalysisScreen                  # 병목 선택
   │     ├─ RevisionScreen                  # 수정안 비교
   │     └─ ReportScreen                    # 근거·학습 회수
   └─ UpdateHistoryButton + ModalDialog
```

`AppMasthead`, `StageProgress`, `StageFrame`은 시각 계층을 담당하고 도메인 상태를 변경하지 않습니다. `getRequiredAction`의 다섯 유니온 값과 `RequiredActionButton` 계약은 그대로 사용하며, 현재 단계에서 `data-pulse="true"`인 버튼은 최대 하나입니다.

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 7 정적 SPA
- Vitest 4 + Testing Library + `vitest-axe` 단위·UI 접근성 테스트
- Playwright Chromium E2E, 저장소 하위 경로에서도 `page.goto('./')` 사용
- 기존 CSS 파일과 시스템 글꼴. 외부 폰트·아이콘·분석 SDK·이미지 CDN 없음
- 기존 `npm run lint`, `npm run typecheck`, `npm test`, `npm run check:file-length`, `npm run build`, `npm run verify` 명령 사용

## 2026-08-30 스킬·규칙 재확인

- `education-webapp-redesign`: `/Users/kimhongnyeon/.codex/skills/education-webapp-redesign/SKILL.md`와 `references/asset-safety.md`를 다시 읽고, 본 계획과 자산 경계를 현재 구현에 적용했습니다.
- `impeccable`: `/Users/kimhongnyeon/.agents/skills/impeccable/SKILL.md` 및 `reference/init.md`, `reference/new-work.md`, `reference/craft-floor.md`, `reference/operate.md`를 2026-08-30 12:49 KST에 읽었습니다. 기존 `design-system/MASTER.md`가 시각 기준을 이미 정하므로 새 시각 세계를 만들지 않고, 변경 UI에 `detect.mjs --json`을 한 번 실행했습니다.
- `redesign-existing-projects`: `/Users/kimhongnyeon/.agents/skills/redesign-existing-projects/SKILL.md`를 2026-08-30 12:49 KST에 읽고 기존 Vite·React 구조를 보존하는 표적 보완 원칙을 적용했습니다.
- `imagegen`: `/Users/kimhongnyeon/.codex/skills/imagegen/SKILL.md`를 읽었습니다. 현재 화면에는 장식·사실 이미지가 필요하지 않아 생성하지 않았고, `work/education-webapp-redesign-assets.md`에 기록했습니다.
- `ui-ux-pro-max`: 현재 세션의 사용 가능한 스킬 목록에 정확한 이름으로 제공되지 않아 사용하지 않았습니다. 대체로 `design-system/MASTER.md`와 `impeccable` 품질 기준을 사용했으며, 이름이 비슷한 다른 스킬을 해당 스킬로 주장하지 않습니다.
- 제품 진실은 새 `PRODUCT.md`에 저장소 근거와 추론을 구분해 기록했습니다. `DESIGN.md`는 만들지 않았고, 기존 `design-system/MASTER.md`를 프로젝트 시각 권위로 유지합니다.

## Spec

### 학습 목표와 기존 앱과의 차별성

- 선행·병렬·제한 자원·역할 공정성을 화면 첫 부분에 짧은 텍스트로 반복해 절차적 사고를 지원합니다.
- 코딩 명령 실행 앱처럼 한 줄 명령만 강조하지 않고, 여러 작업의 관계와 기다림을 선택하게 합니다.
- 배분 앱처럼 결과 순위를 만들지 않고, 안전·품질·역할을 함께 지킨 일정의 근거를 남깁니다.
- 산업 장비나 아동 노동을 연상시키는 이미지는 추가하지 않고, 모든 시간은 교육용 가상 단위라는 경계를 유지합니다.

### 핵심 학습 흐름

| 단계 | 학생 행동 | 리디자인 표현 |
|---|---|---|
| 안내 | 카드와 조건 읽기 | 상단 `이번 미션` 카드, 세 가지 약속, 요약 → 상세 순서 |
| 관계 설계 | 먼저/다음 연결 | 의미 문장 목록을 편집기보다 먼저 노출, 그래프는 보조 |
| 일정표 | 시작·역할 선택 | 600px 이하 단계 목록 기본, 시간표는 명시적 전환 |
| 가상 실행 | 기다림 관찰·예측 | 현재 시간·상태·기다림을 분리한 관찰 카드 |
| 병목 분석 | 원인 표시 | “뒤 작업을 기다리게 만든 곳”을 원인/지연/영향으로 분리 |
| 수정 | 안전한 대안 비교 | 최초/수정 지표와 보존된 조건을 같은 카드에 표시 |
| 보고 | 네 근거와 다음 도전 | 진행률, 작은 입력 단계, 오늘 배운 점, 다음 도전 |

### 콘텐츠·판정 모델

- `ScenarioDefinition`의 작업 시간, 선행 관계, 사람 수, 자원, 동시 진행, 안전·품질 조건, `unlocks`를 모두 학생이 확인합니다.
- `validateRelationMap`, `isScheduleReady`, `simulateSchedule`, `evaluateSchedule`, `analyzeBottlenecks`, `canEnterStage`의 결과와 함수 시그니처는 변경하지 않습니다.
- 빠르지만 안전·품질·공정성을 위반한 일정은 기존 실패 결과를 그대로 표시합니다. 동률·다른 안전한 절충도 기존 엔진대로 통과시킵니다.
- UI copy만 쉬운 문장으로 바꾸며, `finding.id`, `WaitReason`, `AttemptComparison`, 저장 필드명은 유지합니다.

### 접근성·개인정보·안전

- `h1` 하나, 단계 프레임의 `h2`, 활동 카드의 `h3` 계층을 지킵니다.
- 모든 버튼·select·checkbox·radio·input은 44px 이상, `:focus-visible` 3px 윤곽선, 명확한 한국어 이름을 갖습니다.
- 단계 진행에는 `aria-current="step"`, 선택 시나리오에는 `aria-current="page"`, 상태에는 `role="status"`, 오류에는 `role="alert"`을 사용합니다.
- 단계 전환 시 활동 heading에 포커스를 보내고, 오류·저장 실패·관계 변경을 live region으로 알립니다.
- 375px에서 document 가로 스크롤을 만들지 않으며 관계 목록과 일정 단계 목록을 그래프·시간축보다 먼저 둡니다.
- `prefers-reduced-motion: reduce`에서는 `gi-pulse` 애니메이션과 전환을 정지하고 동일한 의미의 정적 윤곽선으로 대체합니다.
- 로컬 저장은 기존 선택 기능만 유지합니다. 학생 이름, 로그인, 순위, 외부 AI, 실제 일정, 서버 저장, 학생 음성·녹음 기능을 추가하지 않습니다.
- VoiceOver 구현·검증은 수행하지 않습니다. 일반 스크린 리더용 semantic/ARIA 계약과 자동 검사는 유지합니다.

### MVP와 완료 기준

- 시나리오 4개, 각 5~7개 작업, 선행·병렬·제한 자원 1~2개, 실행·일시정지·병목·수정 비교·교사용 요약을 유지합니다.
- 모든 판정 근거를 사전 공개하고, 네 가지 근거 문장과 최초/수정 시간·대기·조건을 비교합니다.
- 네 시나리오를 375px·키보드로 드래그 없이 끝까지 조작할 수 있습니다.
- 모든 변경 소스 파일은 `npm run check:file-length` 기준 499줄 이하입니다.

## Visual thesis

“작업판 위에 놓인 한 장의 미션 카드”를 중심으로, 따뜻한 종이 배경 위에 차분한 파랑(현재 단계), 초록(품질/완료), 주황(안전/포커스), 황갈색(기다림)을 사용합니다. 반복되는 테두리 상자를 줄이고, 화면 위쪽의 큰 제목·단계 진행·현재 행동을 가장 강하게 보이게 합니다. 색은 항상 짧은 라벨과 문장을 동반합니다.

## Content plan

- 서비스 상단: “먼저 할 일과 함께 할 일을 구분하면 기다림을 줄일 수 있어요.”
- 미션 선택: 제목 + 연습 제약(예: “프린터 1대와 선행 관계를 살펴봐요.”)
- 모든 단계: `지금 할 일`, `성공하려면`, `다음 행동`의 짧은 문장
- 보고서: “오늘 배운 점” 3문장과 “다음 도전” 1문장. 시간 단축만 칭찬하지 않음
- 업데이트 기록: `2026-08-29` 리디자인 기록을 실제 날짜로 추가

## Interaction thesis

첫 행동은 화면 시작부에서 한 번만 강조합니다. 한 단계의 필수 행동 버튼만 `gi-pulse`를 사용하고, 사용자가 클릭하면 다음 heading으로 포커스가 이동합니다. 긴 정보는 `details`로 펼치되 summary에 핵심 조건을 남깁니다. 모바일에서 그래프·시간축을 억지로 확대하지 않고 텍스트 목록과 단계 목록으로 먼저 행동하게 합니다.

## Global Constraints

1. 작업 디렉터리 `/Volumes/ External Drive 256G/Dev2/codex/workflow-bottleneck-center` 내부만 읽고 수정합니다. 기존 `.playwright-mcp/`와 사용자 변경은 삭제하지 않습니다.
2. 현재 브랜치에서 구현하며 GitHub commit, push, Pages deploy, HVC 등록·동기화는 이 요청에서 실행하지 않습니다.
3. 소스·설정·테스트 파일 하나는 500줄 미만이어야 합니다. 길어지는 컴포넌트는 기능별 파일로 분리합니다.
4. `src/domain`, `src/storage`, `src/app/appReducer.ts`의 판정·저장 동작은 UI 리디자인에 필요하지 않으면 수정하지 않습니다.
5. `getRequiredAction`이 값을 반환하는 단계의 핵심 버튼은 정확히 하나만 `data-pulse="true"`이고, 실행·보고처럼 값이 없는 단계에는 새 pulse를 만들지 않습니다.
6. 학생 개인정보, 외부 요청, 네트워크 저장, 학생 음성 기능, 실제 장비 사용 지시를 추가하지 않습니다.
7. 구현 에이전트는 각 단계마다 실패 테스트 → 최소 구현 → 관련 테스트 통과 순서를 지키고, 작성한 명령은 구현 시점에만 실행합니다.
8. 변경 날짜 `2026-08-29`의 짧은 개선 기록을 `src/data/updateHistory.ts`에 한 번만 추가합니다.
9. 계획·문서·코드에 미완성 표기나 다른 단계로 책임을 넘기는 대체 문구를 쓰지 않습니다.
10. 이미지 사용은 현재 `public/favicon.svg`와 데이터 기반 관계 SVG만 보존합니다. 일반 장식 이미지가 필요해질 때만 `imagegen` 사전 검토 후 자산 기록을 갱신합니다.

## 예상 파일 구조와 책임

```text
src/
├─ App.tsx                              # AppMasthead·ScenarioNavigation·progress·StageFrame 조합
├─ app/stageHelp.ts                     # 단계별 학생용 안내 문장
├─ components/
│  ├─ AppMasthead.tsx                   # 서비스명·학습 질문·가상 시간 안내
│  ├─ StageProgress.tsx                 # StageProgressProps와 단계 상태 목록
│  ├─ StageFrame.tsx                    # 공통 프레임 heading·도움말·활동 슬롯
│  ├─ ScenarioNavigation.tsx            # 미션 설명·선택 상태
│  ├─ StageHelpPanel.tsx                # 지금 할 일·성공 조건
│  ├─ RequiredActionButton.tsx          # 단일 gi-pulse 계약
│  └─ UpdateHistoryButton.tsx           # 문서 흐름 footer와 dialog 연결
├─ data/
│  ├─ learnerCopy.ts                    # 공통 학습자 용어
│  └─ updateHistory.ts                  # 날짜별 개선 기록
├─ features/briefing/
│  ├─ BriefingScreen.tsx                # 미션 카드 순서
│  ├─ MissionOverview.tsx               # 목표·약속·다음 행동
│  ├─ TaskCardSummary.tsx               # 핵심 조건 목록
│  └─ TaskCard.tsx                      # 전체 조건 details
├─ features/relations/                  # 목록 우선 관계 편집·그래프 보조
├─ features/schedule/                   # 목록/시간표 반응형 보기
├─ features/simulation/                 # 상태 카드·실행 제어
├─ features/analysis/                   # 병목 선택·영향 경로
├─ features/revision/                   # 비교 지표·안전 피드백
└─ features/report/                     # 진행률·근거·학습 회수
design-system/MASTER.md                 # 이번 리디자인의 토큰·접근성·콘텐츠 규칙
work/education-webapp-redesign-audit.md # 초기 감사와 기준선
work/education-webapp-redesign-assets.md# 자산 분류·생성 여부
work/education-webapp-redesign-plan.md  # 본 계획
work/education-webapp-redesign-report.md# 최종 자동/수동/인간 검토 원장
tests/ui/                               # 컴포넌트 계약과 접근성
e2e/learner-improvements.spec.ts        # 모바일·키보드·전 경로 회귀
```

## 작업별 Files·Interfaces와 TDD 순서

### Task 1 — 공통 마스트헤드·단계 진행 트랙

**Files**

- `src/components/AppMasthead.tsx`: `AppMastheadProps { stage: LearningStage; scenarioTitle: string }`. 서비스명, 학습 질문, “가상 시간” pill을 렌더링합니다.
- `src/components/StageProgress.tsx`: `StageProgressProps { currentStage: LearningStage }`; `StageProgressItem { stage: LearningStage; label: string; state: "complete" | "current" | "locked" }`를 내부에서 계산하고 `aria-current="step"`를 현재 항목에만 적용합니다.
- `src/components/StageFrame.tsx`: `StageFrameProps { scenarioTitle: string; stage: LearningStage; children: React.ReactNode }`; 시나리오 제목·현재 단계·`StageHelpPanel`·활동 slot을 공통 프레임으로 감쌉니다.
- `src/App.tsx`: 기존 화면 분기와 reducer dispatch는 유지하고 위 세 컴포넌트를 마스트헤드·progress aside·stage content에 배치합니다.
- `src/styles/tokens.css`, `src/styles/layout.css`: `--content-width`, `--rail-width`, `--stage-gap`, `.app-masthead`, `.stage-progress`, `.stage-frame` 토큰과 반응형 규칙을 추가합니다.
- `tests/ui/app-smoke.test.tsx`, `tests/ui/accessibility.test.tsx`: 서비스 질문, 현재/완료/잠김 단계, 단일 h1, `aria-current="step"`를 검증합니다.

**TDD**

1. 실패 테스트: 첫 렌더에 `data-testid="stage-progress"`가 7개 단계와 하나의 `aria-current="step"`를 갖고, 서비스 질문과 `가상 시간`이 보이며 h1이 하나인지 고정합니다.
2. `AppMasthead`, `StageProgress`, `StageFrame` 최소 구현과 CSS를 추가합니다. 현재 화면 분기·reducer 입력은 건드리지 않습니다.
3. `npm test -- tests/ui/app-smoke.test.tsx tests/ui/accessibility.test.tsx`가 통과하고 `npm run check:file-length`가 새 파일을 499줄 이하로 보고하면 완료합니다.

### Task 2 — 시나리오 카드와 브리핑 정보 우선순위

**Files**

- `src/components/ScenarioNavigation.tsx`: `ScenarioNavigationProps`를 유지하고 `scenarioNavigationCopy: Record<ScenarioId, string>`를 사용해 제목·제약 한 줄·선택 상태를 렌더링합니다. 인라인 `style`은 제거합니다.
- `src/features/briefing/MissionOverview.tsx`: `MissionOverviewProps { scenario: ScenarioDefinition }`; 목표 시간, 안전·품질·협력 약속, 다음 행동을 세 개의 짧은 block으로 렌더링합니다.
- `src/features/briefing/BriefingScreen.tsx`: `MissionOverview`를 안내 첫 부분에 배치하고 상세 작업 카드 뒤에 중복 문장을 만들지 않습니다. `TaskCardSummary`의 모든 조건은 유지하며 `조건 확인`은 문서 y 1,200px 이내를 목표로 합니다.
- `src/styles/components.css`, `src/styles/layout.css`: `.mission-overview`, `.scenario-navigation__meta`, `.briefing-next-action`, summary/card spacing을 정의합니다.
- `tests/ui/briefing.test.tsx`, `tests/ui/accessibility.test.tsx`, `e2e/learner-improvements.spec.ts`: 핵심 요약·선택 상태·단일 pulse·모바일 버튼 위치와 details 보존을 검증합니다.

**TDD**

1. 실패 테스트: `MissionOverview`에 목표 시간·세 약속·`조건 확인` 설명이 보이고, 첫 details 하나만 열리며 요약 작업 수가 시나리오 작업 수와 같은지 고정합니다. 375px에서 조건 확인 y가 1,200px 미만인지 고정합니다.
2. 카드·브리핑 순서를 최소 구현합니다. `TaskDefinition` 필드와 evaluator 문구는 그대로 출력합니다.
3. `npm test -- tests/ui/briefing.test.tsx tests/ui/accessibility.test.tsx`와 `WORKFLOW_E2E_PORT=4174 npx playwright test e2e/learner-improvements.spec.ts --grep "opening viewport|task summary|scenario navigation"` 통과를 확인합니다.

### Task 3 — 관계·일정 활동 카드의 반응형 계층

**Files**

- `src/features/relations/RelationScreen.tsx`, `RelationBoard.tsx`, `RelationRequirementList.tsx`, `src/styles/relation.css`: 의미 목록 → 편집기 → 학생 관계 → 보조 그래프 순서를 유지하되 카드 heading과 안내를 분리합니다. `RelationValidation` 계산과 `confirm-relations` pulse는 유지합니다.
- `src/features/schedule/ScheduleEditor.tsx`: `ScheduleView`와 `initialScheduleView()` 인터페이스를 유지하고 보기 전환을 “단계 목록 우선/시간표 보기”로 명확히 표시합니다.
- `src/features/schedule/TimelineStepList.tsx`, `TimelineGrid.tsx`, `PlacementForm.tsx`, `src/styles/layout.css`, `src/styles/components.css`: 작업 배치 폼, 목록, 내부 시간축 스크롤의 시각 순서와 44px 영역을 정의합니다.
- `tests/ui/relations.test.tsx`, `tests/ui/schedule.test.tsx`, `e2e/learner-improvements.spec.ts`: 375px 목록 우선, graph hidden, grid 전환, no overflow, 키보드 select 순서를 검증합니다.

**TDD**

1. 실패 테스트: 375px 관계 화면에서 필수 관계 의미 목록이 편집기보다 먼저 보이고 SVG가 학습 경로가 아니며, 일정 화면에서 단계 목록이 기본으로 보이고 grid가 숨겨지는지 고정합니다.
2. CSS와 작은 heading/label 컴포넌트를 최소 구현합니다. 관계·일정 도메인 검증은 수정하지 않습니다.
3. `npm test -- tests/ui/relations.test.tsx tests/ui/schedule.test.tsx`와 관련 E2E가 통과하고 document scrollWidth가 viewport 이하이면 완료합니다.

### Task 4 — 실행·분석·수정의 관찰 카드와 핵심 행동

**Files**

- `src/features/simulation/SimulationScreen.tsx`, `SimulationControls.tsx`, `SimulationTimeline.tsx`: `PlaybackState`와 `WaitInterval` 결과를 바꾸지 않고 현재 시간·실행 상태·기다림을 `simulation-observation-card`로 분리합니다.
- `src/features/analysis/AnalysisScreen.tsx`, `BottleneckPanel.tsx`: `BottleneckFinding`의 원인·지연·영향 경로를 카드 metadata로 보여 주고 기존 `mark-bottleneck` pulse와 선택 검증을 유지합니다.
- `src/features/revision/RevisionScreen.tsx`, `AttemptComparisonTable.tsx`: 안전·품질·공정성 보존 상태를 비교 카드의 텍스트와 배지로 함께 보여 줍니다.
- `src/data/learnerCopy.ts`, `src/styles/components.css`, `src/styles/motion.css`: 짧은 관찰 문장, 상태 배지 토큰, reduced-motion 정적 강조를 정의합니다.
- `tests/ui/simulation.test.tsx`, `tests/ui/analysis-report.test.tsx`, `tests/ui/accessibility.test.tsx`: 실행 상태, 예측 gate, 병목 선택, 안전 실패, 단일 pulse, reduced motion을 검증합니다.

**TDD**

1. 실패 테스트: 실행 전에는 engine reason이 노출되지 않고, 기다림 시 prediction gate가 보이며, 분석 카드가 `원인/늦어진 작업/대기`를 모두 포함하고 선택 후에만 수정이 열리는지 고정합니다.
2. 관찰 카드와 용어 최소 구현을 적용합니다. `simulateSchedule`, `analyzeBottlenecks`, `evaluateSchedule` 결과는 그대로 사용합니다.
3. `npm test -- tests/ui/simulation.test.tsx tests/ui/analysis-report.test.tsx tests/ui/accessibility.test.tsx`가 통과하고 reduced-motion에서 `animationName: none`, 정적 box-shadow가 확인되면 완료합니다.

### Task 5 — 보고서 학습 회수·업데이트 기록·인쇄

**Files**

- `src/features/report/EvidenceProgress.tsx`, `EvidenceForm.tsx`: `EvidenceProgressProps { completed: number; total: number }`를 유지하고 각 fieldset에 순번·완료 상태·예시·다음 칸을 표시합니다. 저장 필드명과 `isEvidenceComplete` 조건은 변경하지 않습니다.
- `src/features/report/ReportLearningWrapUp.tsx`, `ReportScreen.tsx`: `ReportLearningWrapUpProps`를 유지하고 “오늘 배운 점” 3문장·“다음 도전” 1문장을 비교 결과에 맞게 표시합니다. 완료 버튼과 교사용 요약/인쇄 제외 규칙을 유지합니다.
- `src/components/UpdateHistoryButton.tsx`, `src/data/updateHistory.ts`: dialog id/ARIA 연결을 보존하고 `{ date: "2026-08-29", category: "개선", description: "전체 학습 화면 계층과 모바일 읽기 순서 개선" }`을 한 번 추가합니다.
- `src/styles/report.css`, `src/styles/components.css`: progress, 완료 fieldset, wrap-up, print style을 정돈합니다.
- `tests/ui/analysis-report.test.tsx`, `tests/ui/update-history.test.tsx`, `e2e/print-report.spec.ts`: 0/4→4/4, 오늘 배운 점, 날짜 기록, 인쇄 시 learner controls 제외를 검증합니다.

**TDD**

1. 실패 테스트: 보고 초기 상태 0/4, 네 fieldset 순번, 예시·다음 칸, 오늘 배운 점·다음 도전이 존재하고, 완성 상태 4/4와 기존 완료 버튼이 유지되는지 고정합니다.
2. 표시 계층과 날짜 기록을 최소 구현합니다. 완료 판정·교사용 출력은 바꾸지 않습니다.
3. `npm test -- tests/ui/analysis-report.test.tsx tests/ui/update-history.test.tsx`와 print E2E가 통과하고 `git diff --check`가 공백 오류 0이면 완료합니다.

### Task 6 — 회귀 자동화와 검증 원장

**Files**

- `e2e/learner-improvements.spec.ts`: 320/375px에서 핵심 CTA 위치, 진행 트랙, 시나리오 선택, 관계 목록, 일정 목록, 모든 단계 고유 도움말, same-origin requests, console/page errors를 검증합니다.
- `e2e/accessibility-responsive.spec.ts`: 375px heading/ARIA/44px/focus와 desktop 1280px layout을 검증합니다. VoiceOver 검증은 추가하지 않습니다.
- `playwright.config.ts`: `WORKFLOW_E2E_PORT`를 숫자로 확인하고 지정 포트의 baseURL을 사용합니다. 포트가 점유되면 `WORKFLOW_E2E_PORT=4174`를 사용합니다.
- `README.md`, `docs/qa/learner-usability-verification.md`: 새 UI 흐름·검증 명령·VoiceOver 제외 범위를 기록합니다.
- `work/education-webapp-redesign-report.md`: 자동 테스트, 수동 브라우저, 인간 학습자, VoiceOver 제외, 미실행 배포를 별도 섹션으로 기록합니다.

**TDD**

1. 실패 E2E: `data-testid="stage-progress"`, CTA 문서 y, selected style, no-overlap footer, 375px relation/schedule, reduced-motion, print exclusion, no external requests를 각각 assert합니다.
2. 포트 설정·E2E assertion·문서 원장을 최소 구현합니다.
3. 다음 명령을 순서대로 실행해 예상 결과와 비교합니다.

```sh
npm run lint
npm run typecheck
npm test
npm run check:file-length
npm run build
WORKFLOW_E2E_PORT=4174 npm run test:e2e
WORKFLOW_E2E_PORT=4174 WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1 npm run test:e2e
git diff --check
```

예상 결과: lint/typecheck/build 성공, 기존 Vitest 전 테스트와 새 UI 테스트 통과, file-length 최대 499줄, E2E 전체 통과 또는 macOS native-select probe만 명시적 환경 제한으로 분리 기록, 외부 요청·console/page error 0입니다. jsdom Canvas/localStorage 경고가 있어도 테스트 결과와 분리하여 제품 오류로 판정하지 않습니다.

## 실행 순서 체크박스

- [x] 초기 감사·자산 기록·디자인 시스템을 검토하고 본 계획의 요구사항 대조를 완료합니다.
- [x] Task 1 실패 테스트를 작성하고 `AppMasthead`·`StageProgress`·`StageFrame` 최소 구현 후 관련 테스트를 통과시킵니다.
- [x] Task 2 실패 테스트를 작성하고 시나리오 맥락·브리핑 우선순위·CTA 위치를 구현 후 통과시킵니다.
- [x] Task 3 실패 테스트를 작성하고 관계·일정의 모바일 정보 순서를 구현 후 통과시킵니다.
- [x] Task 4 실패 테스트를 작성하고 실행·분석·수정 관찰 카드를 구현 후 통과시킵니다.
- [x] Task 5 실패 테스트를 작성하고 보고 학습 회수·업데이트 날짜·인쇄 규칙을 구현 후 통과시킵니다.
- [x] Task 6 실패 E2E를 작성하고 포트·문서·검증 원장을 구현 후 전체 명령을 실행합니다.
- [x] 디자인·콘텐츠·접근성·안전·개인정보 회귀를 최종 리뷰하고 리디자인 보고서를 완성합니다.
- [x] 사용자의 별도 지시가 있을 때까지 commit·push·deploy·HVC sync를 실행하지 않습니다.

## 향후 실행할 명령과 예상 결과

위 명령은 계획에 기록한 미래 실행 항목이며 본 계획 작성 중에는 실행하지 않습니다. 구현 완료 시 `npm run verify`는 lint, typecheck, Vitest, file-length, build를 모두 성공시켜야 합니다. Playwright는 375px 네 시나리오 learner path, 키보드 역탭, same-origin, reduced motion, print를 확인하고, 실패한 경우 같은 원인의 재시도를 세 번 넘기지 않고 환경 또는 코드 원인을 문서화합니다.

## 향후 커밋 단계

커밋은 구현·검증·최종 리뷰가 모두 끝난 뒤 사용자가 별도로 승인할 때만 실행합니다. 각 커밋은 테스트와 관련 소스·문서를 함께 포함하고 push/deploy/HVC 등록은 커밋 이후 별도 승인 단계입니다.

```sh
git add work design-system src/components/AppMasthead.tsx src/components/StageProgress.tsx src/components/StageFrame.tsx src/App.tsx src/styles/tokens.css src/styles/layout.css tests/ui/app-smoke.test.tsx tests/ui/accessibility.test.tsx
git commit -m "feat: add learner progress shell"
git add src/components/ScenarioNavigation.tsx src/features/briefing src/styles tests/ui/briefing.test.tsx e2e/learner-improvements.spec.ts
git commit -m "feat: clarify mission briefing hierarchy"
git add src/features/relations src/features/schedule src/styles tests/ui/relations.test.tsx tests/ui/schedule.test.tsx
git commit -m "feat: prioritize mobile workflow views"
git add src/features/simulation src/features/analysis src/features/revision src/data/learnerCopy.ts src/styles tests/ui/simulation.test.tsx tests/ui/analysis-report.test.tsx
git commit -m "feat: improve bottleneck observation cards"
git add src/features/report src/components/UpdateHistoryButton.tsx src/data/updateHistory.ts src/styles docs README.md e2e playwright.config.ts work/education-webapp-redesign-report.md
git commit -m "feat: finish safe learner redesign"
```

## 자체 검토 기준

- 설계 원문의 학습 목표·차별성·흐름·콘텐츠/판정·접근성·개인정보/안전·MVP·완료 기준을 Spec 표와 Task acceptance에 모두 연결했습니다.
- 미완성 표기나 다른 단계로 책임을 넘기는 대체 문구를 사용하지 않았습니다.
- 모든 새 타입·인터페이스·파일 경로와 테스트 합격 조건을 명시했습니다.
- 단일 소스 파일 499줄 이하, `gi-pulse`, reduced-motion, 업데이트 날짜, 모바일·키보드·스크린 리더 계약, VoiceOver 제외 범위를 각각 독립 작업으로 다뤘습니다.
- 이미지 자산을 임의로 추가하지 않고 자산 안전 기록과 `imagegen` 미실행 근거를 남겼습니다.
