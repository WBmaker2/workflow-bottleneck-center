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
