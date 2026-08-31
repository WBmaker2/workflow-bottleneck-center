# Elementary Web App UX Improvement Plan

작성일: 2026-08-31
대상: `/Volumes/ External Drive 256G/Dev2/codex/workflow-bottleneck-center`
작업 모드: `full` — 기준선 감사, 계획, 승인 범위 구현, 동일 시나리오 재검증
사용자: 초등학교 5~6학년 학생(주 사용자), 수업 결과를 확인하는 교사(보조 사용자)

## Goal

학생이 첫 화면에서 “무엇을 배우는지 → 지금 무엇을 하는지 → 왜 필요한지 → 다음에 무엇을 누르는지”를 빠르게 찾도록 표현 계층을 보완합니다. 현재의 네 미션, 일곱 단계, 선행·병렬·제한 자원·역할 공정성 판정, 로컬 선택 저장, 가상 시간 경계를 그대로 두고 다음 다섯 병목만 해결합니다.

| ID | 발견한 문제 | 근거 | 목표 합격 조건 |
|---|---|---|---|
| EDU-UX-001 | 375px 첫 화면에서 `조건 확인`이 문서 약 1,196px 지점에 있어 핵심 시작 행동을 찾기 위해 긴 설명을 지나야 합니다. | 2026-08-31 in-app browser, 375×812, CTA `y=1196.06`, document `scrollHeight=3511` | CTA가 미션 설명 직후의 첫 행동 영역에 있고 375px에서 bounding `y < 900`이며 `gi-pulse` 하나만 유지됩니다. |
| EDU-UX-002 | 관계를 한 번 연결한 뒤 두 select가 이전 값을 유지해 다음 관계를 고르려면 먼저 다른 select와 placeholder를 찾아야 합니다. | 첫 관계 추가 뒤 `before=verify-content`, `after=prepare-print-file`가 남고, 반대 순서 선택 시 disabled option으로 선택 deadline 발생 | 유효한 관계를 추가하면 두 select가 빈 값으로 돌아가고 첫 select에 포커스가 오며, 두 번째 관계를 어느 select부터 골라도 연결됩니다. |
| EDU-UX-003 | 선택 시나리오의 `선택됨`이 별도 grid 자식이라 모바일 선택 카드가 다른 카드보다 세로로 커집니다. | 375px 기준 선택 카드 약 87px, 다른 카드 약 61px; DOM에 선택 상태 span이 meta 바깥에 존재 | 선택 상태가 meta 문장 안에서 읽히고 네 카드의 행 높이가 같은 구조를 사용하며 `aria-current="page"`와 `선택됨` 접근성 이름을 유지합니다. |
| EDU-UX-004 | 상단 eyebrow가 서비스명을 h1과 반복하고 저장 안내가 긴 한 문장으로 첫 화면 읽기 부담을 늘립니다. | `작업 순서 병목 해결소 · 과학 전시판 준비`가 h1과 중복; 저장 설명 2문장 중 첫 문장이 48자 이상 | eyebrow는 `이번 미션 · …`으로 축약하고 저장 문장은 기기 저장·이름 미사용을 한 문장씩 분리해 기존 개인정보 의미를 보존합니다. |
| EDU-UX-005 | 입력 label은 “10자 이상”이라고 안내하지만 판정 함수는 한글 음절만 셉니다. 숫자·영문·기호를 섞은 10자 문장이 통과하지 않아 학생 안내와 판정이 어긋납니다. | `BottleneckPrediction.tsx`의 `koreanSyllableCount`, 기존 UI 테스트의 한글 전용 계약 | trim 후 공백을 제외한 사용자 입력 문자 수가 10 이상이면 저장 버튼이 활성화되고, 공백만 있는 입력은 비활성 상태를 유지합니다. |

## Architecture

기존 `AppProvider → AppShell → StageFrame → stage-owned screen` 구조를 유지합니다. 변경은 표현 계층과 입력 편집기의 일시 상태에만 적용하며 `src/domain`, reducer, 저장소의 계약은 수정하지 않습니다.

