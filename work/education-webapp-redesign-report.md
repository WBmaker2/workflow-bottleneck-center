# Workflow Bottleneck Center Education Webapp Redesign Report

작성일: 2026-08-30
대상: `/Volumes/ External Drive 256G/Dev2/codex/workflow-bottleneck-center`
범위: 기존 Vite + React + TypeScript 교육용 SPA의 표현 계층을 안전하게 리디자인

## 결론

학습 엔진, 판정 규칙, 선택형 로컬 저장, 네 시나리오를 유지하면서 학습자가 첫 화면에서 미션·현재 단계·다음 행동을 찾는 흐름을 짧게 만들었습니다. 375px 모바일과 1280px 데스크톱의 브라우저 검증, 정적 품질 검증, 전체 opt-in E2E가 통과했습니다. strict E2E에서 남은 14개 실패는 macOS headless Chromium의 native-select 키보드 probe 차이로 분리해 기록했으며 앱 assertion 실패로 판정하지 않았습니다.

이번 작업에서는 GitHub commit, push, Pages deploy, HVC 등록·동기화를 실행하지 않았습니다. 따라서 현재 공개 주소는 이전 배포본이며 이 리디자인 결과를 가리키는 배포 증거가 아닙니다.

## 구현 내용

### 공통 학습 프레임

- `src/components/AppMasthead.tsx`에 서비스명, 시나리오명, “먼저 할 일과 함께 할 일을 구분하면 기다림을 줄일 수 있어요.”라는 학습 질문, “가상 시간” 경계를 배치했습니다.
- `src/components/StageProgress.tsx`에 안내부터 개선 보고서까지 일곱 단계를 텍스트로 표시하고 현재 단계 하나에만 `aria-current="step"`을 부여했습니다.
- `src/components/StageFrame.tsx`와 `src/App.tsx`에서 시나리오 제목·현재 단계·단계 도움말·활동 화면을 같은 프레임에 묶었습니다. 단계 전환 포커스와 기존 reducer 입력은 유지했습니다.

### 브리핑·시나리오 정보 우선순위

- `src/components/ScenarioNavigation.tsx`에서 네 미션에 연습 제약 한 줄과 `aria-current="page"`/선택 텍스트를 함께 표시합니다.
- `src/features/briefing/MissionOverview.tsx`에서 목표, 안전·품질, 협력 약속을 세 카드로 먼저 보여 줍니다.
- `src/features/briefing/BriefingScreen.tsx`에서 `조건 확인`을 안내 요약 바로 뒤에 두고 전체 작업 카드와 모든 판정 조건은 상세 영역에 남겼습니다.

### 활동별 관찰 계층

- `src/features/relations/RelationScreen.tsx`에서 필수 관계 의미 목록을 편집기와 보조 그래프보다 먼저 배치했습니다. `RelationBoard`의 SVG는 보조물로 유지하고 375px에서는 숨깁니다.
- `src/features/simulation/SimulationScreen.tsx`에서 현재 시간·실행 상태·기다림 관찰을 분리했습니다.
- `src/features/analysis/AnalysisScreen.tsx`에서 병목 원인·기다림·선택 상태를 관찰 카드로 보여 줍니다.
- `src/features/revision/RevisionScreen.tsx`에서 수정 전 시간·대기와 안전·품질·역할 조건 보존을 비교 흐름에 연결했습니다.
- `src/features/report/EvidenceForm.tsx`에서 네 근거 fieldset에 순번과 완료/작성 중 상태를 표시했습니다.

### 스타일·안전 계약

- `src/styles/tokens.css`에 새 배경·레이아웃 토큰을 추가하고 새 규칙에서 색상 리터럴 대신 토큰을 사용했습니다.
- 모바일 375px은 한 열로 쌓으며 관계 의미 목록과 일정 단계 목록을 우선합니다. 핵심 필수 행동은 기존 `RequiredActionButton`의 `gi-pulse` 단일 계약을 유지하고 `src/styles/motion.css`의 `prefers-reduced-motion: reduce` 정적 윤곽선 대체를 유지합니다.
- 업데이트 내역에 `2026-08-29` 개선 항목을 한 번 추가했습니다.
- 새 이미지·외부 폰트·분석 SDK·네트워크 저장·학생 이름·음성 기능·실제 장비 지시는 추가하지 않았습니다.

