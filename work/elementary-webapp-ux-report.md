# Elementary Web App UX Improvement Report

작성일: 2026-08-31
모드: `full`
대상: `/Volumes/ External Drive 256G/Dev2/codex/workflow-bottleneck-center`

## 결과 요약

학생의 첫 행동과 반복 입력 마찰을 다섯 곳에서 개선했습니다. 도메인 판정·저장·개인정보·안전 경계는 변경하지 않았습니다. 자동 품질 게이트와 동일한 로컬 browser 시작/관계 경로는 통과했지만 Playwright Chromium 실행 파일이 없어 full E2E 수용은 `blocked`입니다.

## Stage 0·전문 라우팅

- preflight: `ready`
- 적용 기준: `elementary-webapp-ux-orchestrator`, `impeccable`, `design-system`, `redesign-existing-projects`, `education-webapp-redesign`, `playwright`
- `ui-ux-pro-max`: 현재 런타임 호출 목록에 없어 사용하지 않음
- 시뮬레이션 선택 플러그인: 런타임 미제공; 새 시뮬레이션을 추가하지 않아 N/A
- 이미지: 기능 이해에 새 이미지가 필요하지 않아 `imagegen`을 실행하지 않음

## 학습자·학습 흐름

주 페르소나는 초등학교 5학년 `서윤`으로 두었습니다. 미션 읽기 → 조건 확인 → 선행 관계 연결 → 일정 배치 → 가상 실행·예측 → 병목 분석 → 수정 비교 → 네 근거 보고의 흐름을 보존했습니다.

| 학습 목표 | 구현 연결 |
|---|---|
| 먼저 할 일과 함께 할 일 구분 | 브리핑 첫 CTA와 관계 입력 reset/focus |
| 제한 자원·역할 공정성 이해 | 기존 `ScenarioDefinition`·evaluator·요약 조건 유지 |
| 기다림 원인 관찰·설명 | 기존 결정적 SimulationScreen과 10자 입력 게이트 정렬 |
| 빠른 일정보다 안전·품질 근거 | 기존 실패 메시지·수정 비교·보고 근거 유지 |

## P0–P3 이슈 원장

| ID | 등급 | 상태 | 변경 |
|---|---|---|---|
| EDU-UX-001 | P1 | fixed | `조건 확인`을 미션 문장 직후로 이동하고 모바일 line-height/여백을 조정 |
| EDU-UX-002 | P2 | fixed | 관계 추가 후 두 select 초기화, 첫 select focus; 삭제 시 기존 목록 heading focus 보존 |
| EDU-UX-003 | P2 | fixed | 선택 상태를 meta small 내부로 이동해 카드 높이 동일화 |
| EDU-UX-004 | P2 | fixed | eyebrow와 로컬 저장 안내를 짧은 문장으로 정리 |
| EDU-UX-005 | P2 | fixed | 공백 제외 meaningful character count로 “10자 이상” 판정 정렬 |
| 추가 P0/P1 | — | 없음 | 안전·개인정보·핵심 판정에서 새 결함 없음 |

## 언어 감사

`work/elementary-webapp-ux-language-audit.md`에 before/after, 난이도 신호, 학습 의도 보존을 기록했습니다. 실제 변경 문장은 상단 eyebrow, 저장 설명, CTA 위치, 예측 입력 판정이며 `학생 이름이나 온라인 계정은 사용하지 않습니다.` 문장은 그대로 보존했습니다. 학생 자기말 재진술 인터뷰는 실행하지 않아 comprehension gate는 `not run`입니다.

## 시뮬레이션 결정·경계

`work/elementary-webapp-ux-simulation-decision.md`에 기록했습니다.

- 모델: 기존 `simulateSchedule`이 `AttemptSnapshot`의 가상 단위·작업 run·wait reason을 결정합니다.
- 경계: 실제 작업 시간·생산성·장비 안전을 측정하지 않는 정적 교육 모델입니다.
- 입력: 관계·시작 시점·역할·도구를 학생이 선택합니다.
- fallback: reduced-motion에서는 자동 재생 없이 정적 `다음 단계`를 사용합니다.
- 이번 작업: 새 변수·seed·장면·이미지를 추가하지 않아 시뮬레이션 게이트는 N/A입니다.

## 변경 파일