```text
AppProvider
└─ AppShell
   ├─ AppMasthead                 # 이번 미션·학습 질문·가상 시간
   ├─ ScenarioNavigation          # 동일 높이의 미션 카드·선택 상태
   ├─ save-toggle                 # 로컬 저장 선택과 짧은 개인정보 안내
   └─ StageFrame
      └─ BriefingScreen            # 미션 → 다음 행동 → 요약 → 상세 카드
         ├─ RequiredActionButton   # 현재 단계에서 유일한 gi-pulse
         └─ TaskCardSummary/TaskCard

RelationScreen
└─ RelationEditor                 # 추가 후 초기화·첫 select 포커스

SimulationScreen
└─ BottleneckPrediction            # 공백 제외 문자 수 10자 판정
```

`RequiredActionButton`의 `actionId`, `activeActionId`, `data-pulse` 계약은 유지합니다. 관계 편집기는 그래프나 판정 알고리즘을 바꾸지 않고 select의 로컬 상태만 초기화합니다. 실행 시뮬레이션은 이미 교육 목표에 필요한 관찰·일시정지·기다림 예측을 제공하므로 새 시뮬레이션을 추가하지 않습니다.

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 7 정적 SPA
- Vitest 4 + Testing Library + `vitest-axe` UI/접근성 테스트
- Playwright Chromium E2E와 Codex in-app browser 수동 기준선·재검증
- 기존 CSS 토큰과 시스템 글꼴. 새 패키지, 외부 폰트, 분석 SDK, 이미지 CDN을 추가하지 않음
- 검증 명령: `npm test`, `npm run lint`, `npm run typecheck`, `npm run check:file-length`, `npm run build`, `npm run verify`, `npm run test:e2e`

사용 가능한 시각 스킬 중 `impeccable`, `design-system`, `redesign-existing-projects`, `education-webapp-redesign`의 규칙을 적용합니다. `ui-ux-pro-max`와 선택형 시뮬레이션 플러그인은 현재 런타임 호출 목록에 없어 사용하지 않습니다. 새 이미지가 학습 이해에 필요하지 않으므로 `imagegen`도 실행하지 않습니다.

## Spec

### 학습 목표와 기존 앱과의 차별성

- 학생은 작업 카드를 읽고 선행 관계와 함께 할 수 있는 일을 구분하며, 한정된 도구와 사람을 고려해 병목을 설명합니다.
- 앱은 코딩 명령이나 속도 순위가 아니라 여러 작업의 관계를 구성하고 기다림의 원인과 안전·품질·공정성 근거를 비교하게 합니다.
- 개선은 이 차별성을 보존하고 첫 행동을 더 빨리 찾게 합니다.

### 핵심 학습 흐름 연결

| 단계 | 보존할 학생 행동 | 이번 개선 연결 |
|---|---|---|
| 안내 | 미션과 작업 조건 읽기 | 미션 설명 바로 뒤 `조건 확인`; 요약과 상세 조건은 계속 공개 |
| 관계 설계 | 먼저/다음 관계 연결 | 연결 성공 후 입력 초기화로 다음 관계의 의미 선택을 반복 |
| 일정표 | 시작 시각·역할·도구 배치 | 기존 단계 목록 우선과 드래그 없는 입력 유지 |
| 가상 실행 | 시간·상태·기다림 관찰 | 기존 결정적 실행과 reduced-motion 수동 단계 유지 |
| 병목 분석 | 기다림 원인·영향 선택 | 예측 입력의 문자 안내와 판정 일치 |
| 수정 | 안전·품질·공정성을 지킨 대안 비교 | 기존 평가·비교 결과 유지 |
| 보고 | 네 근거와 다음 도전 작성 | 기존 교사용 요약과 업데이트 기록 유지 |

### 콘텐츠·판정 모델

- `ScenarioDefinition`, `TaskDefinition`, `DependencyEdge`, `ScheduleDraft`, `AttemptSnapshot`, `WaitReason` 타입을 그대로 사용합니다.
- `validateRelationMap`, `isScheduleReady`, `simulateSchedule`, `evaluateSchedule`, `analyzeBottlenecks`, `canEnterStage`, `getRequiredAction` 함수의 결과와 호출 위치를 변경하지 않습니다.
- 안전·품질 실패, 순환 관계, 누락 관계, 추가 관계, 동률 성공 일정의 기존 메시지와 판정을 회귀 테스트로 고정합니다.
- `BottleneckPrediction`의 문자 수 변경은 입력 게이트만 바로잡으며 `WaitReason`과 제출 콜백 시그니처는 유지합니다.

### 접근성·개인정보·안전

