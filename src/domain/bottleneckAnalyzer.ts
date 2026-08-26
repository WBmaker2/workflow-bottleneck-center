import type {
  BottleneckAnalysis,
  BottleneckFinding,
  ScenarioDefinition,
  SimulationResult,
  TaskRun,
  WaitInterval,
  WaitReason,
} from "./types";

const reasonOrder: readonly WaitReason[] = ["dependency", "resource", "role", "solo"];
const findingType = {
  dependency: "dependency-path",
  resource: "resource-wait",
  role: "role-wait",
  solo: "solo-wait",
} as const;

const taskTitle = (scenario: ScenarioDefinition, id: string): string =>
  scenario.tasks.find((task) => task.id === id)?.title ?? id;

const roleLabel = (scenario: ScenarioDefinition, id: string): string =>
  scenario.roles.find((role) => role.id === id)?.label ?? id;

const resourceLabel = (scenario: ScenarioDefinition, id: string): string =>
  scenario.resources.find((resource) => resource.id === id)?.label ?? id;

const particle = (text: string): string => /[aeiou가-힣]$/.test(text) ? "가" : "이";

const compareByScenario = (scenario: ScenarioDefinition) => {
  const order = new Map(scenario.tasks.map((task, index) => [task.id, index]));
  return (left: string, right: string): number =>
    (order.get(left) ?? Number.POSITIVE_INFINITY) - (order.get(right) ?? Number.POSITIVE_INFINITY) || left.localeCompare(right);
};

const waitDuration = (wait: WaitInterval): number => Math.max(0, wait.to - wait.from);

const blockerForWait = (
  wait: WaitInterval,
  start: number,
  runsById: ReadonlyMap<string, TaskRun>,
  runs: readonly TaskRun[],
  scenario: ScenarioDefinition,
): TaskRun | undefined => {
  if (wait.blockerTaskId) {
    const blocker = runsById.get(wait.blockerTaskId);
    return blocker?.end === start ? blocker : undefined;
  }
  if (wait.reason === "role" && wait.roleId) {
    return runs
      .filter((run) => run.end === start && run.roleIds.includes(wait.roleId!))
      .sort((left, right) => compareByScenario(scenario)(left.taskId, right.taskId))[0];
  }
  if (wait.reason === "solo") {
    return runs
      .filter((run) => run.end === start && run.taskId !== wait.taskId)
      .sort((left, right) => compareByScenario(scenario)(left.taskId, right.taskId))[0];
  }
  return undefined;
};

const waitPriority = (wait: WaitInterval): number => reasonOrder.indexOf(wait.reason);

const explanation = (
  scenario: ScenarioDefinition,
  wait: WaitInterval,
  blockedTaskId: string,
  delayUnits: number,
  affectedTaskIds: readonly string[],
): string => {
  const blocked = taskTitle(scenario, blockedTaskId);
  const affected = affectedTaskIds.length > 0
    ? ` 이후 ${affectedTaskIds.map((id) => taskTitle(scenario, id)).join(", ")}도 함께 늦어졌습니다.`
    : ".";
  if (wait.reason === "resource" && wait.resourceId) {
    const resource = resourceLabel(scenario, wait.resourceId);
    return `${resource} 사용을 기다려 ${blocked}${particle(blocked)} ${delayUnits}단위 늦어졌습니다${affected}`;
  }
  if (wait.reason === "role" && wait.roleId) {
    const role = roleLabel(scenario, wait.roleId);
    return `${role}이(가) 맡은 작업을 기다려 ${blocked}${particle(blocked)} ${delayUnits}단위 늦어졌습니다${affected}`;
  }
  if (wait.reason === "dependency" && wait.blockerTaskId) {
    const blocker = taskTitle(scenario, wait.blockerTaskId);
    return `${blocker}${particle(blocker)} 끝나기를 기다려 ${blocked}${particle(blocked)} ${delayUnits}단위 늦어졌습니다${affected}`;
  }
  return `다른 작업이 끝나기를 기다려 ${blocked}${particle(blocked)} ${delayUnits}단위 늦어졌습니다${affected}`;
};

const causeKey = (wait: WaitInterval): string => [
  wait.taskId,
  wait.reason,
  wait.blockerTaskId ?? "",
  wait.resourceId ?? "",
  wait.roleId ?? "",
].join("|");

export function analyzeBottlenecks(
  scenario: ScenarioDefinition,
  result: SimulationResult,
): BottleneckAnalysis {
  const compare = compareByScenario(scenario);
  const runs = [...result.runs];
  const runsById = new Map(runs.map((run) => [run.taskId, run]));
  const latest = [...runs].sort((left, right) => right.end - left.end || compare(left.taskId, right.taskId))[0];
  if (!latest) return { criticalTaskIds: [], findings: [], totalWaitUnits: 0 };

  const criticalReverse: string[] = [];
  const causalWaitsByTask = new Map<string, readonly WaitInterval[]>();
  const seen = new Set<string>();
  let current: TaskRun | undefined = latest;
  while (current && !seen.has(current.taskId)) {
    seen.add(current.taskId);
    criticalReverse.push(current.taskId);
    const waits = result.waits
      .filter((wait) => wait.taskId === current!.taskId && wait.to === current!.actualStart && waitDuration(wait) > 0)
      .sort((left, right) => waitPriority(left) - waitPriority(right) || left.from - right.from);
    const causal = waits.filter((wait) => blockerForWait(wait, current!.actualStart, runsById, runs, scenario));
    causalWaitsByTask.set(current.taskId, Object.freeze(causal));
    const nextWait = causal[0];
    current = nextWait ? blockerForWait(nextWait, current.actualStart, runsById, runs, scenario) : undefined;
  }
  const criticalTaskIds = criticalReverse.reverse();
  const criticalSet = new Set(criticalTaskIds);
  const findings: BottleneckFinding[] = [];
  const grouped = new Map<string, { wait: WaitInterval; delayUnits: number }>();
  for (const taskId of criticalTaskIds) {
    for (const wait of causalWaitsByTask.get(taskId) ?? []) {
      const key = causeKey(wait);
      const previous = grouped.get(key);
      if (previous) previous.delayUnits += waitDuration(wait);
      else grouped.set(key, { wait, delayUnits: waitDuration(wait) });
    }
  }
  for (const { wait, delayUnits } of grouped.values()) {
    const blockedIndex = criticalTaskIds.indexOf(wait.taskId);
    if (blockedIndex < 0 || !criticalSet.has(wait.taskId)) continue;
    const affectedTaskIds = criticalTaskIds.slice(blockedIndex + 1);
    const finding: BottleneckFinding = {
      id: `bottleneck-${findings.length + 1}`,
      type: findingType[wait.reason],
      blockedTaskId: wait.taskId,
      blockerLabel: wait.reason === "resource" && wait.resourceId
        ? resourceLabel(scenario, wait.resourceId)
        : wait.reason === "role" && wait.roleId
          ? roleLabel(scenario, wait.roleId)
          : wait.blockerTaskId ? taskTitle(scenario, wait.blockerTaskId) : "다른 작업",
      delayUnits,
      affectedTaskIds,
      explanation: explanation(scenario, wait, wait.taskId, delayUnits, affectedTaskIds),
    };
    findings.push(finding);
  }
  return {
    criticalTaskIds: Object.freeze(criticalTaskIds),
    findings: Object.freeze(findings),
    totalWaitUnits: findings.reduce((sum, finding) => sum + finding.delayUnits, 0),
  };
}
