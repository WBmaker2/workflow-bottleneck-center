import type { ScenarioDefinition, TaskDefinition } from "../domain/types";

const fixtureTask = (task: Partial<TaskDefinition> & Pick<TaskDefinition, "id" | "title">): TaskDefinition => ({
  duration: 1,
  prerequisites: [],
  peopleRequired: 1,
  resources: [],
  parallel: "allowed",
  conditions: [{ id: `${task.id}:quality`, kind: "quality", label: "확인합니다" }],
  evidenceKinds: ["quality"],
  unlocks: [],
  ...task,
});

export function makeScenario(overrides: Partial<ScenarioDefinition> = {}): ScenarioDefinition {
  const tasks: TaskDefinition[] = [
    fixtureTask({ id: "task-1", title: "첫 번째 작업", unlocks: ["task-2"] }),
    fixtureTask({
      id: "task-2",
      title: "두 번째 작업",
      prerequisites: [{ taskId: "task-1", kind: "workflow", reason: "앞 작업을 확인합니다" }],
      unlocks: ["task-3"],
    }),
    fixtureTask({
      id: "task-3",
      title: "세 번째 작업",
      prerequisites: [{ taskId: "task-2", kind: "workflow", reason: "앞 작업을 확인합니다" }],
      resources: [{ resourceId: "printer", quantity: 1 }],
      unlocks: ["task-4"],
    }),
    fixtureTask({
      id: "task-4",
      title: "네 번째 작업",
      prerequisites: [{ taskId: "task-3", kind: "quality", reason: "앞 작업을 확인합니다" }],
      unlocks: ["task-5"],
    }),
    fixtureTask({
      id: "task-5",
      title: "다섯 번째 작업",
      prerequisites: [{ taskId: "task-4", kind: "quality", reason: "앞 작업을 확인합니다" }],
    }),
  ];
  return {
    id: "science-display",
    title: "테스트 시나리오",
    mission: "테스트 시나리오를 완성합니다.",
    timeGoal: 10,
    roles: [
      { id: "A", label: "역할 A" },
      { id: "B", label: "역할 B" },
      { id: "C", label: "역할 C" },
    ],
    resources: [{ id: "printer", label: "프린터", capacity: 1 }],
    fairness: { minParticipatingRoles: 2, maxLoadGap: 4 },
    tasks,
    disclaimer: "모든 시간은 교육용 가상 단위이며 실제 작업 수행 시간을 예측하지 않습니다.",
    teacherFocus: "공개된 근거를 바탕으로 순서를 설명합니다.",
    ...overrides,
  };
}
