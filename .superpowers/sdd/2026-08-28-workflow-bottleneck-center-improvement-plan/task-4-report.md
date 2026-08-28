# Task 4 구현 보고서

## 상태

완료했습니다. 600px 이하 브라우저에서는 일정 화면이 `단계 목록 보기`로 시작하고, 사용자가 `시간표 보기`로 전환할 수 있게 했습니다. 데스크톱은 기존처럼 시간표로 시작하며 목록으로 전환할 수 있습니다. 기존 PlacementForm의 작업·시점·담당 field name, 선택 순서, 검증 조건과 Task 2 pulse 계약은 변경하지 않았습니다. push·Pages 배포·HVC 등록은 하지 않았습니다.

## 변경 파일과 인터페이스

- `src/features/schedule/ScheduleEditor.tsx`
  - `ScheduleView = "grid" | "list"`를 export했습니다.
  - `initialScheduleView(): ScheduleView`가 SSR·matchMedia 미지원 환경에서는 `grid`, `(max-width: 600px)`가 일치할 때 `list`, 그 밖에는 `grid`를 반환합니다.
  - 기존 두 switch button의 `aria-pressed`와 상태 전환을 유지하고 초기 상태만 helper로 결정합니다.
- `src/features/schedule/PlacementForm.tsx`
  - `몇 단위부터 시작할까요?` 안내를 추가하고 `placement-start` select에 `aria-describedby`를 연결했습니다. 기존 label text `시작 시점`, name, option value는 유지했습니다.
  - 역할 선택 앞에 역할 A·B·C가 능력이 아니라 맡은 자리라는 안내를 추가했습니다.
- `src/features/schedule/TimelineStepList.tsx`
  - 역할 A·B·C가 맡은 자리라는 목록 안내를 추가했습니다.
- `src/features/schedule/TimelineGrid.tsx`
  - grid 선택 시 `옆으로 움직여 시간 보기` 안내를 표시합니다.
- `src/styles/components.css`
  - `.timeline-grid`의 `34rem` 최소 폭은 `min-width: 601px`에서만 적용합니다.
  - 목록·안내 문구가 좁은 화면에서 줄바꿈되도록 스타일을 추가했습니다.
- `tests/ui/schedule.test.tsx`
  - small/desktop `matchMedia` 기본값, switch 전환, native select focus·keyboard 회귀, 새 안내 문구를 검증하는 4개 테스트를 추가했습니다.
- `e2e/accessibility-responsive.spec.ts`
  - 375px schedule stage의 workspace 기준을 grid에서 기본 목록으로 조정했습니다.

`src/data/updateHistory.ts`는 수정하지 않았으며 2026-08-28 항목을 중복 추가하지 않았습니다.

## TDD 및 검증

1. RED: 새 테스트를 먼저 추가한 뒤 `npm test -- --run tests/ui/schedule.test.tsx`를 실행했습니다. 기존 구현 기준으로 small viewport list 기본값, keyboard select assertion, 용어 안내의 3개 테스트가 실패했습니다(기존 20개는 통과).
2. 최소 구현: viewport-safe 초기 helper, 안내 문구, grid hint, desktop-only min-width CSS를 적용했습니다. native select의 실제 값·field contract는 변경하지 않았습니다.
3. 대상 unit/accessibility:

```text
npm test -- --run tests/ui/schedule.test.tsx
Test Files  1 passed (1)
Tests       23 passed (23)

npm run typecheck
passed
npm run lint
passed
npm test -- --run tests/ui/schedule.test.tsx tests/ui/accessibility.test.tsx
Test Files  2 passed (2)
Tests       54 passed (54)
npm run check:file-length
Checked 94 source files (max 499 lines)
```

4. Build 및 responsive E2E:

```text
npm run test:e2e -- e2e/accessibility-responsive.spec.ts
build passed; 3 passed, 7 failed
npx playwright test e2e/accessibility-responsive.spec.ts --grep "375px schedule"
failed before schedule workspace assertion: existing common `업데이트 내역` in-viewport assertion
```

