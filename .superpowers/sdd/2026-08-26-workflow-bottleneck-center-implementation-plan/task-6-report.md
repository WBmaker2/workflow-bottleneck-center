# Task 6 구현 보고서 — 학습 상태 reducer와 opt-in 로컬 저장

## 결과

- 구현 커밋: `de0e2b0` (`feat: manage private local learning progress`)
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
