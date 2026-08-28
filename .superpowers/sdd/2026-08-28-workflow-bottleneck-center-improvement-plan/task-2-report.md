# Task 2 구현 보고서

## 상태

완료했습니다. 지정 범위의 단계 도움말, 시나리오 선택 상태, 업데이트 기록 dialog 연결과 문서 흐름 배치, 관계 확인 필수 버튼 강조를 구현했습니다. GitHub push, Pages 배포, HVC 등록은 실행하지 않았습니다.

## 변경 사항과 인터페이스

- `src/app/appSelectors.ts`: `RequiredActionId`를 brief의 다섯 값 유니온으로 export하고 관계 단계의 `getRequiredAction` 결과를 `confirm-relations`로 추가했습니다. 기존 다른 단계의 필수 행동 ID는 유지했습니다.
- `src/app/stageHelp.ts`: `StageHelp`와 `stageHelp: Record<LearningStage, StageHelp>`를 추가해 일곱 단계에 초등학생용 `title`, `whatToDo`, `successHint`를 제공했습니다.
- `src/components/ScenarioNavigation.tsx`: `ScenarioNavigationProps`와 시나리오 목록을 분리했습니다. 선택 버튼 하나만 `aria-current="page"`, `선택됨` 텍스트와 구별된 배경·테두리 computed style을 갖습니다.
- `src/components/StageHelpPanel.tsx`: `StageHelpPanelProps { stage }`를 추가하고 `aside[aria-labelledby]`에 단계별 지금 할 일·성공 조건을 표시했습니다.
- `src/components/UpdateHistoryButton.tsx`: `aria-haspopup`, `aria-controls`, `data-testid`를 추가하고 `update-history-dialog`와 연결했습니다.
- `src/components/ModalDialog.tsx`: optional `dialogId`를 추가해 dialog root에 id를 전달합니다.
- `src/features/relations/RelationScreen.tsx`: 관계 확인을 `RequiredActionButton actionId="confirm-relations"`로 연결했습니다.
- `src/App.tsx`, `src/styles/layout.css`, `src/styles/components.css`: 새 nav/help를 shell에 배치하고 footer 흐름에 업데이트 trigger를 넣었습니다. trigger는 `position: static`이며 모바일 고정 좌표를 제거했습니다.
- `src/data/updateHistory.ts`: 2026-08-28 개선 항목을 정확히 한 번 추가했습니다.
- 테스트: 관계 selector 기대값, 단계 도움말·선택 상태·단일 pulse, dialog id/aria 연결·footer 흐름 테스트를 추가·수정했습니다. 업데이트 history E2E는 문서 흐름과 새 날짜를 검증하도록 갱신했습니다.

## TDD 및 검증

1. 실패 단계: 구현 전 테스트에서 관계 단계가 `null`이고 pulse·도움말·trigger test id·dialog id가 없어 6개가 실패했습니다.
2. 구현 단계: 위 인터페이스와 최소 JSX/CSS를 추가하고 기존 도메인 및 저장 계약은 건드리지 않았습니다.
3. 대상 통과:

```text
npm test -- tests/app/appReducer.test.ts tests/ui/accessibility.test.tsx tests/ui/update-history.test.tsx
Test Files 3 passed; Tests 49 passed
```

4. 전체 회귀 통과:

```text
npm run verify
lint passed
typecheck passed
Test Files 19 passed; Tests 178 passed
Checked 92 source files (max 499 lines)
vite build passed (85 modules transformed)
```

5. 브라우저 흐름 통과:

```text
npm run test:e2e -- e2e/update-history.spec.ts
2 passed (1280px, 375px)
```

`prefers-reduced-motion`의 기존 `.gi-pulse { animation: none; }` 계약은 유지되어 감소 모드에서 animation duration이 0초인 정지 상태를 보장합니다. 업데이트 trigger는 normal document flow의 footer에 있어 모바일 콘텐츠를 덮지 않습니다. VoiceOver 구현·검증과 학생 음성 기능은 수행하지 않았습니다.

## 파일 길이

모든 소스·테스트 파일이 499줄 이하입니다. 새 파일은 `stageHelp.ts` 45줄, `ScenarioNavigation.tsx` 36줄, `StageHelpPanel.tsx` 22줄, `update-history.test.tsx` 42줄입니다.

## 우려 및 경계

- jsdom 테스트 실행 중 기존 SVG canvas 경고(`HTMLCanvasElement.getContext() is not implemented`)가 출력되지만 테스트 실패는 아니며 제품 코드 결함으로 확인되지 않았습니다.
- 실제 VoiceOver·사람 대상 수업 수용성 검증은 범위 밖입니다.
- 배포·공개 URL·HVC 등록은 요청대로 보류했습니다.
