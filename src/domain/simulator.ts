import { edgeKey, validateRelationMap } from "./relationValidator";
import { requiredEdgesFromScenario } from "./scenarioValidation";
import { mergeWaitIntervals } from "./waitIntervals";
import type {
  DependencyEdge,
  ScheduleDraft,
  ScheduleEntry,
  ScenarioDefinition,
  SimulationResult,
  TaskDefinition,
  TaskRun,
  WaitInterval,
  WaitReason,
} from "./types";

type Issue = SimulationResult["issues"][number];
interface NormalizedEntry {
  entry: ScheduleEntry;
  task: TaskDefinition;
  order: number;
}

interface ActiveTask {
  entry: NormalizedEntry;
  run: TaskRun;
}

const textCompare = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

const makeIssue = (code: string, message: string, taskId?: string): Issue =>
  taskId === undefined ? { code, message } : { code, taskId, message };

const entryKey = (entry: ScheduleEntry): string =>
  `${entry.taskId}|${entry.plannedStart}|${entry.roleIds.join(",")}`;

const validEdge = (edge: DependencyEdge, taskOrder: ReadonlyMap<string, number>): boolean =>
  edge.beforeTaskId !== edge.afterTaskId && taskOrder.has(edge.beforeTaskId) && taskOrder.has(edge.afterTaskId);

const normalizeEntries = (
  scenario: ScenarioDefinition,
  draft: ScheduleDraft,
  taskOrder: ReadonlyMap<string, number>,
): { entries: readonly NormalizedEntry[]; issues: readonly Issue[]; invalidTaskIds: ReadonlySet<string> } => {
  const taskById = new Map(scenario.tasks.map((task) => [task.id, task]));
  const roleOrder = new Map(scenario.roles.map(({ id }, index) => [id, index]));
  const groups = new Map<string, ScheduleEntry[]>();
  const issues: Issue[] = [];
  const invalidTaskIds = new Set<string>();
  const rawEntries = [...(draft.entries ?? [])];

  for (const entry of rawEntries) {
    const task = taskById.get(entry.taskId);
    if (!task) {
      issues.push(makeIssue("unknown-task", `예약할 수 없는 작업입니다: ${entry.taskId}`, entry.taskId));
      continue;
    }
    const group = groups.get(entry.taskId) ?? [];
    group.push(entry);
    groups.set(entry.taskId, group);
  }

  const compareEntries = (left: ScheduleEntry, right: ScheduleEntry): number => {
    const orderDifference = (taskOrder.get(left.taskId) ?? Number.POSITIVE_INFINITY) - (taskOrder.get(right.taskId) ?? Number.POSITIVE_INFINITY);
    if (orderDifference !== 0) return orderDifference;
    if (left.plannedStart !== right.plannedStart) return left.plannedStart - right.plannedStart;
    const leftRoles = [...left.roleIds].sort((a, b) => (roleOrder.get(a) ?? 99) - (roleOrder.get(b) ?? 99)).join(",");
    const rightRoles = [...right.roleIds].sort((a, b) => (roleOrder.get(a) ?? 99) - (roleOrder.get(b) ?? 99)).join(",");
    return textCompare(leftRoles, rightRoles) || textCompare(entryKey(left), entryKey(right));
  };

  const entries: NormalizedEntry[] = [];
  for (const [taskId, candidates] of groups) {
    const task = taskById.get(taskId)!;
    const sorted = [...candidates].sort(compareEntries);
    if (sorted.length > 1) {
      invalidTaskIds.add(taskId);
      for (const candidate of sorted) issues.push(makeIssue("duplicate-entry", "같은 작업을 두 번 예약할 수 없습니다.", candidate.taskId));
      continue;
    }
    const entry = sorted[0]!;
    let valid = true;
    if (!Number.isInteger(entry.plannedStart) || entry.plannedStart < 0) {
      issues.push(makeIssue("invalid-planned-start", "시작 시점은 0 이상의 정수여야 합니다.", taskId));
      valid = false;
    }
    const roleIds = [...entry.roleIds].sort((a, b) => (roleOrder.get(a) ?? 99) - (roleOrder.get(b) ?? 99));
    if (roleIds.length !== task.peopleRequired) {
      issues.push(makeIssue("invalid-role-count", `이 작업에는 역할 ${task.peopleRequired}명이 필요합니다.`, taskId));
      valid = false;
    }
    if (new Set(roleIds).size !== roleIds.length) {
      issues.push(makeIssue("duplicate-role", "한 작업에 같은 역할을 두 번 배정할 수 없습니다.", taskId));
      valid = false;
    }
    if (roleIds.some((roleId) => !roleOrder.has(roleId))) {
      issues.push(makeIssue("unknown-role", "등록되지 않은 역할입니다.", taskId));
      valid = false;
    }
    const resourceCapacity = new Map(scenario.resources.map(({ id, capacity }) => [id, capacity]));
    if ([...aggregateResources(task)].some(([resourceId, quantity]) => !resourceCapacity.has(resourceId) || quantity > (resourceCapacity.get(resourceId) ?? 0))) {
      issues.push(makeIssue("invalid-resource-requirement", "작업의 자원 요구를 충족할 수 없습니다.", taskId));
      valid = false;
    }
    if (!valid) {
      invalidTaskIds.add(taskId);
      continue;
    }
    entries.push({ entry: { ...entry, roleIds }, task, order: taskOrder.get(taskId)! });
  }
  entries.sort((left, right) => left.order - right.order);
  return { entries, issues, invalidTaskIds };
};

