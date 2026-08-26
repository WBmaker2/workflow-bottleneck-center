import { requiredEdgesFromScenario } from "./scenarioValidation";
import type { DependencyEdge, RelationValidation, ScenarioDefinition } from "./types";

export const edgeKey = ({ beforeTaskId, afterTaskId }: DependencyEdge): string =>
  `${beforeTaskId}->${afterTaskId}`;

const freezeEdges = (edges: readonly DependencyEdge[]): readonly DependencyEdge[] =>
  Object.freeze(edges.map((edge) => Object.freeze({ ...edge })));

const compareEdges = (taskIndex: ReadonlyMap<string, number>) =>
  (left: DependencyEdge, right: DependencyEdge): number => {
    const beforeDifference =
      (taskIndex.get(left.beforeTaskId) ?? Number.POSITIVE_INFINITY) -
      (taskIndex.get(right.beforeTaskId) ?? Number.POSITIVE_INFINITY);
    if (beforeDifference !== 0) return beforeDifference;

    const afterDifference =
      (taskIndex.get(left.afterTaskId) ?? Number.POSITIVE_INFINITY) -
      (taskIndex.get(right.afterTaskId) ?? Number.POSITIVE_INFINITY);
    if (afterDifference !== 0) return afterDifference;
    return edgeKey(left).localeCompare(edgeKey(right));
  };

const hasPathBackTo = (
  start: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
  remaining: ReadonlySet<string>,
): boolean => {
  const visited = new Set<string>([start]);
  const pending = [...(adjacency.get(start) ?? [])];
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (current === start) return true;
    if (!remaining.has(current) || visited.has(current)) continue;
    visited.add(current);
    pending.push(...(adjacency.get(current) ?? []));
  }
  return false;
};

const cycleTaskIdsFromKnownEdges = (
  scenario: ScenarioDefinition,
  knownEdges: readonly DependencyEdge[],
): readonly string[] => {
  const taskIds = scenario.tasks.map(({ id }) => id);
  const taskIdSet = new Set(taskIds);
  const adjacency = new Map<string, string[]>(taskIds.map((id) => [id, []]));
  const indegree = new Map(taskIds.map((id) => [id, 0]));
  const graphKeys = new Set<string>();

  for (const edge of knownEdges) {
    if (edge.beforeTaskId === edge.afterTaskId || !taskIdSet.has(edge.beforeTaskId) || !taskIdSet.has(edge.afterTaskId)) {
      continue;
    }
    const key = edgeKey(edge);
    if (graphKeys.has(key)) continue;
    graphKeys.add(key);
    adjacency.get(edge.beforeTaskId)!.push(edge.afterTaskId);
    indegree.set(edge.afterTaskId, indegree.get(edge.afterTaskId)! + 1);
  }

  const queue = taskIds.filter((id) => indegree.get(id) === 0);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor]!;
    for (const next of adjacency.get(current)!) {
      const nextIndegree = indegree.get(next)! - 1;
      indegree.set(next, nextIndegree);
      if (nextIndegree === 0) queue.push(next);
    }
  }

  const remaining = new Set(taskIds.filter((id) => indegree.get(id)! > 0));
  return taskIds.filter((id) => remaining.has(id) && hasPathBackTo(id, adjacency, remaining));
};

export function validateRelationMap(
  scenario: ScenarioDefinition,
  edges: readonly DependencyEdge[],
): RelationValidation {
  const taskIndex = new Map(scenario.tasks.map(({ id }, index) => [id, index]));
  const taskIds = new Set(taskIndex.keys());
  const required = requiredEdgesFromScenario(scenario);
  const requiredKeys = new Set(required.map(edgeKey));
  const seen = new Set<string>();
  const duplicate: DependencyEdge[] = [];
  const unknown: DependencyEdge[] = [];

  for (const edge of edges) {
    const key = edgeKey(edge);
    if (seen.has(key) && !duplicate.some((item) => edgeKey(item) === key)) duplicate.push(edge);
    seen.add(key);
    if (!taskIds.has(edge.beforeTaskId) || !taskIds.has(edge.afterTaskId) || edge.beforeTaskId === edge.afterTaskId) {
      unknown.push(edge);
    }
  }

  const missingRequired = required.filter((edge) => !seen.has(edgeKey(edge)));
  const unnecessary = edges.filter((edge) => {
    const key = edgeKey(edge);
    return taskIds.has(edge.beforeTaskId) && taskIds.has(edge.afterTaskId) && edge.beforeTaskId !== edge.afterTaskId && !requiredKeys.has(key);
  }).filter((edge, index, all) => all.findIndex((item) => edgeKey(item) === edgeKey(edge)) === index);
  const knownEdges = edges.filter(
    (edge) => taskIds.has(edge.beforeTaskId) && taskIds.has(edge.afterTaskId) && edge.beforeTaskId !== edge.afterTaskId,
  );
  const compare = compareEdges(taskIndex);
  const sortedMissing = [...missingRequired].sort(compare);
  const sortedUnnecessary = [...unnecessary].sort(compare);
  const sortedDuplicate = [...duplicate].sort(compare);
  const sortedUnknown = [...unknown].sort(compare);
  const cycleTaskIds = cycleTaskIdsFromKnownEdges(scenario, knownEdges);
  const status = unknown.length || duplicate.length || cycleTaskIds.length || missingRequired.length
    ? "invalid"
    : unnecessary.length
      ? "valid-with-extra"
      : "valid";

  return {
    status,
    missingRequired: freezeEdges(sortedMissing),
    unnecessary: freezeEdges(sortedUnnecessary),
    duplicate: freezeEdges(sortedDuplicate),
    unknown: freezeEdges(sortedUnknown),
    cycleTaskIds: Object.freeze([...cycleTaskIds]),
  };
}
