# 학습자 사용성 회귀 검증

## 범위

2026-08-28 Task 6에서 다음 자동 검증 계약을 확인하도록 E2E를 정리했습니다.

- 375px에서 첫 `조건 확인` CTA의 문서 위치가 y `< 1,800`이고, 핵심 버튼과 문서 가로 폭이 화면 안에 있습니다.
- 업데이트 내역 trigger가 static footer의 문서 흐름에 있고 단계 shell과 겹치지 않습니다.
- 시나리오 선택 상태의 `aria-current`, selected class와 계산된 배경·테두리 스타일이 일치합니다.
- 관계 화면은 필수 관계 의미 목록을 먼저 제공하고 보조 그래프는 375px에서 숨김 상태로 둡니다.
- 375px 일정 화면은 `단계 목록 보기`가 기본이며 시간표 grid는 자동으로 열지 않습니다.
- 각 학습 단계에서 해당 단계 도움말이 표시되고, reduced-motion에서는 pulse 애니메이션이 `none/0s`인 정적 강조가 됩니다. 시뮬레이션은 `page.emulateMedia({ reducedMotion: "reduce" })` 뒤 `data-reduced-motion="true"`, `다음 단계`만 노출, 수동 0→1단위 진행을 확인합니다.
- 단계별 `gi-pulse` 필수 행동 ID는 `confirm-conditions`, `confirm-relations`, `run-simulation`, `mark-bottleneck`, `compare-revision`입니다.
- 학습자 경로의 요청은 현재 origin에 한정되고 console/page error가 없습니다.
- 인쇄 매체에서는 학습자 입력·완료·업데이트 controls를 제외하고 교사용 요약만 남습니다.
- 기존 키보드 전용 흐름, 저장 복구, 핵심 버튼 44px 이상, 375px 가로 스크롤 제한을 유지합니다.

네 시나리오 전체 경로 회귀는 실제 Tab/Shift+Tab 순회로 컨트롤을 찾고 Enter/Space/Arrow 키로 조작했습니다. 이 경로에는 injected keydown/`selectedIndex` shim이나 직접 `.focus()` 점프를 사용하지 않았습니다. native-select probe는 화면에 보이는 임시 `<select>`에 실제 Tab/Home/ArrowDown 키를 보내며, 이 환경의 headless Chromium quirk를 감지할 때만 `WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1`과 함께 Playwright fallback을 허용합니다. 기본 명령은 fallback 없이 실패를 드러냅니다.

VoiceOver 구현 및 검증, 사람 대상 승인, 학생 음성 기능은 이번 범위에 포함하지 않습니다.

## 2026-08-29 안전 리디자인 추가 검증

공통 마스트헤드, 일곱 단계 진행 트랙, 시나리오 제약 한 줄, 브리핑 미션 요약, 실행·분석·수정 관찰 카드, 근거 입력 순번을 추가했습니다. 도메인 판정·저장·시나리오 데이터 파일은 변경하지 않았습니다.

- `npm run verify`: 통과. lint, typecheck, Vitest 19개 파일/191개 테스트, 파일 길이 최대 499줄, Vite build가 모두 성공했습니다. Vitest에서 출력된 jsdom Canvas 미구현 경고는 테스트 실패가 아닙니다.
- `WORKFLOW_E2E_PORT=4193 npm run test:e2e`: 45개 중 31개 통과. 실패 14개는 앱 assertion이 아니라 macOS headless Chromium의 native-select 키보드 probe=false 환경 차이로 선택값이 커밋되지 않은 경우입니다.
- `WORKFLOW_E2E_PORT=4191 WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1 npm run test:e2e`: 45개 중 45개 통과. fallback은 probe=false 호스트에서만 명시적으로 허용한 보조 증거이며 strict PASS로 부르지 않습니다.
- Playwright 브라우저 수동 확인: 375px에서 `document.documentElement.scrollWidth=360`, `clientWidth=360`, `조건 확인` 문서 y=1,192.05px, 높이 44.80px, `aria-current="step"` 1개와 일곱 단계 항목을 확인했습니다. 1280px에서도 document 가로 넘침 없이 진행 트랙/학습 공간 두 열을 확인했습니다.
- 페이지 제목 `작업 순서 병목 해결소`, `lang="ko"`, 외부 origin 요청 없음, console error 0을 확인했습니다. 업데이트 내역에는 `2026-08-29` 리디자인 기록이 표시됩니다.

실제 초등학생 사용성 승인과 교사·보조공학 사용자 승인은 이 기록만으로 주장하지 않습니다. VoiceOver 구현·검증은 사용자 지침에 따라 제외했으며, 배포·GitHub Pages·HVC 동기화도 이번 리디자인 요청에서는 실행하지 않았습니다.

## 2026-08-30 스킬 재확인·표현 계층 보완 검증

