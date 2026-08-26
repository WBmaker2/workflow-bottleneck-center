# Task 6 구현 보고서 — 학습 상태 reducer와 opt-in 로컬 저장

## 결과

- 최초 구현 커밋: `9cf046b` (`feat: manage private local learning progress`)
- 범위: Task 6에서 지정한 app/state와 storage 경계, 해당 focused tests만 변경했습니다.
- 네트워크, 로그인, 브라우저 UI 스타일은 추가하지 않았습니다.

## RED / GREEN 증거

### RED

명령:

```bash
npm run test -- tests/app/appReducer.test.ts tests/storage/progressRepository.test.ts
```

결과: `2 failed suites`, 모듈이 아직 없어 `Failed to resolve import "../../src/app/appReducer"` 및 storage 모듈 import 오류가 발생했습니다.

### GREEN

명령과 결과:

```bash
npm run test -- tests/app/appReducer.test.ts tests/storage/progressRepository.test.ts
# Test Files 2 passed, Tests 12 passed

npm run test -- tests/app tests/storage tests/domain
# Test Files 8 passed, Tests 43 passed

npm run typecheck
# passed

npm run lint
# passed with --max-warnings=0

npm run check:file-length
# Checked 36 source files (max 499 lines)

npm run build
# vite build passed
```

## 변경 파일

- `src/app/appTypes.ts`: 명시된 `AppState`, `AppAction`, snapshot/evidence/progress 계약
- `src/app/appReducer.ts`: 불변 전이, 단계 guard, snapshot 보존, 완료 조건
- `src/app/appSelectors.ts`: 단계 진입 guard와 `getRequiredAction` 단일 진실 공급원
- `src/app/AppProvider.tsx`: reducer/context, hydrate, opt-in persist, 저장 실패 공지, 비활성화 시 clear
- `src/storage/progressRepository.ts`: 메모리 repository와 `PersistenceResult`
- `src/storage/localProgressRepository.ts`: 단일 key 기반 localStorage, quota/security 오류 경계
- `src/storage/progressCodec.ts`: v1 allowlist decode/encode 및 도메인 기반 derived snapshot/comparison 재계산
- `tests/app/appReducer.test.ts`, `tests/storage/progressRepository.test.ts`: RED부터 작성한 reducer/storage 경계 테스트

## 인터페이스 준수

- brief에 정의된 `AppAction` union만 사용했으며 추가 action 이름은 만들지 않았습니다.
- 초기 상태는 네 미션 모두 `briefing`, `saveEnabled: false`입니다.
- 관계 누락/순환, 실행·예측·병목·수정 결과 선행 조건을 단계별로 차단합니다.
- 초기 snapshot은 revision 시작 시 같은 참조를 보존하고, 새 입력은 복사·동결하여 이전 상태를 바꾸지 않습니다.
- persistence는 `workflow-bottleneck-center:progress:v1` 하나만 사용하고 save opt-in 전에는 쓰지 않습니다.
- decoder는 시나리오/작업/역할 ID와 버전을 검증하고 corrupt/wrong-version/unknown-scenario를 `null`로 거부합니다. 알 수 없는 속성은 spread하지 않습니다.
- 저장에는 공지·update dialog·파생 result/bottleneck/evaluation을 포함하지 않으며, rehydrate 시 simulator/analyzer/evaluator/comparison을 다시 실행합니다.

## Self-review 및 남은 우려

- 저장 payload의 `relationEdges`를 rehydrate 시 draft의 learner edge로 정규화하여 두 입력의 불일치가 실행 경로에 남지 않도록 했습니다.
- 파생 결과는 저장하지 않으므로 시나리오 규칙이 변경되면 복원 결과가 현재 도메인 규칙 기준으로 달라질 수 있습니다. 이는 stale metric을 신뢰하지 않기 위한 의도된 동작입니다.
- `tsconfig.app.tsbuildinfo`, `tsconfig.node.tsbuildinfo`는 검증 명령이 생성한 untracked 산출물이며 커밋하지 않았습니다.

## Fix round 1/5

### RED

추가한 회귀 테스트를 먼저 실행했습니다.

```bash
npm run test -- tests/app/appReducer.test.ts tests/storage/progressRepository.test.ts
# 4 failed: 최초 snapshot 덮어쓰기, 완료 상태 stale 유지,
# hydration schedule stage 후퇴, semantic corruption 미거부
```

### GREEN

- 최초 `SAVE_INITIAL_SNAPSHOT`만 허용하고 중첩 snapshot을 복사·동결했습니다. 초기 기준 일정은 snapshot 이후 편집을 거부합니다.
- revised schedule/snapshot/evidence 변경 시 완료 상태와 stale 파생 결과를 무효화합니다.
- simulation 진입은 완전한 draft와 relation 계약 및 simulator 결과를 확인합니다.
- hydration은 저장 stage와 유효 prerequisite의 최솟값으로 복원하며 모순 stage와 존재하지 않는 bottleneck finding을 decoder에서 거부합니다.
- clear 실패는 한국어 비치명 공지로 1회 알리고 enable→disable 전이마다 clear를 한 번만 호출합니다.

