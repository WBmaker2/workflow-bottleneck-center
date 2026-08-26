import { useMemo, type RefObject } from "react";
import type { DependencyEdge, RelationValidation, ScenarioDefinition, ConditionKind } from "../../domain/types";
import { requiredEdgesFromScenario } from "../../domain/scenarioValidation";

export interface RelationBoardProps {
  scenario: ScenarioDefinition;
  edges: readonly DependencyEdge[];
  validation: RelationValidation;
  listHeadingRef?: RefObject<HTMLHeadingElement | null>;
  onRemove?: (edge: DependencyEdge) => void;
}

type EdgeKind = ConditionKind;

const edgeKey = (edge: DependencyEdge) => `${edge.beforeTaskId}->${edge.afterTaskId}`;

const taskTitle = (scenario: ScenarioDefinition, taskId: string) =>
  scenario.tasks.find((task) => task.id === taskId)?.title ?? taskId;

const hasFinalConsonant = (value: string) => {
  const last = value.trim().charCodeAt(value.trim().length - 1);
  return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
};

const withAndParticle = (value: string) => `${value}${hasFinalConsonant(value) ? "과" : "와"}`;

const edgeKind = (scenario: ScenarioDefinition, edge: DependencyEdge): EdgeKind =>
  scenario.tasks.find((task) => task.id === edge.afterTaskId)?.prerequisites.find((item) => item.taskId === edge.beforeTaskId)?.kind ?? "workflow";

const reasonFor = (scenario: ScenarioDefinition, edge: DependencyEdge): string => {
  const requirement = scenario.tasks.find((task) => task.id === edge.afterTaskId)?.prerequisites.find((item) => item.taskId === edge.beforeTaskId);
  return requirement?.reason ?? "학생이 추가한 관계입니다. 이 관계는 안전하지만 기다림이 늘어날 수 있습니다.";
};

const edgeLabel = (kind: EdgeKind) => kind === "safety" ? "안전 먼저" : kind === "quality" ? "품질 먼저" : "먼저";
const patternClass = (kind: EdgeKind) => kind === "safety" ? "dashed" : kind === "quality" ? "double" : "solid";

const getDepths = (scenario: ScenarioDefinition, allEdges: readonly DependencyEdge[]) => {
  const ids = scenario.tasks.map((task) => task.id);
  const taskSet = new Set(ids);
  const unique = new Set<string>();
  const incoming = new Map(ids.map((id) => [id, [] as string[]]));
  for (const edge of allEdges) {
    if (!taskSet.has(edge.beforeTaskId) || !taskSet.has(edge.afterTaskId) || edge.beforeTaskId === edge.afterTaskId || unique.has(edgeKey(edge))) continue;
    unique.add(edgeKey(edge));
    incoming.get(edge.afterTaskId)!.push(edge.beforeTaskId);
  }
  const depths = new Map(ids.map((id) => [id, 0]));
  const remaining = new Set(ids);
  for (let pass = 0; pass < ids.length && remaining.size > 0; pass += 1) {
    let progressed = false;
    for (const id of ids) {
      if (!remaining.has(id)) continue;
      const prerequisites = incoming.get(id)!;
      if (prerequisites.every((before) => !remaining.has(before))) {
        depths.set(id, prerequisites.length ? Math.max(...prerequisites.map((before) => depths.get(before) ?? 0)) + 1 : 0);
        remaining.delete(id);
        progressed = true;
      }
    }
    if (!progressed) for (const id of remaining) depths.set(id, 0);
    if (!progressed) break;
  }
  return depths;
};

