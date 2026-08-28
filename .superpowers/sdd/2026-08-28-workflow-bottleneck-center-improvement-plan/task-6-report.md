# Task 6 구현 보고서 — 회귀 E2E·문서 동기화

## 상태

구현 완료. 학습자 회귀 게이트, 안전한 E2E 포트 설정, 문서 원장을 정리했습니다. 제품 의미·도메인 판정·저장 형식·`gi-pulse` 동작은 변경하지 않았으며 push·Pages 배포·HVC 등록은 수행하지 않았습니다.

## 적용 내용

- `playwright.config.ts`
  - `WORKFLOW_E2E_PORT`를 숫자·1024~65535 범위로 검증하고 잘못된 값은 기본 4173으로 되돌립니다.
  - 동일 포트를 `baseURL`, preview command, web server URL에 사용합니다.
- `e2e/learner-improvements.spec.ts`
  - 375px CTA y `< 1,800`, static footer 문서 흐름 trigger non-overlap, selected scenario computed style, 관계 필수 목록·보조 그래프 숨김, 일정 단계 목록 기본, 7개 단계별 제목·고유 도움말 문장, 네 시나리오 전체 경로의 same-origin request·console/page error, reduced-motion computed style, print controls exclusion을 고정했습니다.
  - 하위 경로 이동은 `page.goto("./")`로 통일했습니다.
  - 네 시나리오 전체 경로는 실제 Tab/Shift+Tab 순회 helper로 컨트롤을 찾고 native checkbox/radio는 Space, native select는 Home/ArrowDown/Tab 키 입력으로 조작합니다. 이 경로에는 injected keydown/`selectedIndex` shim과 직접 `.focus()` 점프를 사용하지 않습니다. 별도 native-select probe가 이 환경의 headless Chromium quirk를 감지할 때만 `WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1`과 함께 Playwright fallback을 허용하며, 기본 명령은 fallback 없이 실패를 드러냅니다.
- `e2e/accessibility-responsive.spec.ts`, `e2e/update-history.spec.ts`, `e2e/keyboard-mobile.spec.ts`, `e2e/persistence.spec.ts`
  - stage/report와 병목 heading을 exact selector로 만들고, 업데이트 버튼은 static footer 내부에서 찾도록 했습니다.
  - persistence 일정 행은 실제 `.timeline-grid [role="row"]`의 `aria-label` 계약으로 좁혔습니다.
  - 관련 E2E의 이동 경로를 baseURL-aware 호출로 통일했습니다.
- `docs/qa/learner-usability-verification.md`, `README.md`, `2026-08-26-workflow-bottleneck-center-design.md`
  - 375px·키보드·reduced-motion·외부 요청·인쇄 검증 범위와 환경 한계를 동기화했습니다.
  - 모바일 관계/일정 목록 우선 문구와 2026-08-28 최신 기록을 반영하고 설계 문서 placeholder를 제거했습니다.
  - 업데이트 내역은 static footer의 문서 흐름으로 기록하고, `gi-pulse` 필수 행동 ID는 `confirm-conditions`, `confirm-relations`, `run-simulation`, `mark-bottleneck`, `compare-revision`으로 통일했습니다. VoiceOver 구현·검증은 이번 범위에서 제외했습니다.
  - Task 4·5 보고서의 당시 실패와 수치는 `historical pre-fix`로 명시했습니다. `src/data/updateHistory.ts`의 2026-08-28 항목은 기존의 정확히 한 개를 유지했습니다.

## TDD 및 검증

새 learner E2E assertion을 먼저 추가한 뒤 실행했습니다. 이후 설정·선택자·문서를 최소 수정하고 정적 검증을 지정 순서로 실행했습니다.

```text
npm run lint
passed

npm run typecheck
passed

npm test
Test Files 19 passed · Tests 190 passed
기존 jsdom HTMLCanvasElement.getContext() 미구현 경고만 출력

npm run check:file-length
Checked 99 source files (allowance: max 499 lines; longest current file: 481 lines)

npm run build
vite build succeeded

WORKFLOW_E2E_PORT=4174 npm run test:e2e -- e2e/learner-improvements.spec.ts
8 passed, 4 failed (26.4s): native-select probe failure is reported without fallback (권한 상승 재시도)

WORKFLOW_E2E_PORT=4174 WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1 npm run test:e2e -- e2e/learner-improvements.spec.ts
12 passed (42.6s, 권한 상승 재시도; probe=false 환경에서 명시적 opt-in)

WORKFLOW_E2E_PORT=4174 npm run test:e2e
39 passed, 4 failed (56.0s): all four real-keyboard learner scenarios report the native-select probe failure without fallback (권한 상승 재시도)

WORKFLOW_E2E_PORT=4174 WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1 npm run test:e2e
43 passed (54.6s, 권한 상승 재시도; probe=false 환경에서 명시적 opt-in)

git diff --check
passed
```

관찰 환경의 기본 no-env learner E2E는 8/12, 전체 E2E는 39/43으로 native-select probe 실패를 드러냈습니다. 따라서 strict no-env gate는 실패입니다. `probe=false`인 동일 환경에서 `WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1`을 명시한 opt-in 실행만 learner 12/12·전체 43/43으로 환경 한정 통과했으며, 이를 조건 없는 전체 회귀 통과로 해석하지 않습니다. 4173 점유 프로세스는 종료하지 않았습니다. 일반 sandbox의 첫 실행에서는 이 macOS 환경의 Playwright Chromium이 `bootstrap_check_in ... Permission denied (1100)`로 시작 직후 종료되었으나, 권한 상승 재시도에서 위 두 조건을 확인했습니다. 이 MachPort 오류는 앱 assertion 실패와 분리해 기록합니다.

## 파일 길이·범위

검사 대상 소스·설정·테스트 파일은 모두 허용 한도 499줄 이하이며, 현재 최장 파일은 `e2e/fixtures/missionSolutions.ts` 481줄입니다. 외부 기능, 학생 음성 기능, VoiceOver 구현·검증, 사람 대상 승인으로 범위를 확장하지 않았습니다.

## 커밋

변경 파일만 아래 로컬 커밋으로 기록합니다.

```text
test: harden real keyboard select probe gate
```

push·배포·HVC 등록은 수행하지 않았습니다.
