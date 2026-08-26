import type { DependencyEdge, ScenarioDefinition } from "./types";

export function requiredEdgesFromScenario(scenario: ScenarioDefinition): readonly DependencyEdge[] {
  return scenario.tasks.flatMap((task) =>
    task.prerequisites.map((dependency) => ({
      beforeTaskId: dependency.taskId,
      afterTaskId: task.id,
    })),
  );
}

export function assertScenarioDefinition(scenario: ScenarioDefinition): void {
  const taskIds = new Set(scenario.tasks.map(({ id }) => id));
  if (taskIds.size !== scenario.tasks.length) throw new Error(`${scenario.id}: duplicate task id`);
  if (scenario.tasks.length < 5 || scenario.tasks.length > 7) {
    throw new Error(`${scenario.id}: task count must be 5..7`);
  }

  const resourceCapacity = new Map(scenario.resources.map(({ id, capacity }) => [id, capacity]));
  const expectedUnlocks = new Map(scenario.tasks.map(({ id }) => [id, [] as string[]]));

  for (const task of scenario.tasks) {
    if (!Number.isInteger(task.duration) || task.duration <= 0) {
      throw new Error(`${task.id}: duration must be a positive integer`);
    }
    if (!task.id.trim() || !task.title.trim()) throw new Error(`${scenario.id}: empty task id or title`);
    for (const dependency of task.prerequisites) {
      if (!taskIds.has(dependency.taskId)) throw new Error(`${task.id}: unknown prerequisite ${dependency.taskId}`);
      if (dependency.taskId === task.id) throw new Error(`${task.id}: self dependency`);
      if (!dependency.reason.trim()) throw new Error(`${task.id}: empty prerequisite reason`);
      expectedUnlocks.get(dependency.taskId)?.push(task.id);
    }
    for (const requirement of task.resources) {
      const capacity = resourceCapacity.get(requirement.resourceId);
      if (capacity === undefined) throw new Error(`${task.id}: unknown resource ${requirement.resourceId}`);
      if (requirement.quantity > capacity) throw new Error(`${task.id}: resource quantity exceeds capacity`);
    }
    for (const condition of task.conditions) {
      if (!condition.id.trim() || !condition.label.trim()) throw new Error(`${task.id}: empty condition`);
    }
  }

  for (const task of scenario.tasks) {
    const actual = [...task.unlocks].sort();
    const expected = [...(expectedUnlocks.get(task.id) ?? [])].sort();
    if (actual.some((id) => !taskIds.has(id))) throw new Error(`${task.id}: unknown unlock target`);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${task.id}: unlock reverse index mismatch`);
    }
  }
}