export function RelationBoard({ scenario, edges, validation, listHeadingRef, onRemove }: RelationBoardProps) {
  const required = useMemo(() => requiredEdgesFromScenario(scenario), [scenario]);
  const missingKeys = new Set(validation.missingRequired.map(edgeKey));
  const allVisualEdges = [...edges, ...validation.missingRequired];
  const depths = getDepths(scenario, [...required, ...edges]);
  const columns = new Map<number, typeof scenario.tasks>();
  for (const task of scenario.tasks) {
    const depth = depths.get(task.id) ?? 0;
    columns.set(depth, [...(columns.get(depth) ?? []), task]);
  }
  const nodePositions = new Map<string, { x: number; y: number }>();
  [...columns.entries()].sort(([left], [right]) => left - right).forEach(([depth, tasks]) => {
    tasks.forEach((task, index) => nodePositions.set(task.id, { x: 130 + depth * 180, y: 55 + index * 75 }));
  });

  return (
    <section className="relation-board" aria-labelledby="relation-list-title">
      <h3 id="relation-list-title" ref={listHeadingRef} tabIndex={-1}>연결한 관계 {edges.length}개</h3>
      <p>아래 순서 목록이 관계의 정확한 설명입니다. 선과 색은 이해를 돕는 보조 표시입니다.</p>
      <ol className="relation-list">
        {edges.map((edge, index) => {
          const before = taskTitle(scenario, edge.beforeTaskId);
          const after = taskTitle(scenario, edge.afterTaskId);
          const sentence = `${before} 다음에 ${after}: ${reasonFor(scenario, edge)}`;
          return (
            <li key={`${edgeKey(edge)}-${index}`} aria-label={sentence}>
              <span>{sentence}</span>
              <button type="button" onClick={() => onRemove?.(edge)} aria-label={`${withAndParticle(before)} ${after} 관계 삭제`}>삭제</button>
            </li>
          );
        })}
      </ol>
      <svg className="relation-graph" viewBox="0 0 1020 540" role="img" aria-label="관계 연결 보조 그림" aria-hidden="true">
        <defs>
          <marker id={`relation-arrow-${scenario.id}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
          </marker>
        </defs>
        {allVisualEdges.map((edge) => {
          const before = nodePositions.get(edge.beforeTaskId);
          const after = nodePositions.get(edge.afterTaskId);
          if (!before || !after) return null;
          const kind = edgeKind(scenario, edge);
          const missing = missingKeys.has(edgeKey(edge));
          const pattern = patternClass(kind);
          const path = `M ${before.x + 55} ${before.y} C ${before.x + 95} ${before.y}, ${after.x - 95} ${after.y}, ${after.x - 55} ${after.y}`;
          const classes = `relation-edge relation-edge--${kind} relation-edge--${pattern}${missing ? " relation-edge--missing relation-edge--outlined" : ""}`;
          return <g key={`${edgeKey(edge)}-${missing ? "missing" : "present"}`}>
            <path d={path} className={classes} fill="none" stroke="currentColor" strokeWidth={missing ? 2 : undefined} strokeDasharray={missing ? "6 4" : kind === "safety" ? "8 5" : undefined} markerEnd={`url(#relation-arrow-${scenario.id})`} />
            {kind === "quality" && <path d={path} className={classes} fill="none" stroke="currentColor" strokeWidth="2" transform="translate(0 4)" />}
          </g>;
        })}
        {scenario.tasks.map((task) => {
          const position = nodePositions.get(task.id)!;
          return <g key={task.id} className="relation-node"><rect x={position.x} y={position.y - 22} width="110" height="44" rx="12" /><text x={position.x + 55} y={position.y + 4} textAnchor="middle">{task.title}</text></g>;
        })}
        {allVisualEdges.map((edge) => {
          const before = nodePositions.get(edge.beforeTaskId);
          const after = nodePositions.get(edge.afterTaskId);
          if (!before || !after) return null;
          const kind = edgeKind(scenario, edge);
          return <text key={`${edgeKey(edge)}-label`} className={`relation-edge-label relation-edge-label--${kind}`} x={(before.x + after.x) / 2} y={(before.y + after.y) / 2 - 5} textAnchor="middle">{edgeLabel(kind)}</text>;
        })}
      </svg>
    </section>
  );
}