const unionDependencies = (
  scenario: ScenarioDefinition,
  learnerEdges: readonly DependencyEdge[],
  taskOrder: ReadonlyMap<string, number>,
): readonly DependencyEdge[] => {
  const result: DependencyEdge[] = [];
  const seen = new Set<string>();
  for (const edge of [...requiredEdgesFromScenario(scenario), ...learnerEdges]) {
    if (!validEdge(edge, taskOrder) || seen.has(edgeKey(edge))) continue;
    seen.add(edgeKey(edge));
    result.push(edge);
  }
  return result;
};

const compareTaskIds = (taskOrder: ReadonlyMap<string, number>) => (left: string, right: string): number =>
  (taskOrder.get(left) ?? Number.POSITIVE_INFINITY) - (taskOrder.get(right) ?? Number.POSITIVE_INFINITY) || textCompare(left, right);

const wait = (taskId: string, from: number, reason: WaitReason, details: Partial<WaitInterval> = {}): WaitInterval =>
  ({ taskId, from, to: from + 1, reason, ...details });

const aggregateResources = (task: TaskDefinition): ReadonlyMap<string, number> => {
  const quantities = new Map<string, number>();
  for (const requirement of task.resources) {
    quantities.set(requirement.resourceId, (quantities.get(requirement.resourceId) ?? 0) + requirement.quantity);
  }
  return quantities;
};