- UI: `src/App.tsx`, `src/components/AppMasthead.tsx`, `src/components/ScenarioNavigation.tsx`, `src/features/briefing/BriefingScreen.tsx`, `src/features/relations/RelationEditor.tsx`, `src/features/relations/RelationScreen.tsx`, `src/features/simulation/BottleneckPrediction.tsx`
- 스타일: `src/styles/components.css`, `src/styles/layout.css`
- 기록: `src/data/updateHistory.ts`
- 테스트: `tests/ui/app-smoke.test.tsx`, `tests/ui/briefing.test.tsx`, `tests/ui/relations.test.tsx`, `tests/ui/simulation.test.tsx`, `tests/ui/update-history.test.tsx`, `e2e/learner-improvements.spec.ts`, `e2e/update-history.spec.ts`
- 문서: `work/elementary-webapp-ux-plan.md`, `work/elementary-webapp-ux-audit.md`, `work/elementary-webapp-ux-language-audit.md`, `work/elementary-webapp-ux-simulation-decision.md`

## 검증 증거

### TDD·자동 검사

- 변경 전 실패 테스트: 브리핑 순서, 선택 meta, 관계 reset/focus, 혼합 문자 입력의 4개 계약이 실패했습니다.
- 집중 통과: 관련 UI 4개 파일, 43개 테스트 통과.
- `npm run verify`: lint·typecheck·Vitest 19개 파일/193개 테스트·file-length 103개 source(max 499)·build 통과.
- jsdom Canvas `getContext()` “Not implemented” 출력은 테스트 통과를 막지 않는 기존 환경 경고입니다.
- Impeccable detector는 변경 UI에 한 번 실행했으며 3개 경고를 inset shadow로 반영했습니다. detector는 반복 실행하지 않았습니다.

### in-app browser 동일 경로

주소 `http://127.0.0.1:5178/`, 375×812 및 1280×900에서 확인했습니다.

| 확인 | 결과 |
|---|---|
| title/lang | `작업 순서 병목 해결소` / `ko` |
| mobile width | client 360, scroll 360 |
| first CTA | document y `899.28px`, target `< 900px` |
| scenario cards | 4개 모두 61.45px |
| pulse | 항상 1개 |
| relation add | 두 값 빈 값, `before-task` focus, 목록 1개 |
| invalid recovery | `role=alert`에 focus, 순환·누락 안내 표시 |
| desktop width | client 1265, scroll 1265 |

### Playwright E2E 상태

`npm run test:e2e`는 build까지 성공했으나 Playwright Chromium 실행 파일(`/Users/kimhongnyeon/Library/Caches/ms-playwright/chromium_headless_shell-1234/...`)이 없어 45개 중 39개가 동일 환경 오류로 중단되고 6개만 실행되었습니다. 이는 제품 실패가 아니라 브라우저 런타임 부재이며, full E2E는 `blocked`로 남깁니다. 설치·다운로드는 이 작업에서 실행하지 않았습니다.

## 100점 수용 점수

전체 점수는 실제 학생/교사 패널과 320px·full E2E 증거가 없어 `not run`으로 남깁니다. 자동·in-app browser 증거만으로 점수를 추정해 릴리스 승인으로 표현하지 않았습니다. 현재 수용 게이트는 `blocked`입니다.

## 미실행·잔여 단계

- 실제 초등학생·교사 자기말 재진술 및 오답 회복 관찰: `not run`
- VoiceOver 구현·검증: 범위 제외, `not run`
- Playwright full E2E 45개: Chromium 실행 파일 설치 후 재실행 필요
- 320px 대표 경로 및 실제 공개 배포 URL: 이번 요청에서 배포하지 않아 `not run`
- Git commit/push/deploy/HVC 등록: 실행하지 않음

## 학습 takeaway와 다음 행동

학생이 기억할 핵심은 “먼저 끝낼 일과 다음 일을 연결하고, 기다림이 보이면 이유를 말한 뒤 일정을 바꿔 비교한다”입니다. 다음 검증에서는 초등학생 한 명에게 `조건 확인`의 결과, `선행 관계`의 뜻, 관계 오류 뒤 회복 방법을 자기 말로 설명하게 하고, Playwright 브라우저 런타임 복구 후 네 시나리오 375px 키보드 경로를 재실행해야 합니다.
