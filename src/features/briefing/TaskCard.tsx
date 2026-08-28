import type { TaskDefinition, ScenarioDefinition } from "../../domain/types";

export interface TaskCardProps {
  task: TaskDefinition;
  scenario: ScenarioDefinition;
  defaultOpen?: boolean;
}

export function TaskCard({ task, scenario, defaultOpen = false }: TaskCardProps) {
  const headingId = `task-card-title-${task.id}`;
  const prerequisites = task.prerequisites.map((requirement) => ({
    ...requirement,
    title: scenario.tasks.find(({ id }) => id === requirement.taskId)?.title ?? requirement.taskId,
  }));
  const unlockTitles = task.unlocks.map((taskId) => scenario.tasks.find(({ id }) => id === taskId)?.title ?? taskId);
  const prerequisiteSummary = prerequisites.length === 0 ? "선행 없음" : `선행: ${prerequisites.map(({ title }) => title).join(", ")}`;
  const resourceCount = task.resources.reduce((total, resource) => total + resource.quantity, 0);
  const resourceSummary = task.resources.length === 0
    ? "도구 없음"
    : task.resources.map((resource) => {
      const definition = scenario.resources.find(({ id }) => id === resource.resourceId);
      return `${definition?.label ?? resource.resourceId} ${resource.quantity}개`;
    }).join(", ");

  return (
    <details className="task-card" open={defaultOpen}>
      <summary>
        <span className="task-card__summary-title">{task.title}</span>
        <span className="task-card__summary-meta">{`예상 시간 ${task.duration}단위 · ${prerequisiteSummary} · 필요한 사람 ${task.peopleRequired}명 · 도구 ${resourceCount}개${resourceCount > 0 ? ` (${resourceSummary})` : ""}`}</span>
      </summary>
      <article className="task-card__body" aria-labelledby={headingId}>
        <h4 id={headingId}>{task.title}</h4>
        <dl>
          <div className="task-card__field"><dt>예상 시간</dt><dd>{`예상 시간 ${task.duration}단위`}</dd></div>
          <div className="task-card__field">
            <dt>먼저 할 작업</dt>
            <dd>
              {prerequisites.length === 0 ? "먼저 할 작업 없음" : (
                <>
                  <span>{`먼저: ${prerequisites.map(({ title }) => title).join(", ")}`}</span>
                  <ul>{prerequisites.map(({ taskId, title, reason }) => <li key={`${taskId}-reason`}>{`${title} 공개 이유: ${reason}`}</li>)}</ul>
                </>
              )}
            </dd>
          </div>
          <div className="task-card__field">
            <dt>사람과 도구</dt>
            <dd>
              <span>{`필요한 사람 ${task.peopleRequired}명`}</span>
              <ul>
                {task.resources.length === 0 ? <li>필요한 도구 없음</li> : task.resources.map((resource) => {
                  const definition = scenario.resources.find(({ id }) => id === resource.resourceId);
                  return <li key={resource.resourceId}>{`필요한 도구: ${definition?.label ?? resource.resourceId} ${resource.quantity}개`}</li>;
                })}
              </ul>
            </dd>
          </div>
          <div className="task-card__field"><dt>동시 진행</dt><dd>{task.parallel === "solo" ? "동시에 진행: 단독 진행" : "동시에 진행: 조건이 맞으면 가능"}</dd></div>
          <div className="task-card__field">
            <dt>안전·품질 조건</dt>
            <dd>{task.conditions.length === 0 ? "안전·품질 조건 없음" : <ul>{task.conditions.map((condition) => <li key={condition.id}>{`${condition.kind === "safety" ? "안전" : "품질"}: ${condition.label}`}</li>)}</ul>}</dd>
          </div>
          <div className="task-card__field"><dt>끝난 뒤 열림</dt><dd>{unlockTitles.length === 0 ? "이 작업이 마지막 단계입니다" : `끝난 뒤 열림: ${unlockTitles.join(", ")}`}</dd></div>
        </dl>
      </article>
    </details>
  );
}