- `h1` 하나, 단계 `h2`, 카드 `h3` 계층을 유지합니다.
- 버튼·select·checkbox·radio·textarea는 기존 44px 최소 터치 영역과 `:focus-visible` 윤곽선을 유지합니다.
- 선택 미션에는 `aria-current="page"`, 현재 단계에는 `aria-current="step"`, 상태에는 `role="status"`, 오류에는 `role="alert"`을 유지합니다.
- 관계 추가 후 첫 select에 포커스를 돌려 키보드 사용자가 다음 입력을 바로 시작할 수 있게 합니다.
- `gi-pulse`는 단계별 유일한 필수 행동 버튼에만 적용하고 `prefers-reduced-motion: reduce`에서는 기존 정적 윤곽선 대체를 유지합니다.
- 저장은 기본 해제이며 이 기기 로컬 저장만 사용합니다. 학생 이름·로그인·순위·서버 저장·외부 AI·음성 녹음·실제 장비 지시를 추가하지 않습니다.
- 일반 semantic/ARIA와 자동 접근성 테스트만 수행하며 VoiceOver 구현·검증과 실제 학생/교사 인터뷰는 이 작업에서 실행하지 않습니다.

### MVP 범위와 완료 기준

- 네 시나리오와 각 5~7개 작업, 실행·일시정지·병목·수정 비교·교사용 요약을 유지합니다.
- 375px에서 가로 스크롤이 없고 첫 CTA가 보이며 관계·일정 입력을 키보드/터치로 끝까지 사용할 수 있어야 합니다.
- `npm run verify`와 `npm run test:e2e`가 통과하고, 동일한 in-app browser 시나리오에서 콘솔 오류·외부 요청·레이아웃 overflow가 없어야 합니다.
- 변경한 소스·테스트 파일은 `npm run check:file-length` 기준 499줄 이하입니다.
- 업데이트 내역에 `2026-08-31` 개선 항목을 한 번 기록합니다.

## Global Constraints

1. 작업 디렉터리 안의 기존 사용자 변경, 특히 `.playwright-mcp/`를 삭제하거나 덮어쓰지 않습니다.
2. 새 dependency와 네트워크 서비스, 개인정보 수집, 로그인, 서버 저장을 만들지 않습니다.
3. 도메인 판정·reducer·local progress schema·인쇄 규칙을 건드리지 않습니다.
4. 한 파일은 500줄 미만을 유지하고, 문장이 길어지는 경우 기능별 파일로 나눕니다.
5. 핵심 버튼 하나만 `data-pulse="true"`를 가져야 하며 reduced-motion 정적 대체를 보존합니다.
6. 계획에 적힌 명령은 구현·검증 단계에서 실행할 항목이며 계획 작성 단계에는 실행하지 않습니다.
7. 커밋·푸시·배포·HVC 등록은 이 UX 점검 작업의 범위가 아니며, 별도 사용자 지시가 있을 때만 수행합니다.
8. 실제 초등학생·교사 사용성 검증과 VoiceOver 검증은 실행하지 않았다고 최종 보고서에 명시합니다.

## 예상 파일 구조와 책임

```text
work/elementary-webapp-ux-plan.md              # 현재 감사에서 승인한 구현 계획
work/elementary-webapp-ux-audit.md             # 기준선·학생 패널·심각도 원장
work/elementary-webapp-ux-language-audit.md    # 문구 후보와 전후 검증
work/elementary-webapp-ux-simulation-decision.md# 시뮬레이션 적용성 판단
work/elementary-webapp-ux-report.md            # 최종 자동·브라우저·인간 검증 보고서
src/App.tsx                                    # 저장 안내 문장만 조정
src/components/AppMasthead.tsx                 # eyebrow 축약
src/components/ScenarioNavigation.tsx          # 선택 상태를 meta 안에 배치
src/features/briefing/BriefingScreen.tsx       # 첫 행동 순서 조정
src/features/relations/RelationEditor.tsx      # 추가 후 입력 초기화·포커스
src/features/simulation/BottleneckPrediction.tsx# 문자 수 판정 정렬
src/data/updateHistory.ts                       # 2026-08-31 개선 기록
tests/ui/briefing.test.tsx                     # CTA 순서 계약
tests/ui/relations.test.tsx                    # 반복 연결·포커스 계약
tests/ui/simulation.test.tsx                   # 공백 제외 문자 수 계약
tests/ui/app-smoke.test.tsx                    # 상단 문구·선택 상태 회귀
e2e/learner-improvements.spec.ts               # 375px·키보드 동일 경로 회귀
```