Responsive E2E의 7개 실패는 모든 375px stage에서 공통으로 `업데이트 내역` 버튼이 viewport 안에 있어야 한다는 기존 assertion에서 발생했습니다. desktop track, motion, screenshot 케이스는 통과했습니다. schedule 목록 전환 자체는 unit 테스트에서 검증했습니다.

## 파일 길이

변경된 소스·테스트 파일은 모두 499줄 이하입니다. 주요 길이는 `ScheduleEditor.tsx` 62줄, `PlacementForm.tsx` 89줄, `TimelineStepList.tsx` 44줄, `TimelineGrid.tsx` 103줄, `schedule.test.tsx` 389줄입니다.

## 우려 및 범위 밖

> 아래 우려와 수치는 Task 4 당시의 historical pre-fix 기록입니다. Task 6에서 static footer 선택자와 4174 포트 회귀 설정을 반영했습니다.

- Vitest 중 jsdom의 기존 `HTMLCanvasElement.getContext()` 미구현 경고가 출력되지만 테스트 실패는 아닙니다.
- 375px 전체 responsive E2E는 위 기존 공통 in-viewport assertion 때문에 완료되지 않았습니다. Task 6에서 전체 E2E를 확장·정리할 때 함께 재검증해야 합니다.
- 명시적 grid 전환 시 시간축 안내는 제공하지만, 현재 요청대로 34rem 최소 폭은 데스크톱 media query에만 적용했습니다.
- VoiceOver, 음성 기능, 외부 기능, domain/save 변경, push·배포·HVC 등록은 수행하지 않았습니다.

## 수정 라운드 1

리뷰에서 지적한 세 가지 구현·검증 문제를 수정했습니다.

- `src/features/schedule/ScheduleEditor.tsx`: 일정 보기 switcher를 PlacementForm보다 먼저 렌더링해 Tab 순서를 switch 두 버튼 → 작업 → 시작 시점 → 담당 역할로 맞췄습니다. 기존 switch 상태와 `aria-pressed`는 유지했습니다.
- `tests/ui/schedule.test.tsx`: 실제 `user.tab()`으로 시간표 보기, 단계 목록 보기, 작업 select, 시작 select, 역할 A의 focus 순서를 확인하고 역할 A를 Space로 선택합니다. Arrow 키가 값을 바꾼다고 주장하는 assertion은 제거했습니다.
- `e2e/accessibility-responsive.spec.ts`: 기존 `업데이트 내역` viewport assertion을 static footer 존재·`position: static` 검증으로 바꿨습니다.
- `e2e/learner-improvements.spec.ts`: `encodeProgress` 기반 schedule-stage fixture를 추가하고 `page.goto("./")`, 375px 목록 기본값, grid 부재, document scrollWidth ≤ clientWidth를 검증합니다.
- `src/styles/components.css`: 네 가지 새 학습자 안내 문구의 글자 크기를 `1rem`으로 올렸습니다.

수정 라운드 검증:

```text
npm test -- --run tests/ui/schedule.test.tsx
Test Files  1 passed (1)
Tests       23 passed (23)

npm run typecheck && npm run lint && npm run check:file-length
all passed; Checked 94 source files (max 499 lines)

npm run test:e2e -- e2e/learner-improvements.spec.ts e2e/accessibility-responsive.spec.ts
build passed; initial run had 1 stale exact-name locator failure in the new schedule assertion

npx playwright test e2e/learner-improvements.spec.ts e2e/accessibility-responsive.spec.ts
14 passed (14)
```

남은 우려: Vitest의 기존 jsdom canvas `getContext()` 미구현 경고는 남아 있으나 실패가 아닙니다. VoiceOver, 음성 기능, 외부 기능, domain/save 변경, push·배포·HVC 등록은 여전히 범위 밖입니다.

## Task 6 historical update

Task 4의 375px 업데이트 trigger viewport 실패 기록은 당시 선택자 계약에 대한 관찰이며 현재 구현의 실패 판정이 아닙니다. 최신 파일 길이와 전체 명령 결과는 Task 6 보고서에 기록합니다.
