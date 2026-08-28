import type { ScenarioDefinition } from "../../domain/types";

export interface TaskCardSummaryProps {
  scenario: ScenarioDefinition;
}

export function TaskCardSummary({ scenario }: TaskCardSummaryProps) {
  return (
    <section className="task-card-summary" aria-labelledby="task-summary-title">
      <h3 id="task-summary-title">작업 핵심 조건 요약</h3>
      <p>전체 작업의 순서와 필요한 조건을 먼저 살펴본 뒤, 자세한 카드를 필요한 만큼 펼쳐 보세요.</p>
      <ol>
        {scenario.tasks.map((task) => {
          const prerequisiteTitles = task.prerequisites.map((requirement) => scenario.tasks.find(({ id }) => id === requirement.taskId)?.title ?? requirement.taskId);
          const resourceCount = task.resources.reduce((total, resource) => total + resource.quantity, 0);
          const resources = task.resources.length === 0
            ? "없음"
            : task.resources.map((resource) => {
              const label = scenario.resources.find(({ id }) => id === resource.resourceId)?.label ?? resource.resourceId;
              return `${label} ${resource.quantity}개`;
            }).join(", ");
          const conditions = task.conditions.length === 0
            ? "조건 없음"
            : task.conditions.map((condition) => `${condition.kind === "safety" ? "안전" : "품질"}: ${condition.label}`).join(" · ");

          return (
            <li key={task.id} data-testid="task-summary-item">
              <strong>{task.title}</strong>
              <span>{`예상 ${task.duration}단위 · ${prerequisiteTitles.length === 0 ? "선행 없음" : `선행: ${prerequisiteTitles.join(", ")}`} · 사람 ${task.peopleRequired}명 · 도구 ${resourceCount}개 (${resources}) · ${task.parallel === "solo" ? "단독 진행" : "동시 가능"}`}</span>
              <small>{conditions}</small>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