## 작업별 Files·Interfaces

### Task 1 — 기준선 문서와 학생 언어 감사

**Files**

- `work/elementary-webapp-ux-audit.md`: 기준선 수치, 초등학생 5~6학년 `서윤` 관점의 과업·관찰·심각도, 교사 확인 항목을 기록합니다.
- `work/elementary-webapp-ux-language-audit.md`: `app-eyebrow`, 저장 설명, 관계 도움말, 예측 label의 현재 문장·문제·개선 문장·검증 결과를 표로 기록합니다.
- `work/elementary-webapp-ux-simulation-decision.md`: 기존 결정적 시뮬레이션은 학습 목표에 필요하므로 보존하고, 새 2D/3D·게임형 시뮬레이션은 추가하지 않는 이유와 점검 조건을 기록합니다.

**Checks**

- [x] 375px 기준선에서 document overflow 없음, h1 하나, pulse 하나를 확인했습니다.
- [x] 조건 확인 CTA y 좌표와 관계 select stale 값 문제를 기록했습니다.
- [x] 문구 전후 표에 모든 변경 문자열과 기존 개인정보 의미 보존 여부를 기록했습니다.

### Task 2 — 브리핑 첫 행동과 상단 문구 정리

**Files·Interfaces**

- `src/features/briefing/BriefingScreen.tsx`: `BriefingScreenProps { scenario: ScenarioDefinition; attempt: MissionAttempt; dispatch: Dispatch<AppAction> }`를 유지하고 `briefing-next-action`과 `RequiredActionButton`을 미션 설명 직후에 렌더링합니다. `MissionOverview`, `TaskCardSummary`, `TaskCard`의 데이터 전달은 그대로 둡니다.
- `src/components/AppMasthead.tsx`: `AppMastheadProps { stage: LearningStage; scenarioTitle: string }`를 유지하고 eyebrow를 `이번 미션 · ${scenarioTitle}`로 표시합니다.
- `src/App.tsx`: 저장 설명을 `이 기기에 역할 A·B·C의 진행만 저장합니다. 학생 이름이나 온라인 계정은 사용하지 않습니다.`로 짧게 출력합니다.
- `tests/ui/briefing.test.tsx`: `조건 확인`이 `이번 미션 한눈에 보기`보다 DOM에서 먼저 나오며 정확히 하나의 required action인지를 검증합니다.

**TDD 순서**

1. [x] 실패 테스트를 먼저 추가했습니다. `screen.getByRole("button", { name: "조건 확인" })`가 미션 overview heading보다 앞에 있고 저장 문장 두 절이 보이는 계약을 작성했습니다.
2. [x] 최소 구현으로 JSX 순서와 두 문장을 변경했습니다. CSS/도메인 파일은 수정하지 않았습니다.
3. [x] `npm test -- tests/ui/briefing.test.tsx tests/ui/app-smoke.test.tsx`를 포함한 집중 테스트가 통과했고 axe 위반은 0개였습니다.

### Task 3 — 시나리오 선택 카드의 동일한 읽기 리듬

**Files·Interfaces**

- `src/components/ScenarioNavigation.tsx`: `ScenarioNavigationProps { selectedScenarioId: ScenarioId; onSelect(id: ScenarioId): void }`와 `scenarioNavigationCopy`를 유지합니다. 선택 상태를 `scenario-navigation__meta` 안의 텍스트로 합치고 `aria-current="page"`를 유지합니다.
- `tests/ui/app-smoke.test.tsx`: 선택 버튼 accessible name에 `선택됨`이 포함되고 네 버튼이 각각 하나의 title/meta 구조를 갖는지 검증합니다.
- `e2e/learner-improvements.spec.ts`: 375px에서 선택/비선택 카드의 `getBoundingClientRect().height` 차이가 16px 이하인지 검증합니다.

**TDD 순서**

1. [x] 선택 상태 span 위치와 높이 차이를 고정하는 실패 테스트를 추가했습니다.
2. [x] 선택 상태 텍스트를 meta 내부로 옮기는 최소 JSX 변경을 했습니다.
3. [ ] UI 테스트는 통과했지만 `--grep "scenario navigation"` E2E는 Playwright 브라우저 실행 파일 부재로 실행되지 않았습니다.