- 프로젝트 규칙, `PRODUCT.md`, `work/education-webapp-redesign-plan.md`, `design-system/MASTER.md`를 먼저 대조했습니다. Vite + React + TypeScript SPA 구조와 도메인·저장 경계를 유지했습니다.
- `impeccable` detector를 변경 UI에 한 번 실행했습니다. 반복 좌측 포인트 테두리와 `width` 레이아웃 전환 경고를 확인한 뒤 상단 경계·배경 토큰과 `transform: scaleX()`로 보완했으며, 스킬 규칙에 따라 detector를 재실행하지 않았습니다.
- `npm test -- tests/ui/analysis-report.test.tsx`: 1개 파일, 17개 테스트 통과. 0%·100% 근거 진행률 transform 계약을 포함합니다.
- `npm run verify`: 통과. lint, typecheck, Vitest 19개 파일/191개 테스트, 파일 길이 최대 499줄, Vite build가 모두 성공했습니다. jsdom Canvas 미구현 경고는 제품 실패가 아닙니다.
- `WORKFLOW_E2E_PORT=4194 WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1 npm run test:e2e`: 권한 허용 실행에서 45개 전부 통과. 375px 네 미션 키보드 경로, 단계·관계·일정 정보 계층, reduced-motion, 저장 복구, 개인정보 가드, 업데이트 내역 2026-08-30 기록, 인쇄 제외를 포함합니다.
- 같은 E2E 명령의 제한 샌드박스 실행은 macOS Chromium `MachPortRendezvous` 권한 오류로 39개 브라우저 시작 실패가 발생했습니다. 이는 앱 assertion 실패가 아니며 권한 허용 실행 결과와 분리해 기록합니다.
- 브라우저 수동 확인은 375px에서 `scrollWidth=360`, `clientWidth=360`, `조건 확인` y=1,196.09px, 진행 트랙 7개 항목, 업데이트 dialog의 2026-08-30 항목, console error 0을 확인했습니다. 1280px에서는 진행 트랙·학습 공간 두 열과 document 가로 넘침 없음을 확인했습니다.
- 실제 초등학생 사용성 세션, 교사 승인, 보조공학 사용자 승인은 수행하지 않았습니다. VoiceOver 구현·검증은 이번 범위에서 제외했습니다.

## 실행 명령과 결과

실행 순서는 계획에 맞춰 다음과 같습니다.

```text
npm run verify                       통과 (19 Vitest files, 191 tests; file-length max 499; build succeeded)
WORKFLOW_E2E_PORT=4174 npm run test:e2e -- e2e/accessibility-responsive.spec.ts  10 passed (권한 상승 재시도; reduced-motion 수동 진행 포함)
WORKFLOW_E2E_PORT=4174 npm run test:e2e -- e2e/learner-improvements.spec.ts  7 passed, 6 failed (13 total; strict; native-select probe=false)
WORKFLOW_E2E_PORT=4174 WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1 npm run test:e2e -- e2e/learner-improvements.spec.ts  13 passed (13 total; probe=false 환경에서 명시적 opt-in)
WORKFLOW_E2E_PORT=4174 npm run test:e2e  30 passed, 14 failed (44 total; strict; native-select probe=false로 14개 경로 실패)
WORKFLOW_E2E_PORT=4174 WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1 npm run test:e2e  44 passed (44 total; probe=false 환경에서 명시적 opt-in)
git diff --check                     통과
```

`npm run check:file-length` 원문은 `Checked 99 source files (max 499 lines).`이며, 499줄은 허용 한도입니다. 현재 최장 파일은 `e2e/fixtures/missionSolutions.ts` 441줄입니다.

관찰 환경의 기본 no-env learner E2E는 13개 중 7 passed/6 failed, 전체 E2E는 44개 중 30 passed/14 failed로 native-select probe=false strict 실패를 드러냈으므로 strict no-env gate는 실패입니다. 14개 실패는 이 macOS headless Chromium 환경에서 실제 native select가 Tab/Home/ArrowDown 키 선택을 커밋하지 않는 환경 한계이며 앱 assertion 실패가 아닙니다. 동일 환경에서 `WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1`을 명시한 opt-in 실행은 learner 13/13·전체 44/44로 환경 한정 통과했습니다. 따라서 opt-in 결과를 조건 없는 전체 회귀 PASS 또는 strict PASS로 부르지 않습니다. 일반 sandbox 실행에서는 Playwright Chromium이 `bootstrap_check_in ... Permission denied (1100)`로 시작 직후 종료되었으나, 권한 상승 환경에서 위 실행을 재확인했습니다. 이 MachPort 오류는 앱 assertion 실패와 분리해 기록하며, 기본 4173 포트 점유 프로세스는 종료하지 않았습니다.

정적 검사와 E2E의 상태는 분리해 기록합니다. 일반 sandbox에서 같은 MachPort 오류가 재현되면 권한이 허용된 CI 또는 브라우저 세션에서 아래 명령을 실행합니다.

```bash
WORKFLOW_E2E_PORT=4174 npm run test:e2e
```

호스트가 native-select 키 입력을 커밋하지 않는 것으로 probe된 경우에만 아래 opt-in 명령을 별도로 실행합니다.

```bash
WORKFLOW_E2E_PORT=4174 WORKFLOW_E2E_ALLOW_SELECT_FALLBACK=1 npm run test:e2e
```

## 남은 환경 한계

- VoiceOver 구현·검증은 이번 범위에서 수행하지 않았으므로 이 기록에는 spoken evidence가 없습니다.
- 실제 인쇄 미리보기와 보조공학 사용자 승인도 수행하지 않았습니다.
- 4173은 다른 preview가 사용할 수 있으므로 로컬 E2E는 4174 같은 별도 포트를 사용합니다.
