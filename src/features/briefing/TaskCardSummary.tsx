import type { ScenarioDefinition } from "../../domain/types";

export interface TaskCardSummaryProps {
  scenario: ScenarioDefinition;
}

export function TaskCardSummary({ scenario }: TaskCardSummaryProps) {
  return (
    <section className="task-card-summary" aria-labelledby="task-summary-title">
      <h3 id="task-summary-title">작업 핵심 조건 요약</h3>
      <section className="task-card-summary__constraints" aria-labelledby="task-summary-constraints-title">
        <h4 id="task-summary-constraints-title">시뮬레이터가 지키는 약속</h4>
        <ul aria-labelledby="task-summary-constraints-title">
          {scenario.resources.map((resource) => (
            <li key={resource.id} data-testid="scenario-resource-capacity">{`${resource.label}는 한 번에 ${resource.capacity}개만 쓸 수 있어요.`}</li>
          ))}
          <li>{`최소 ${scenario.fairness.minParticipatingRoles}개 역할이 참여해야 해요.`}</li>
          <li>{`역할별 맡은 양 차이는 ${scenario.fairness.maxLoadGap}단위 이하여야 공정해요.`}</li>
        </ul>
      </section>
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
              <span>{` · 예상 ${task.duration}단위 · ${prerequisiteTitles.length === 0 ? "선행 없음" : `선행: ${prerequisiteTitles.join(", ")}`} · 사람 ${task.peopleRequired}명 · 도구 ${resourceCount}개 (${resources}) · ${task.parallel === "solo" ? "단독 진행" : "역할·도구가 겹치지 않으면 동시 진행 가능"}`}</span>
              <small>{` · ${conditions}`}</small>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
