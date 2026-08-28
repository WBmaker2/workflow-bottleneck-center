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