export function simulateSchedule(scenario: ScenarioDefinition, draft: ScheduleDraft): SimulationResult {
  const taskOrder = new Map(scenario.tasks.map((task, index) => [task.id, index]));
  const normalized = normalizeEntries(scenario, draft, taskOrder);
  const validEntries = new Map(normalized.entries.map((item) => [item.task.id, item]));
  const omittedTaskIds = scenario.tasks.filter((task) => !validEntries.has(task.id)).map((task) => task.id);
  const relation = validateRelationMap(scenario, draft.learnerEdges ?? []);
  const issues: Issue[] = [...normalized.issues];
  for (const edge of [...relation.unknown, ...relation.duplicate]) {
    issues.push(makeIssue("invalid-relation", `유효하지 않은 관계입니다: ${edgeKey(edge)}`));
  }
  const dependencies = unionDependencies(scenario, draft.learnerEdges ?? [], taskOrder);
  const effectiveRelation = validateRelationMap(scenario, dependencies);
  if (effectiveRelation.cycleTaskIds.length > 0) {
    issues.push(makeIssue("cyclic-relation", "순환 관계는 실행할 수 없습니다."));
  }
  const predecessors = new Map<string, string[]>(scenario.tasks.map((task) => [task.id, []]));
  for (const edge of dependencies) predecessors.get(edge.afterTaskId)!.push(edge.beforeTaskId);
  for (const ids of predecessors.values()) ids.sort(compareTaskIds(taskOrder));

  const active = new Map<string, ActiveTask>();
  const completed = new Set<string>();
  const started = new Set<string>();
  const blocked = new Set<string>(normalized.invalidTaskIds);
  const runs: TaskRun[] = [];
  const waits: WaitInterval[] = [];
  const maxPlannedStart = Math.max(0, ...normalized.entries.map(({ entry }) => entry.plannedStart));
  const upperBound = maxPlannedStart + scenario.tasks.reduce((sum, task) => sum + task.duration, 0) + 1;
  const resourceOrder = new Map(scenario.resources.map(({ id }, index) => [id, index]));
  const soloActive = (): boolean => [...active.values()].some(({ entry }) => entry.task.parallel === "solo");
  const hasUnavailablePredecessor = (taskId: string, seen = new Set<string>()): boolean => {
    if (seen.has(taskId) || effectiveRelation.cycleTaskIds.includes(taskId)) return true;
    seen.add(taskId);
    return (predecessors.get(taskId) ?? []).some((predecessor) =>
      !validEntries.has(predecessor) || hasUnavailablePredecessor(predecessor, new Set(seen)));
  };

  const resourceBlocker = (item: NormalizedEntry): { resourceId: string; blockerTaskId: string } | undefined => {
    const requirements = [...aggregateResources(item.task)].sort(([left], [right]) =>
      (resourceOrder.get(left) ?? Number.POSITIVE_INFINITY) - (resourceOrder.get(right) ?? Number.POSITIVE_INFINITY) || textCompare(left, right));
    for (const [resourceId, quantity] of requirements) {
      const capacity = scenario.resources.find(({ id }) => id === resourceId)?.capacity ?? 0;
      const occupants = [...active.values()]
        .filter(({ entry }) => aggregateResources(entry.task).has(resourceId))
        .sort((left, right) => left.entry.order - right.entry.order);
      const occupied = occupants.reduce((sum, occupant) => sum + (aggregateResources(occupant.entry.task).get(resourceId) ?? 0), 0);
      if (occupied + quantity > capacity && occupants[0]) return { resourceId, blockerTaskId: occupants[0].run.taskId };
    }
    return undefined;
  };

  for (let time = 0; time < upperBound; time += 1) {
    for (const [taskId, current] of active) {
      if (current.run.end <= time) {
        active.delete(taskId);
        completed.add(taskId);
      }
    }
    const pending = normalized.entries.filter(({ task }) => !started.has(task.id) && !blocked.has(task.id) && !completed.has(task.id) && validEntries.has(task.id));
    if (pending.length === 0 && active.size === 0) break;
    const due = pending.filter(({ entry }) => entry.plannedStart <= time);
    let startedAtTime = false;
    for (const item of due) {
      const taskId = item.task.id;
      const unmet = (predecessors.get(taskId) ?? []).filter((predecessor) => !completed.has(predecessor));
      if (unmet.length > 0) {
        if (hasUnavailablePredecessor(taskId)) {
          blocked.add(taskId);
        } else {
          waits.push(wait(taskId, time, "dependency", { blockerTaskId: unmet[0]! }));
        }
        continue;
      }
      const resource = resourceBlocker(item);
      if (resource) {
        waits.push(wait(taskId, time, "resource", resource));
        continue;
      }
      const occupiedRole = item.entry.roleIds.find((roleId) =>
        [...active.values()].some(({ entry }) => entry.entry.roleIds.includes(roleId)),
      );
      if (occupiedRole) {
        waits.push(wait(taskId, time, "role", { roleId: occupiedRole }));
        continue;
      }
      if ((item.task.parallel === "solo" && active.size > 0) || (item.task.parallel !== "solo" && soloActive())) {
        waits.push(wait(taskId, time, "solo"));
        continue;
      }
      const run: TaskRun = {
        taskId,
        plannedStart: item.entry.plannedStart,
        actualStart: time,
        end: time + item.task.duration,
        roleIds: item.entry.roleIds,
      };
      active.set(taskId, { entry: item, run });
      started.add(taskId);
      runs.push(run);
      startedAtTime = true;
    }
    if (active.size === 0 && !startedAtTime) {
      const stillDue = normalized.entries.filter(({ task, entry }) => !started.has(task.id) && !blocked.has(task.id) && entry.plannedStart <= time);
      const futurePending = normalized.entries.some(({ task, entry }) => !started.has(task.id) && !blocked.has(task.id) && entry.plannedStart > time);
      if (stillDue.length > 0 && !futurePending && stillDue.every(({ task }) => hasUnavailablePredecessor(task.id))) {
        for (const item of stillDue) blocked.add(item.task.id);
        break;
      }
    }
  }

  const unresolved = normalized.entries.filter(({ task }) => !started.has(task.id) && !blocked.has(task.id));
  for (const item of unresolved) {
    blocked.add(item.task.id);
    issues.push(makeIssue("simulation-bound", "시뮬레이션 상한 안에서 실행되지 않았습니다.", item.task.id));
  }
  const orderedRuns = [...runs].sort((left, right) => compareTaskIds(taskOrder)(left.taskId, right.taskId));
  const mergedWaits = [...mergeWaitIntervals(waits, taskOrder)].sort((left, right) => compareTaskIds(taskOrder)(left.taskId, right.taskId) || left.from - right.from);
  const orderedIssues = issues.sort((left, right) =>
    compareTaskIds(taskOrder)(left.taskId ?? "", right.taskId ?? "") || textCompare(left.code, right.code) || textCompare(left.message, right.message));
  const finishTime = orderedRuns.reduce((latest, run) => Math.max(latest, run.end), 0);
  return {
    runs: Object.freeze(orderedRuns),
    waits: Object.freeze(mergedWaits),
    finishTime,
    omittedTaskIds: Object.freeze(omittedTaskIds),
    blockedTaskIds: Object.freeze(scenario.tasks.map(({ id }) => id).filter((id) => blocked.has(id))),
    issues: Object.freeze(orderedIssues),
  };
}