### Task 4 — 관계 연결 반복 입력 개선

**Files·Interfaces**

- `src/features/relations/RelationEditor.tsx`: `RelationEditorProps { scenario: ScenarioDefinition; edges: readonly DependencyEdge[]; onChange(edges: readonly DependencyEdge[]): void }`를 유지합니다. `useRef<HTMLSelectElement>` 두 개를 추가하고 유효한 `addRelation` 뒤 `setBeforeTaskId("")`, `setAfterTaskId("")`, 첫 select focus를 실행합니다.
- `tests/ui/relations.test.tsx`: 첫 관계를 추가한 뒤 두 select 값이 빈 문자열이고 첫 select가 포커스를 가지며, 두 번째 관계를 `after` 먼저 선택해도 연결되는지 검증합니다.
- `e2e/learner-improvements.spec.ts`: 모바일 키보드 경로에서 관계 추가 후 placeholder가 다시 보이고 다음 관계가 입력되는지 검증합니다.

**TDD 순서**

1. [x] 실패 테스트를 추가했습니다. 첫 관계 추가 후 `toHaveValue("")`, `toHaveFocus()`와 두 번째 edge count를 기대했습니다.
2. [x] ref와 상태 초기화·focus만 최소 구현했습니다. `onChange` payload와 relation validator는 변경하지 않았습니다.
3. [ ] 관계 UI 테스트와 axe 검사는 통과했지만 관계 E2E는 Playwright 브라우저 실행 파일 부재로 실행되지 않았습니다.

### Task 5 — 예측 입력 안내와 판정 정렬

**Files·Interfaces**

- `src/features/simulation/BottleneckPrediction.tsx`: `BottleneckPredictionProps`와 `onSubmit(reason: WaitReason, explanation: string)`을 유지합니다. `koreanSyllableCount`를 `meaningfulCharacterCount`로 바꿔 `value.trim()`에서 공백 문자를 제외한 code point 수를 계산합니다.
- `tests/ui/simulation.test.tsx`: 한글 9자+숫자 1자, 영문 10자, 공백만 입력의 저장 버튼 상태를 검증합니다. 기존 한글 문장 제출 콜백은 그대로 검증합니다.

**TDD 순서**

1. [x] 기존 “한글만 통과” 테스트를 새 계약으로 바꾸고 혼합 입력·공백 입력 테스트를 추가해 실패를 확인했습니다.
2. [x] 공백 제외 카운터와 `canSubmit` 최소 구현을 적용했습니다.
3. [x] simulation UI 테스트와 전체 domain 판정 테스트가 통과했습니다.

### Task 6 — 품질 게이트와 기록 갱신

**Files·Interfaces**

- `src/data/updateHistory.ts`: 기존 `UpdateEntry`를 유지하고 `{ date: "2026-08-31", category: "개선", description: "첫 행동·반복 입력·예측 안내를 초등학생 흐름에 맞게 정돈" }` 한 항목을 추가합니다.
- `work/elementary-webapp-ux-report.md`: 변경 파일, 테스트·브라우저 증거, 미실행 인간/VoiceOver 검증, 잔여 후속 확인을 기록합니다.
- `work/elementary-webapp-ux-audit.md`: 각 issue에 fixed 상태와 실제 검증 링크를 추가합니다.

**TDD·품질 순서**

1. [x] `npm run lint`, `npm run typecheck`, `npm test`, `npm run check:file-length`, `npm run build`를 실행해 회귀가 없음을 확인했습니다.
2. [x] `npm run verify`를 실행해 통합 게이트를 통과했습니다.
3. [ ] `npm run test:e2e`를 실행했지만 Playwright Chromium 실행 파일이 없어 45개 중 39개가 환경 오류로 중단되었습니다. 브라우저 fallback 증거는 별도로 기록했습니다.
4. [x] 변경 UI에 `node /Users/kimhongnyeon/.agents/skills/impeccable/scripts/detect.mjs --json src/App.tsx src/components src/features src/styles`를 한 번 실행하고 3개 경고를 inset shadow로 일괄 보완했습니다. detector는 반복 실행하지 않았습니다.
5. [x] in-app browser에서 같은 과학 전시판 시작·관계 경로를 다시 실행해 CTA y, 카드 높이, 관계 반복 연결, overflow, title/lang, 오류 포커스를 확인했습니다.
6. [x] 자동 검사와 별개로 실제 학생·교사·VoiceOver 검증은 “실행하지 않음”으로 최종 보고합니다.