## 설계 요구사항 대조

| 설계 요구 | 구현·검증 연결 |
|---|---|
| `[6실05-01]` 알고리즘 표현 | 단계 진행 트랙, 관계 의미 목록, 일정 목록 우선 흐름으로 선후·병렬·병목 과정을 순서대로 표현했습니다. |
| 기존 앱과의 차별성 | 명령 실행이나 순위 경쟁 대신 기다림 원인, 제한 자원, 안전·품질·역할 공정성을 미션 카드와 관찰 카드에서 반복합니다. |
| 핵심 학습 흐름 | 안내 → 관계 → 일정 → 실행 → 병목 → 수정 → 보고 순서를 `StageProgress`와 `StageFrame`에서 지속적으로 보여 줍니다. |
| 콘텐츠·판정 모델 | `ScenarioDefinition`, `ScheduleDraft`, `AttemptSnapshot`, `BottleneckFinding`과 domain evaluator/simulator 함수의 계약을 변경하지 않았습니다. |
| 접근성 | 단일 h1, 단계 h2/활동 h3, `aria-current`, live region, 포커스 이동, 44px 제어, 키보드 경로, reduced-motion, 인쇄 제외를 자동·브라우저 검사로 확인했습니다. VoiceOver는 제외했습니다. |
| 개인정보·안전 | 선택형 버전 로컬 저장과 역할 A·B·C만 유지하고 이름·로그인·서버·외부 요청을 추가하지 않았습니다. 모든 시간은 교육용 가상 시간으로 표시합니다. |
| MVP 범위 | 네 시나리오, 5~7개 작업, 제한 자원, 실행·분석·수정·교사용 요약을 보존했습니다. |
| 완료 기준 | 전체 E2E에서 네 시나리오 키보드 완주, 안전·품질 실패, 복수 성공안, 저장, 인쇄, 업데이트 내역을 확인했습니다. |

## 자동 검증 증거

### 정적 검증

```text
npm run verify
통과: lint, typecheck, Vitest 19개 파일/191개 테스트, file-length 103개 소스·최대 499줄, Vite build
```

Vitest 실행 중 jsdom의 `HTMLCanvasElement.getContext()` 미구현 경고가 출력되었지만 테스트 실패나 제품 오류는 아니었습니다.

### Playwright E2E

```text
WORKFLOW_E2E_PORT=4193 npm run test:e2e
결과: 45개 중 31개 통과, 14개 실패
원인: native-select 키보드 probe=false인 macOS headless Chromium 환경에서 선택값 커밋이 되지 않는 14개 경로

WORKFLOW_E2E_PORT=4191 WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1 npm run test:e2e
결과: 45개 중 45개 통과
```

두 실행은 별도로 해석합니다. strict 실행은 환경 차이를 숨기지 않았고, fallback 실행은 해당 probe 결과가 있을 때만 명시적으로 허용한 보조 증거입니다. fallback 결과를 조건 없는 strict PASS로 부르지 않았습니다.

통과한 회귀 범위에는 다음이 포함됩니다.

- 375px 네 시나리오 키보드 완주, 역탭, 포인터 실패 가드, same-origin 요청, console/page error 0
- 375px 첫 렌더의 일곱 단계·학습 질문·가상 시간·문서 가로 폭
- 관계 의미 목록 우선과 보조 그래프 숨김, 일정 단계 목록 우선
- 단일 `gi-pulse`, reduced-motion 정적 강조, 업데이트 내역 날짜 기록
- 안전·품질 실패, 복수 성공안, 저장 복구, 인쇄 시 학습자 컨트롤 제외

## 브라우저 수동 확인

Playwright 브라우저 세션에서 실제 화면을 확인했습니다.

| 뷰포트 | 확인 결과 |
|---|---|
| 375 × 812 | `document.documentElement.scrollWidth=360`, `clientWidth=360`; 문서 가로 넘침 없음. `조건 확인` y=1,192.05px, 높이 44.80px. 진행 트랙 항목 7개, `aria-current="step"` 1개. |
| 1280 × 900 | document 가로 넘침 없음. 진행 트랙 288px와 학습 공간 904px의 두 열 배치. h1 1개, 현재 단계 1개. |
| 공통 | 제목 `작업 순서 병목 해결소`, `lang="ko"`, 외부 origin 리소스 없음, console error 0. |

