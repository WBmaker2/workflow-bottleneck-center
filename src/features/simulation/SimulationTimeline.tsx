import type { AttemptSnapshot } from "../../app/appTypes";
import type { ScenarioDefinition } from "../../domain/types";

export interface SimulationTimelineProps {
  scenario: ScenarioDefinition;
  snapshot: AttemptSnapshot;
  currentTime: number;
  reducedMotion: boolean;
}

export function SimulationTimeline({ scenario, snapshot, currentTime, reducedMotion }: SimulationTimelineProps) {
  const title = reducedMotion ? `가상 시간 ${currentTime}단위 정지 화면` : `가상 시간 ${currentTime}단위`;
  const taskTitle = new Map(scenario.tasks.map((task) => [task.id, task.title]));
  const runs = snapshot.result.runs;
  const stateFor = (taskId: string): string => {
    const run = runs.find((item) => item.taskId === taskId);
    if (!run || currentTime < run.actualStart) return "아직 시작 전";
    if (currentTime >= run.end) return "완료";
    return "진행 중";
  };
  const activeWaits = snapshot.result.waits.filter(({ from, to }) => currentTime >= from && currentTime < to);

  return (
    <section className="simulation-timeline" aria-labelledby="simulation-time-title">
      <h3 id="simulation-time-title">{title}</h3>
      <ol aria-label="작업 진행 상태">
        {scenario.tasks.map((task) => <li key={task.id}><strong>{task.title}</strong> <span>{stateFor(task.id)}</span></li>)}
      </ol>
      {activeWaits.length > 0 && (
        <aside className="simulation-wait" aria-label="기다림 구간">
          {activeWaits.map((wait) => <p key={`${wait.taskId}-${wait.from}-${wait.to}`}>
            {taskTitle.get(wait.taskId) ?? wait.taskId}: 가상 시간 {wait.from}~{wait.to}단위 기다림
          </p>)}
        </aside>
      )}
    </section>
  );
}