## 실패 테스트 → 최소 구현 → 통과 테스트 명령과 예상 결과

아래 명령은 계획 확정 후 구현 단계에서 실행할 항목입니다.

```sh
# Task 2~5 실패 테스트
npm test -- tests/ui/briefing.test.tsx tests/ui/relations.test.tsx tests/ui/simulation.test.tsx
# 예상: 새 순서·reset/focus·혼합 문자 계약에서 기존 구현이 실패합니다.

# 최소 구현 직후 집중 통과
npm test -- tests/ui/briefing.test.tsx tests/ui/relations.test.tsx tests/ui/simulation.test.tsx tests/ui/app-smoke.test.tsx
# 예상: 변경된 UI 계약과 axe 검사가 모두 통과합니다.

# 전체 회귀
npm run verify
# 예상: lint, typecheck, Vitest, 파일 길이, build가 모두 종료 코드 0입니다.

# 브라우저 회귀
npm run test:e2e
# 예상: 375px·키보드·안전/품질 실패·저장·인쇄·업데이트 기록 시나리오가 모두 통과합니다.
```

## 체크박스 실행 순서

- [x] 스킬·프로젝트 규칙·제품 문서·디자인 시스템을 읽고 Stage 0 preflight를 `ready`로 완료했습니다.
- [x] 375px와 데스크톱 기준선, 정상/오류 관계 상태, 언어 후보 inventory를 수집했습니다.
- [x] 변경 범위를 EDU-UX-001~005로 고정하고 도메인·개인정보·안전 경계를 선언했습니다.
- [x] Task 1 감사·언어·시뮬레이션 결정 문서를 작성했습니다.
- [x] Task 2 브리핑·상단 문구 실패 테스트 → 최소 구현 → 통과 테스트를 수행했습니다.
- [x] Task 3 시나리오 카드 실패 테스트 → 최소 구현 → 통과 테스트를 수행했습니다.
- [x] Task 4 관계 반복 입력 실패 테스트 → 최소 구현 → 통과 테스트를 수행했습니다.
- [x] Task 5 예측 문자 수 실패 테스트 → 최소 구현 → 통과 테스트를 수행했습니다.
- [x] Task 6 업데이트 기록, detector 일괄 반영, 전체 verify와 browser 재검증을 수행했습니다. E2E는 실행 파일 부재로 남은 환경 게이트를 기록했습니다.
- [x] 최종 보고서에 자동·브라우저·인간 검증을 분리해 작성하고 커밋·푸시·배포는 실행하지 않습니다.

## 현재 게이트 상태

구현·단위 검증·in-app browser 기준선은 완료되었습니다. Playwright Chromium 실행 파일이 없어 전체 E2E는 `blocked`이며, 실제 초등학생·교사와 VoiceOver 검증도 실행하지 않았습니다. 따라서 이 문서는 구현 완료 계획이지만 릴리스 `pass` 판정 문서가 아닙니다.

## 롤백 기준

자동 테스트나 동일 브라우저 경로에서 판정 결과, 저장 데이터, pulse 개수, 접근성 오류, 외부 요청, 375px overflow가 회귀하면 해당 Task의 표현 변경만 되돌리고 도메인·저장 파일은 유지합니다. 관계 reset/focus가 기존 키보드 순서를 깨뜨리면 `RelationEditor` 변경을 되돌리고 재검토를 보고하며, 안전·품질 실패가 통과로 바뀌면 즉시 구현을 중단합니다.

## 향후 커밋 단계(이번 작업에서는 실행하지 않음)

1. 변경·문서 파일을 검토하고 `git diff --check`를 실행합니다.
2. `git status --short --branch`로 `.playwright-mcp/` 같은 사용자 파일이 staging에 들어가지 않았는지 확인합니다.
3. 구현과 문서를 한 개의 설명적인 커밋으로 묶습니다: `改善: 학생 학습 흐름의 첫 행동과 반복 입력 정돈`.
4. 원격 브랜치와 CI를 확인한 뒤 사용자가 별도로 승인한 경우에만 `git push`와 배포를 실행합니다.
5. 배포 시 실제 학습자 경로·375px·title/lang·콘솔·네트워크를 확인하고 공개 URL을 최종 보고서에 기록합니다.
