import type { DependencyEdge, ScenarioDefinition } from "../../domain/types";

export interface RelationRequirementListProps {
  scenario: ScenarioDefinition;
  missing: readonly DependencyEdge[];
  headingId: string;
}

const taskTitle = (scenario: ScenarioDefinition, taskId: string) =>
  scenario.tasks.find((task) => task.id === taskId)?.title ?? taskId;

const requirementReason = (scenario: ScenarioDefinition, edge: DependencyEdge) =>
  scenario.tasks
    .find((task) => task.id === edge.afterTaskId)
    ?.prerequisites.find((requirement) => requirement.taskId === edge.beforeTaskId)
    ?.reason ?? "이 순서를 지키면 작업의 안전과 품질을 확인할 수 있습니다.";

const relationSentence = (scenario: ScenarioDefinition, edge: DependencyEdge) =>
  `먼저 ${taskTitle(scenario, edge.beforeTaskId)}, 그 다음 ${taskTitle(scenario, edge.afterTaskId)} — ${requirementReason(scenario, edge)}`;

export function RelationRequirementList({ scenario, missing, headingId }: RelationRequirementListProps) {
  return (
    <section className="relation-requirements" aria-labelledby={headingId}>
      <h3 id={headingId}>필수 관계 힌트</h3>
      {missing.length > 0 ? (
        <ol className="relation-requirement-list">
          {missing.map((edge) => <li key={`${edge.beforeTaskId}->${edge.afterTaskId}`}>{relationSentence(scenario, edge)}</li>)}
        </ol>
      ) : (
        <p>필수 관계를 모두 연결했습니다.</p>
      )}
    </section>
  );
}