375px 진행 트랙의 목록은 내부 가로 스크롤을 사용할 수 있지만 문서 전체 가로 스크롤은 만들지 않습니다. 관계 그래프와 시간축은 텍스트 목록을 대체하지 않는 보조물입니다.

## 접근성·학습자 검토 경계

- 자동 axe, semantic/ARIA, 키보드·모바일·44px·reduced-motion 검증은 통과했습니다.
- 실제 초등학생 사용성 세션, 교사 승인, 보조공학 사용자 승인은 수행하지 않았습니다. 자동 결과를 사람 대상 승인으로 확대 해석하지 않습니다.
- VoiceOver 기능 구현과 VoiceOver 검증은 사용자 지침에 따라 제외했습니다. 일반 스크린 리더 의미 구조만 자동 검증했습니다.

## 지원 도구·자산 경계

- `education-webapp-redesign`과 `impeccable`은 2026-08-30 재검토에서 다시 읽었습니다. `redesign-existing-projects`도 사용 가능한 경로(`/Users/kimhongnyeon/.agents/skills/redesign-existing-projects/SKILL.md`)를 읽고 기존 구조를 보존하는 표적 보완에 적용했습니다.
- `ui-ux-pro-max`는 현재 세션의 사용 가능한 스킬 목록에 정확한 이름으로 제공되지 않아 호출하지 않았습니다. 이름이 비슷한 스킬을 해당 도구로 주장하지 않고 `design-system/MASTER.md`와 `impeccable` 기준을 사용했습니다.
- `imagegen`(`/Users/kimhongnyeon/.codex/skills/imagegen/SKILL.md`)은 읽었지만 새 일반 장식 이미지가 필요하지 않아 실행하지 않았습니다. 앱에는 기존 `public/favicon.svg`와 데이터 기반 관계 SVG만 사용하며 원본 사실·정체성·증거 자산을 교체하지 않았습니다. 상세 내용은 `work/education-webapp-redesign-assets.md`에 기록했습니다.

## 2026-08-30 후속 보완

- `PRODUCT.md`를 추가해 대상, 학습 목적, 차별성, 운영·접근성·안전 제약을 저장소 근거와 추론으로 구분했습니다. 기존 `design-system/MASTER.md`를 시각 기준으로 유지했습니다.
- `src/styles/components.css`, `layout.css`, `relation.css`, `report.css`의 반복적인 두꺼운 좌측 포인트 테두리를 상단 경계·배경 토큰으로 바꾸고, `EvidenceProgress`의 채움 애니메이션을 레이아웃 폭 전환이 없는 `transform`으로 바꿨습니다.
- `src/data/updateHistory.ts`와 설계 문서에 2026-08-30 보완 기록을 추가하고, 0%·100% 진행률 transform 테스트를 추가했습니다.
- Impeccable detector의 단일 실행 결과에서 지적한 14개 경고(13개 side-tab, 1개 layout-transition)를 위 수정으로 처리했습니다. detector는 스킬 규칙에 따라 재실행하지 않았습니다.
- 보완 후 `WORKFLOW_E2E_PORT=4194 WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1 npm run test:e2e`를 권한 허용 실행에서 다시 돌려 45개 테스트 전부 통과했습니다. 제한 샌드박스의 Chromium 시작 실패는 `MachPortRendezvous` 권한 오류로 별도 기록합니다.

## 변경 문서

- `work/education-webapp-redesign-audit.md`: 초기 감사와 리스크
- `work/education-webapp-redesign-plan.md`: 실행 계획과 완료 체크박스
- `design-system/MASTER.md`: 색·간격·반응형·접근성·안전 규칙
- `work/education-webapp-redesign-assets.md`: 이미지·자산 분류
- `docs/qa/learner-usability-verification.md`: 자동·수동 검증 원장
- `2026-08-26-workflow-bottleneck-center-design.md`: 2026-08-29 업데이트 기록

## 릴리스 상태

현재 브랜치의 리디자인 변경은 커밋하지 않은 상태입니다. 사용자가 별도로 승인하기 전까지 commit, push, deploy, HVC 동기화를 실행하지 않습니다. 이전 배포본은 [Workflow Bottleneck Center](https://wbmaker2.github.io/workflow-bottleneck-center/)에서 확인할 수 있으나, 이 보고서의 리디자인 변경은 아직 그 주소에 반영되지 않았습니다.
