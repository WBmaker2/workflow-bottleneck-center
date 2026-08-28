# Task 5 구현 보고서 — 분석·보고 문장과 학습 회수 개선

## 상태

구현 완료. 요청한 범위만 변경하고 커밋했으며 push/deploy/HVC 등록은 수행하지 않았습니다.

## 적용 내용

- `src/data/learnerCopy.ts`
  - `LearnerCopy`의 `stageLabels`, `analysisTerms`, `reportHints` 인터페이스와 학습자용 한국어 문구를 추가했습니다.
  - `src/App.tsx`가 같은 단계 label을 이 상수에서 사용하도록 중복 선언을 제거했습니다.
- `src/features/analysis/AnalysisScreen.tsx`
  - 기존 접근성 selector인 `병목 분석` heading은 유지하면서, “뒤 작업을 기다리게 만든 곳”, “기다림의 원인”, “내가 먼저 예상한 이유”를 학습자에게 보이는 제목·설명으로 연결했습니다.
- `src/features/analysis/BottleneckPanel.tsx`, `src/features/simulation/BottleneckPrediction.tsx`
  - 병목 원인과 예측 이유를 쉬운 문장으로 바꾸고 domain `finding.id`, `blockerLabel`, radio value와 기존 예측 group/label 계약은 보존했습니다.
- `src/features/report/EvidenceProgress.tsx`
  - `EvidenceProgressProps { completed: number; total: number }`를 추가하고 `근거 문장 진행률`, `completed/total`, progress ARIA 값을 표시합니다.
- `src/features/report/EvidenceForm.tsx`
  - 네 필드의 현재/저장 evidence를 기존 `isEvidenceComplete` 기준으로 계산해 `0/4`부터 `4/4`까지 표시합니다.
  - 각 fieldset에 한 줄 예시와 “다음에 채울 칸”을 추가했습니다.
  - 기존 field names, select values, sentence/evaluator 판정, no-wait의 0단위 문장과 저장 복구 동작은 유지했습니다.
- `src/features/report/ReportLearningWrapUp.tsx`, `src/features/report/ReportScreen.tsx`
  - `ReportLearningWrapUpProps { scenario; comparison; selectedFinding }`를 구현하고 완료 버튼 전에 배치했습니다.
  - “오늘 배운 점” 세 문장에 병목 원인·협력·안전·품질을 포함하고 “다음 도전” 한 문장을 표시합니다. 비교가 없거나 조건을 잃은 경우에도 성공을 발명하지 않습니다.
  - learner 영역은 기존 `.no-print` 안에 있어 `TeacherSummaryView`와 인쇄 제외 규칙을 보존합니다.
- `src/styles/report.css`, `src/styles/components.css`, `src/main.tsx`
  - evidence/wrap-up 모바일 간격·예시 대비·진행률 bar를 별도 stylesheet로 분리해 모든 source file을 499줄 이하로 유지했습니다.
- `tests/ui/analysis-report.test.tsx`
  - 초기 `0/4`, 네 예시, 네 “다음에 채울 칸”, 오늘 배운 점/다음 도전과 hydrated `4/4` 및 기존 완성 버튼을 고정했습니다.

## TDD 및 검증

1. 구현 전 새 UI 계약 테스트를 추가하고 `npm test -- tests/ui/analysis-report.test.tsx`를 실행했습니다. 새 진행률 요소가 없어 1개 테스트가 실패했습니다.
2. 최소 구현 후 다음 focused 검증을 통과했습니다.

   ```text
   npm test -- tests/ui/analysis-report.test.tsx tests/domain/teacherSummary.test.ts
   Test Files 2 passed · Tests 16 passed
   npm run typecheck
   passed
   ```

3. 전체 정적 검증을 통과했습니다.

   ```text
   npm test
   Test Files 19 passed · Tests 186 passed
   npm run lint
   passed
   npm run typecheck
   passed
   npm run check:file-length
   Checked 98 source files (max 499 lines)
   npm run build
   vite build succeeded
   ```

4. 관련 learner/browser 회귀 검증을 통과했습니다.

   ```text
   npx playwright test e2e/accessibility-responsive.spec.ts --grep '375px analysis'
   1 passed
   npx playwright test e2e/accessibility-responsive.spec.ts --grep '375px report'
   1 passed
   npx playwright test e2e/print-report.spec.ts
   1 passed
   ```

   375px report workspace와 인쇄 시 `.report-interactive`, `.evidence-form`, learner controls가 숨고 교사용 요약만 남는 계약을 확인했습니다. VoiceOver 구현/검증은 수행하지 않았습니다.

## 파일 길이

변경 source 파일은 모두 499줄 이하입니다. 주요 파일은 `EvidenceForm.tsx` 197줄, `components.css` 433줄, `report.css` 90줄, `ReportLearningWrapUp.tsx` 40줄입니다.

## 우려 및 미수행 항목

- 전체 `npm run test:e2e`에는 기존 fixture의 strict heading selector 충돌(단계 도움말과 실제 heading이 함께 `getByRole(..., { name: ... })`에 매칭)과 기존 persistence selector 충돌이 남아 있습니다. 변경 후 직접 관련된 375px analysis/report 및 print 테스트는 통과했습니다.
- 테스트 출력에 jsdom의 기존 `HTMLCanvasElement.getContext()` 미구현 경고가 반복되지만 실패 원인은 아닙니다.
- 커밋 후 push/deploy/HVC 등록은 요청대로 하지 않았습니다.

## Fix round 1 historical note

- 이전 라운드에서 병목 fieldset legend를 학습자 용어로 바꾸면서 `e2e/keyboard-mobile.spec.ts`가 찾는 `병목 근거` selector가 깨졌습니다. 이번 라운드에서 legend를 정확히 `병목 근거`로 복원하고 쉬운 용어는 legend 아래 설명으로 이동했습니다.
- 현재 관련 결과: `npx playwright test e2e/accessibility-responsive.spec.ts --grep '375px (analysis|report)'` 2 passed, `npx playwright test e2e/print-report.spec.ts` 1 passed입니다. `npx playwright test e2e/keyboard-mobile.spec.ts --grep 'science-display'`는 병목 selector 단계 이후 기존 report heading strict 충돌(단계 도움말과 실제 heading 동시 매칭)에서 1 failed이며, 병목 selector 회귀는 재현되지 않았습니다.
