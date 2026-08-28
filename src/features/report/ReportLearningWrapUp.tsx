import { learnerCopy } from "../../data/learnerCopy";
import type { AttemptComparison, BottleneckFinding, ScenarioDefinition } from "../../domain/types";

export interface ReportLearningWrapUpProps {
  scenario: ScenarioDefinition;
  comparison: AttemptComparison | null;
  selectedFinding: BottleneckFinding | null;
}
const conditionText = (comparison: AttemptComparison): string => {
  const conditions = [
    comparison.preserved.safety ? "안전" : "안전 확인",
    comparison.preserved.quality ? "품질" : "품질 확인",
    comparison.preserved.fairness ? "역할 공정성" : "협력 방법",
  ];
  return conditions.join("·");
};

export function ReportLearningWrapUp({ scenario, comparison, selectedFinding }: ReportLearningWrapUpProps) {
  const bottleneckLesson = selectedFinding
    ? `${selectedFinding.blockerLabel} 때문에 ${scenario.tasks.find((task) => task.id === selectedFinding.blockedTaskId)?.title ?? "뒤 작업"}이(가) 기다린 까닭을 찾아보았어요. 병목은 가장 오래 걸린 일이 아니라 ${learnerCopy.reportHints.bottleneck}`
    : `기다림이 없을 때에도 ${learnerCopy.reportHints.bottleneck} 기록을 살펴보며 흐름을 설명할 수 있어요.`;
  const comparisonLesson = comparison
    ? `수정 결과를 보며 시간이 ${comparison.finishDelta <= 0 ? "줄거나 그대로인지" : "늘었는지"}만 보지 않고 ${conditionText(comparison)}을 함께 확인했어요.`
    : "아직 수정 결과를 비교하지 않았어요. 시간과 함께 안전·품질·협력 조건도 살펴보세요.";

  return (
    <section className="report-learning-wrap-up" aria-labelledby="report-learning-wrap-up-title">
      <h3 id="report-learning-wrap-up-title">오늘 배운 점</h3>
      <ul>
        <li>{bottleneckLesson}</li>
        <li>앞 작업과 함께 할 작업을 구분하고, 역할을 나누어 협력하는 방법을 생각했어요.</li>
        <li>{comparisonLesson}</li>
      </ul>
      <h3 id="report-next-challenge-title">다음 도전</h3>
      <p aria-labelledby="report-next-challenge-title">다음에는 {scenario.title}의 새 일정에서도 병목 원인을 먼저 찾고 안전·품질·협력 조건을 모두 지켜 보세요.</p>
    </section>
  );
}
