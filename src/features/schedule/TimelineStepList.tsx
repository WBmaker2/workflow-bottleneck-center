import type { ScheduleEntry, ScenarioDefinition } from "../../domain/types";

export interface TimelineStepListProps {
  scenario: ScenarioDefinition;
  entries: readonly ScheduleEntry[];
}

const taskLabel = (scenario: ScenarioDefinition, taskId: string) => scenario.tasks.find((task) => task.id === taskId);

export function TimelineStepList({ scenario, entries }: TimelineStepListProps) {
  const order = new Map(scenario.tasks.map((task, index) => [task.id, index]));
  const sorted = [...entries].sort((left, right) => left.plannedStart - right.plannedStart || (order.get(left.taskId) ?? 999) - (order.get(right.taskId) ?? 999));
  const groups = [...new Set(sorted.map((entry) => entry.plannedStart))].sort((left, right) => left - right).map((start) => ({
    start,
    entries: sorted.filter((entry) => entry.plannedStart === start),
  }));

  return (
    <section className="timeline-step-list" aria-labelledby="step-list-title">
      <h3 id="step-list-title">단계 목록 보기</h3>
      <p>시작 시점과 시나리오 작업 순서에 따라 정리한 일정입니다.</p>
      <p>함께 진행 가능 여부는 역할·도구 조건에 따라 실행에서 확인합니다.</p>
      {groups.length === 0 && <p>아직 배치한 작업이 없습니다.</p>}
      {groups.map(({ start, entries: group }) => (
        <section key={start} aria-labelledby={`time-heading-${start}`}>
          <h4 id={`time-heading-${start}`}>{`시간 ${start}단위`}</h4>
          <ul>
            {group.map((entry) => {
              const task = taskLabel(scenario, entry.taskId);
              if (!task) return null;
              const roles = entry.roleIds.map((roleId) => scenario.roles.find((role) => role.id === roleId)?.label ?? `역할 ${roleId}`).join(", ");
              const resources = task.resources.length === 0
                ? "필요한 도구 없음"
                : task.resources.map((requirement) => scenario.resources.find((resource) => resource.id === requirement.resourceId)?.label ?? requirement.resourceId).join(", ");
              return <li key={entry.taskId}>{`시작 ${start}단위 · ${task.title} · ${task.duration}단위 · ${roles} · ${resources}`}</li>;
            })}
          </ul>
        </section>
      ))}
    </section>
  );
}
