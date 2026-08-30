# Task 3 구현 보고서

## 상태

완료했습니다. 관계 화면에 필수 관계의 문장 안내, 검증 후 오류 피드백, 375px 모바일 우선 레이아웃을 적용했습니다. Task 2가 만든 `confirm-relations` 필수 버튼과 2026-08-28 업데이트 내역은 그대로 유지했으며, push·Pages 배포·HVC 등록은 하지 않았습니다.

## 변경 파일과 인터페이스

- `src/features/relations/RelationRequirementList.tsx`
  - `RelationRequirementListProps { scenario: ScenarioDefinition; missing: readonly DependencyEdge[]; headingId: string }`를 export했습니다.
  - `missing`의 각 관계를 `먼저 자료 확인, 그 다음 인쇄 글 정리 — 확인한 글만 인쇄 파일에 넣습니다` 형식의 `<ol>` 문장으로 표시합니다.
  - 필수 관계가 모두 연결된 경우에도 제목과 완료 안내를 유지합니다.
- `src/features/relations/RelationBoard.tsx`
  - 학생이 만든 관계(`학생이 만든 관계`/`연결한 관계`)와 필수 관계 힌트(`필수 관계 힌트`)를 별도 제목으로 구분했습니다.
  - 의미 목록과 `RelationRequirementList`를 SVG보다 먼저 렌더링했습니다.
  - SVG의 `aria-hidden="true"`와 기존 관계 validator, edge kind·missing 시각 표현은 유지했습니다.
- `src/features/relations/RelationScreen.tsx`
  - `hasValidated` 상태를 추가해 최초 진입에는 invalid `role="alert"`를 렌더링하지 않습니다.
  - `관계 확인` 클릭으로 검증한 뒤 invalid summary를 표시하고 summary에 focus합니다.
  - valid-with-extra 설명과 Task 2의 `RequiredActionButton actionId="confirm-relations"` 연결을 유지했습니다.
- `src/styles/relation.css`
  - 관계 전용 목록·힌트 패널·SVG 스타일을 분리했습니다.
  - 데스크톱 SVG `min-height: 280px`, 600px 이하 SVG 숨김, 의미 목록 전체 너비, 관계 삭제 버튼의 44px 최소 높이를 정의했습니다.
- `src/styles/layout.css`, `src/main.tsx`
  - 관계 board의 overflow를 제한하고 새 관계 스타일시트를 앱에 import했습니다.
- `tests/ui/relations.test.tsx`
  - zero-edge에서 `missingRequired.length`와 같은 문장 목록, 문장 형식, 초기 alert 부재를 검증합니다.
  - invalid 행은 확인 전 alert 부재, 확인 후 alert를 검증하고 valid-with-extra 회귀 assertion을 새 흐름에 맞췄습니다.
- `e2e/learner-improvements.spec.ts`
  - 375px에서 필수 관계 목록 노출, SVG 보조물 숨김, 수평 overflow 없음, 목록/추가 컨트롤 44px 이상을 검증합니다.

`src/data/updateHistory.ts`는 수정하지 않았습니다. Task 2의 2026-08-28 항목을 중복 추가하지 않았습니다.

## TDD 및 검증

1. RED: 새 필수 관계 목록 테스트를 먼저 추가하고 `npm test -- tests/ui/relations.test.tsx`를 실행했습니다. 구현 전 `필수 관계 힌트` heading을 찾지 못해 1개 테스트가 실패했습니다.
2. 최소 구현: 의미 목록, `hasValidated` 지연 alert/focus, 반응형 관계 CSS와 375px E2E assertion을 추가했습니다. 500줄 경계를 지키기 위해 관계 CSS를 별도 파일로 분리했습니다.
3. 대상 단위 테스트:

```text
npm test -- tests/ui/relations.test.tsx tests/ui/accessibility.test.tsx
Test Files  2 passed (2)
Tests       42 passed (42)
```

4. 전체 단위 테스트:

```text
npm test
Test Files  19 passed (19)
Tests       180 passed (180)
```

5. 정적 검사:

