import type { DragEvent } from "react";
import type { ScheduleEntry, ScenarioDefinition } from "../../domain/types";

export interface TimelineGridProps {
  scenario: ScenarioDefinition;
  entries: readonly ScheduleEntry[];
  onMove(taskId: string, plannedStart: number): void;
  onDelete?(taskId: string): void;
}

const horizonFor = (scenario: ScenarioDefinition, entries: readonly ScheduleEntry[]) => {
  const taskDuration = new Map(scenario.tasks.map((task) => [task.id, task.duration]));
  const latest = entries.reduce((max, entry) => Math.max(max, entry.plannedStart + (taskDuration.get(entry.taskId) ?? 0)), 0);
  const upper = scenario.timeGoal + scenario.tasks.reduce((total, task) => total + task.duration, 0);
  return Math.max(upper, latest);
};

const taskFor = (scenario: ScenarioDefinition, taskId: string) => scenario.tasks.find((task) => task.id === taskId);

export function TimelineGrid({ scenario, entries, onMove, onDelete }: TimelineGridProps) {
  const horizon = horizonFor(scenario, entries);
  const taskById = new Map(scenario.tasks.map((task) => [task.id, task]));
  const entryById = new Map(entries.map((entry) => [entry.taskId, entry]));
  const taskForCell = (roleId: "A" | "B" | "C", time: number) => entries.find((entry) => {
    const task = taskById.get(entry.taskId);
    return task && entry.roleIds[0] === roleId && entry.plannedStart === time;
  });
  const resourceTask = (resourceId: string, time: number) => entries.find((entry) => {
    const task = taskById.get(entry.taskId);
    return task?.resources.some((resource) => resource.resourceId === resourceId)
      && time >= entry.plannedStart
      && time < entry.plannedStart + (task?.duration ?? 0);
  });

  const drop = (event: DragEvent<HTMLDivElement>, time: number) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    if (taskId && entryById.has(taskId)) onMove(taskId, time);
  };

  const dragStart = (event: DragEvent<HTMLButtonElement>, taskId: string) => {
    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";
  };

  const times = Array.from({ length: horizon + 1 }, (_, index) => index);
  return (
    <section className="timeline-grid-section" aria-labelledby="timeline-title">
      <h3 id="timeline-title">시간표 보기</h3>
      <p>시간은 교육용 가상 단위입니다. 작업 카드는 드래그로 옮길 수 있지만, 아래 작업 배치 선택만으로도 모두 진행할 수 있습니다.</p>
      <div className="timeline-grid" role="grid" aria-label="작업 시간표">
        <div role="row" className="timeline-grid__header">
          <span role="columnheader">역할·도구</span>
          {times.map((time) => <span role="columnheader" key={time}>{`시간 ${time}`}</span>)}
        </div>
        {scenario.roles.map((role) => (
          <div role="row" className="timeline-grid__row" key={role.id} aria-label={`${entries.filter((entry) => entry.roleIds.includes(role.id)).map((entry) => `${entry.plannedStart}단위 ${taskById.get(entry.taskId)?.title ?? entry.taskId} `).join("")}${role.label}`}>
            <span role="rowheader">{role.label}</span>
            {times.map((time) => {
              const entry = taskForCell(role.id, time);
              const task = entry ? taskFor(scenario, entry.taskId) : undefined;
              return (
                <div
                  role="gridcell"
                  className="timeline-grid__cell"
                  key={`${role.id}-${time}`}
                  aria-label={`시간 ${time} ${role.label}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => drop(event, time)}
                >
                  {task && entry && (
                    <div className="task-chip" data-task-id={task.id}>
                      <button type="button" draggable onDragStart={(event) => dragStart(event, task.id)} aria-label={`${task.title} ${task.duration}단위`}>{task.title}</button>
                      <span aria-hidden="true">{task.duration}단위</span>
                      {onDelete && <button type="button" aria-label={`${task.title} 일정 삭제`} onClick={() => onDelete(task.id)}>삭제</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {scenario.resources.map((resource) => (
          <div role="row" className="timeline-grid__row timeline-grid__row--resource" key={resource.id} aria-label={`도구 ${resource.label}`}>
            <span role="rowheader">{`도구 ${resource.label}`}</span>
            {times.map((time) => {
              const entry = resourceTask(resource.id, time);
              const task = entry ? taskById.get(entry.taskId) : undefined;
              return (
                <div role="gridcell" className="timeline-grid__cell" key={`${resource.id}-${time}`} aria-label={`시간 ${time} 도구 ${resource.label}`}>
                  {task && <span className="resource-occupancy">{`${task.title} (${task.duration}단위)`}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="timeline-resource-note">도구 줄의 내용은 작업 카드에서 정해진 필요 자원을 보여 줍니다. 학생이 자원을 바꿀 수 없습니다.</p>
    </section>
  );
}
