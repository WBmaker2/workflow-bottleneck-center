import type { ScheduleEntry, ScenarioDefinition } from "./types";

/** Maximum planned start exposed by the learner-facing schedule editor. */
export function scheduleStartUpperBound(scenario: ScenarioDefinition): number {
  return scenario.timeGoal + scenario.tasks.reduce((sum, task) => sum + task.duration, 0);
}

export function isScheduleStart(scenario: ScenarioDefinition, value: unknown): value is number {
  const upperBound = scheduleStartUpperBound(scenario);
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= upperBound;
}

export function isScheduleEntryWithinBound(scenario: ScenarioDefinition, entry: ScheduleEntry): boolean {
  return isScheduleStart(scenario, entry.plannedStart);
}

/** Canonicalize known roles without turning unknown or duplicate roles into valid input. */
export function normalizeScheduleRoleIds(
  scenario: ScenarioDefinition,
  roleIds: readonly ("A" | "B" | "C")[],
): readonly ("A" | "B" | "C")[] {
  const order = new Map(scenario.roles.map((role, index) => [role.id, index]));
  if (roleIds.some((roleId) => !order.has(roleId))) return [...roleIds];
  return [...roleIds].sort((left, right) => (order.get(left) ?? 99) - (order.get(right) ?? 99));
}