Fix-round 검증:

```bash
npm run test -- tests/app/appReducer.test.ts tests/storage/progressRepository.test.ts
# Test Files 2 passed, Tests 20 passed

npm run test -- tests/app tests/storage tests/domain
# Test Files 8 passed, Tests 51 passed

npm run typecheck
# passed

npm run lint
# passed with --max-warnings=0

npm run check:file-length
# Checked 36 source files (max 499 lines)

npm run build
# vite build passed

git status --short
# source changes staged for the fix commit; tsbuildinfo 생성물 없음
```

Fix commit SHA: `02ab73c` (`fix: harden learning progress boundaries`)

## Fix round 2/5

### RED

추가 회귀 테스트는 동기 무한 순회를 피하도록 작은 시나리오와 bounded 입력으로 작성했습니다. 변경 전 계약에서 다음 세 경계를 재현하는 실패 기준을 세웠습니다.

```bash
npm run test -- tests/domain/simulator.test.ts tests/app/appReducer.test.ts tests/storage/progressRepository.test.ts
# RED cases: unsafe plannedStart의 invalid issue/run 차단,
# 큰 arithmetic-safe idle gap의 즉시 점프 및 정확한 actualStart/end,
# persisted unsafe plannedStart 거부
```

### GREEN

- `plannedStart`는 `Number.isSafeInteger`로 검증하고, `upperBound`는 duration 합과 안전 범위를 검사합니다. 범위를 벗어난 항목은 `invalid-planned-start`로 즉시 제외합니다.
- active/due 작업이 모두 없는 idle gap에서는 다음 안전한 `plannedStart`로 virtual time을 점프합니다. 기존 소형 schedule의 runs/waits deep equality를 유지합니다.
- `isScheduleReady`는 안전 정수·완전한 task/role 구조·relation 계약을 확인한 뒤 순수 simulator 결과를 사용하며 별도 임의 time cap을 두지 않습니다.
- storage decode/hydration은 unsafe plannedStart를 거부하고, `.gitignore`에 `*.tsbuildinfo`를 추가했습니다.

Fix-round 2 검증:

```bash
npm run test -- tests/domain/simulator.test.ts tests/app/appReducer.test.ts tests/storage/progressRepository.test.ts
# Test Files 3 passed, Tests 33 passed

npm run test -- tests/app tests/storage tests/domain
# Test Files 8 passed, Tests 54 passed

npm test
# Test Files 10 passed, Tests 57 passed

npm run typecheck
# passed

npm run lint
# passed with --max-warnings=0

npm run check:file-length
# Checked 36 source files (max 499 lines)

npm run build
# vite build passed

git status --short
# fix-round 변경 파일만 커밋 전 상태; tsbuildinfo 생성물 없음
```

Fix round 2 commit SHA: `b4a6664` (`fix: bound virtual schedule time safely`)

## Fix round 3/5

### RED

due 상태에서 미래 predecessor를 기다리는 큰 시각을 unit loop로 처리하지 않도록 bounded 회귀 기준을 추가했습니다. 변경 전 기준에서 다음 케이스를 재현하는 실패 조건을 고정했습니다.

```bash
npm run test -- tests/domain/simulator.test.ts tests/app/appReducer.test.ts tests/storage/progressRepository.test.ts
# RED cases: no-active due dependency의 timeout/반복 wait,
# 다중 future predecessor의 next-event/blocker 경계,
# overflow entry와 valid lower entry의 spurious simulation-bound
```

### GREEN

- active task가 없고 모든 due task가 미래 predecessor를 기다릴 때만 다음 pending plannedStart로 점프하고, 각 dependency wait를 `[time,nextEvent)`로 기록합니다.
- due predecessor가 같은 시점에 시작되는 경우에는 먼저 정상 실행한 뒤, 다음 no-active 경계에서 blocker를 재선택하여 기존 unit semantics와 같은 coalesced spans를 만듭니다.
- upper-bound overflow 시 overflow entry만 valid map에서 제외하고 남은 valid entries로 bound를 다시 계산하여 낮은 작업을 정상 실행합니다.
- round 2의 large independent idle gap, unsafe start, 소형 deterministic 결과와 storage rejection을 유지했습니다.

Fix-round 3 검증:

```bash
npm run test -- tests/domain/simulator.test.ts tests/app/appReducer.test.ts tests/storage/progressRepository.test.ts
# Test Files 3 passed, Tests 35 passed

npm run test -- tests/app tests/storage tests/domain
# Test Files 8 passed, Tests 56 passed

npm test
# Test Files 11 passed, Tests 60 passed

npm run typecheck
# passed

npm run lint
# passed with --max-warnings=0

npm run check:file-length
# Checked 37 source files (max 499 lines)

npm run build
# vite build passed

git status --short
# pre-existing unrelated untracked tests/review-temp-overflow.test.ts remains; Task 6 files are the only staged changes
```

Fix round 3 commit SHA: `dbec78b` (`fix: coalesce future dependency waits`)
