# Task 1 구현 보고서 — 안내 화면의 첫 행동과 작업 카드 점진 공개

## 변경 파일

- `src/features/briefing/TaskCard.tsx`
  - `TaskCardProps.defaultOpen?: boolean`을 추가했습니다.
  - 작업 카드를 `<details>`로 바꾸고 `<summary>`에 작업명, 예상 시간, 선행 작업, 필요한 사람 수, 필요한 도구를 표시했습니다.
  - 펼친 본문에는 기존 예상 시간·선행·사람·도구·동시 진행·안전·품질·열림 정보를 그대로 유지했습니다.
- `src/features/briefing/TaskCardSummary.tsx`
  - `TaskCardSummaryProps { scenario: ScenarioDefinition }`와 `TaskCardSummary`를 추가했습니다.
  - 시나리오의 각 작업을 `data-testid="task-summary-item"`이 있는 `<ol>` 항목으로 렌더링합니다.
- `src/features/briefing/BriefingScreen.tsx`
  - 목표 아래에 작업 핵심 조건 요약을 배치했습니다.
  - 첫 상세 카드만 `defaultOpen`으로 열고, 조건 확인 버튼을 상세 카드보다 앞에 배치했습니다.
  - 안내 단계의 가상 시간 문장에 관계 연결 이동 안내를 합쳤습니다.
- `src/App.tsx`
  - 안내 단계에서는 전역 가상 시간 문장을 숨겨 단계 안내의 한 문단만 표시하고, 이후 단계에는 기존 전역 안내를 유지합니다.
- `src/styles/components.css`
  - 작업 카드 summary, marker, 펼침 본문, compact summary list, 모바일 줄바꿈 스타일을 추가했습니다.
- `src/styles/layout.css`
  - 안내 단계 CTA가 자연스러운 문서 흐름에서 앞쪽에 놓이도록 정렬을 추가했습니다.
- `tests/ui/briefing.test.tsx`
  - 작업 요약 개수, 첫 카드만 펼침, CTA 안내 문장, 가상 시간 문장 중복 제거를 검증했습니다.
  - 기존 상세 필드 검증은 카드 summary를 연 뒤 수행하도록 갱신했습니다.
- `tests/ui/accessibility.test.tsx`
  - 작업 summary의 이름, 안내 heading, 조건 확인 버튼의 접근 가능한 이름, 단일 pulse를 검증했습니다.
- `.superpowers/sdd/2026-08-28-workflow-bottleneck-center-improvement-plan/task-1-report.md`
  - 본 보고서입니다.

`src/data/updateHistory.ts`는 Task 2 범위이므로 변경하지 않았습니다. 기존 domain 판정 및 저장 계약도 변경하지 않았습니다.

## Public interface

- `TaskCardProps`에 선택적 `defaultOpen`을 추가했습니다. 생략 시 카드는 접힌 상태이며, 안내 화면에서는 첫 카드에만 `true`를 전달합니다.
- `TaskCardSummaryProps`는 `scenario: ScenarioDefinition`을 받습니다.
- 학습 흐름의 reducer/action 및 domain/storage API는 변경하지 않았습니다.

## TDD 순서

1. 실패 테스트 추가: `task-summary-item`과 summary heading이 아직 없어 작업 요약·점진 공개 테스트 2개가 실패했습니다.
2. 최소 구현: `TaskCardSummary`, `<details>/<summary>`, 첫 카드 기본 펼침, CTA 순서와 안내 문장, 관련 CSS를 구현했습니다.
3. 통과 테스트: 대상 UI 테스트 40개와 전체 테스트 175개가 통과했습니다.

## 실행 명령과 결과

```text
npm test -- tests/ui/briefing.test.tsx tests/ui/accessibility.test.tsx
초기: Test Files 2 failed, Tests 2 failed, 38 passed
최종: Test Files 2 passed, Tests 40 passed

npm test
Test Files 18 passed, Tests 175 passed

npm run typecheck
통과 (exit 0)

npm run lint
통과 (exit 0)

npm run build
통과: 82 modules transformed, Vite production build 완료

npm run check:file-length
통과: Checked 87 source files (max 499 lines).

git diff --check
통과 (출력 없음)
```

## 500줄 검사

`npm run check:file-length` 결과 변경된 소스·테스트 파일을 포함한 87개 파일 모두 최대 499줄 제한을 지켰습니다. 가장 긴 변경 파일은 `src/styles/components.css` 481줄입니다.

## 남은 우려

- Vitest 실행 중 기존 jsdom canvas 경고(`HTMLCanvasElement's getContext() method`)가 출력되지만 테스트 실패나 새 기능 오류는 아니었습니다.
- 이번 범위에서는 VoiceOver 및 수동 브라우저 시각 검증을 수행하지 않았습니다.
- Push, GitHub Pages 배포, HVC 등록은 요청 범위 밖이므로 수행하지 않았습니다.