```text
npm run typecheck       # passed
npm run lint            # passed
npm run check:file-length  # Checked 94 source files (max 499 lines)
npm run build           # passed, Vite production bundle generated
```

6. 관계 E2E:

```text
npx playwright test --config=/private/tmp/wbc-playwright.config.ts e2e/learner-improvements.spec.ts
3 passed
```

기본 4173 preview 포트가 환경에서 사용 중이라 임시 4174 설정으로 실행했습니다. 임시 설정은 `/private/tmp`에만 두었고 저장소에는 추가하지 않았습니다.

## 파일 길이

변경된 소스·테스트 파일은 모두 499줄 이하입니다. `npm run check:file-length`가 94개 소스를 확인했습니다.

## 우려 및 범위 밖

- Vitest 실행 중 기존 jsdom canvas `getContext()` 미구현 경고가 출력되지만 테스트 실패는 아닙니다.
- 4173 포트 점유로 기본 E2E 명령은 실행하지 못했고 동일 preview를 4174에서 검증했습니다.
- VoiceOver, 학생 음성, 외부 기능, push·배포·HVC 등록은 요청 범위 밖이라 수행하지 않았습니다.

## 수정 라운드 1

리뷰에서 지적된 두 Important finding을 수정했습니다.

- `src/features/relations/RelationScreen.tsx`: `validationAttempt` 카운터를 추가했습니다. invalid 상태가 그대로여도 `관계 확인` 클릭마다 카운터가 증가하고 오류 summary focus effect가 다시 실행됩니다. 기존 validator와 관계 edge 의미는 변경하지 않았습니다.
- `tests/ui/relations.test.tsx`: 첫 invalid 확인 후 focus를 확인하고, 관계 하나를 삭제해 목록이 바뀐 뒤 두 번째 invalid 확인에서도 같은 alert focus가 복원되는 회귀 테스트를 추가했습니다.
- `e2e/learner-improvements.spec.ts`: zero-edge 컨트롤 순회를 제거했습니다. 375px에서 실제 관계를 하나 추가해 삭제 버튼이 생성되는 것을 확인하고, `관계 연결` 추가 버튼과 생성된 삭제 버튼을 각각 44px 이상으로 측정합니다. 필수 문장 목록·숨김 SVG·수평 overflow assertion은 유지했습니다.

TDD/검증 명령과 결과:

1. RED: `npm test -- tests/ui/relations.test.tsx -t "restores error focus"`에서 두 번째 확인 후 active element가 alert가 아니어서 1개 실패했습니다.
2. 구현 후 `npm test -- tests/ui/relations.test.tsx -t "restores error focus"`: 1 passed.
3. `npm test -- tests/ui/relations.test.tsx`: 12 passed.
4. 첫 E2E 시도는 `getByLabelText` Playwright API 타입 오류로 중단되었고 `getByLabel`로 교정했습니다.
5. `npm run build && npx playwright test --config=/private/tmp/wbc-playwright.config.ts e2e/learner-improvements.spec.ts`: build passed, 3 E2E passed.

수정 라운드 1 우려: 기본 4173 포트 점유 때문에 기존과 같이 임시 4174 preview 설정으로 E2E를 실행했습니다. jsdom canvas `getContext()` 미구현 경고는 기존과 동일하며 테스트 실패가 아닙니다.

## 수정 라운드 2

리뷰에서 요청한 E2E 정밀 assertion을 추가했습니다.

- `e2e/learner-improvements.spec.ts`: 관계를 생성한 뒤 exact `자료 확인과 인쇄 글 정리 관계 삭제` locator가 정확히 1개인지 `toHaveCount(1)`로 확인합니다. 기존 의미 목록·hidden graph·수평 overflow·44px height assertion은 유지했습니다.

검증:

```text
npx playwright test --config=/private/tmp/wbc-playwright.config.ts e2e/learner-improvements.spec.ts
3 passed
```

수정 라운드 2 우려: 기본 4173 포트 점유로 임시 4174 preview 설정을 사용했습니다. push·배포·HVC 등록은 하지 않았습니다.
