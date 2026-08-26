import {
  assertScenarioDefinition,
  requiredEdgesFromScenario,
} from "../../src/domain/scenarioValidation";
import { scenarioCatalog } from "../../src/data/scenarios";
import { makeScenario } from "../../src/test/fixtures";
import type { ScenarioDefinition } from "../../src/domain/types";

describe("scenario catalog", () => {
  it("contains exactly four missions with five to seven tasks", () => {
    expect(scenarioCatalog.map(({ id }) => id)).toEqual([
      "science-display",
      "library-cart",
      "class-presentation",
      "eco-campaign-booth",
    ]);
    expect(
      scenarioCatalog.every(
        (scenario) => scenario.tasks.length >= 5 && scenario.tasks.length <= 7,
      ),
    ).toBe(true);
  });

  it("publishes every prerequisite, resource, condition, and unlock reference", () => {
    for (const scenario of scenarioCatalog) {
      expect(() => assertScenarioDefinition(scenario)).not.toThrow();
      for (const task of scenario.tasks) {
        expect(task.duration).toBeGreaterThan(0);
        expect(task.conditions.every((condition) => condition.label.trim().length > 0)).toBe(true);
        expect(task.prerequisites.every((item) => item.reason.trim().length > 0)).toBe(true);
      }
    }
  });

  it("uses only role labels and the virtual-time disclaimer", () => {
    const serialized = JSON.stringify(scenarioCatalog);
    expect(serialized).toContain("역할 A");
    expect(serialized).not.toMatch(/학생 이름|성별|생산성 점수|실제 작업 시간을 예측/);
    expect(
      scenarioCatalog.every(
        ({ disclaimer }) =>
          disclaimer === "모든 시간은 교육용 가상 단위이며 실제 작업 수행 시간을 예측하지 않습니다.",
      ),
    ).toBe(true);
  });

  it("keeps the exact mission and resource counts", () => {
    expect(scenarioCatalog.map((scenario) => scenario.tasks.length)).toEqual([6, 7, 6, 7]);
    expect(scenarioCatalog.map((scenario) => scenario.resources.map(({ capacity }) => capacity))).toEqual([
      [1],
      [1],
      [1, 1],
      [1, 1],
    ]);
  });

  it("publishes unlocks as the reverse index of prerequisites", () => {
    for (const scenario of scenarioCatalog) {
      const expected = new Map<string, string[]>();
      for (const task of scenario.tasks) expected.set(task.id, []);
      for (const task of scenario.tasks) {
        for (const prerequisite of task.prerequisites) {
          expected.get(prerequisite.taskId)?.push(task.id);
        }
      }
      for (const task of scenario.tasks) {
        expect([...task.unlocks].sort()).toEqual([...(expected.get(task.id) ?? [])].sort());
      }
      expect(requiredEdgesFromScenario(scenario)).toEqual(
        scenario.tasks.flatMap((task) =>
          task.prerequisites.map((dependency) => ({
            beforeTaskId: dependency.taskId,
            afterTaskId: task.id,
          })),
        ),
      );
    }
  });
});

describe("assertScenarioDefinition", () => {
  const withTask = (taskIndex: number, update: (task: ReturnType<typeof makeScenario>["tasks"][number]) => ReturnType<typeof makeScenario>["tasks"][number]) => {
    const scenario = makeScenario();
    const tasks = scenario.tasks.map((task, index) => (index === taskIndex ? update(task) : task));
    return { ...scenario, tasks };
  };

  it("includes the required descriptive error suffixes", () => {
    const cases: Array<[string, ScenarioDefinition, string]> = [
      ["duplicate task id", (() => {
        const scenario = makeScenario();
        return { ...scenario, tasks: [...scenario.tasks.slice(0, 4), { ...scenario.tasks[0]! }] };
      })(), "duplicate task id"],
      ["task count", { ...makeScenario(), tasks: makeScenario().tasks.slice(0, 4) }, "task count must be 5..7"],
      ["duration", withTask(0, (task) => ({ ...task, duration: 0 })), "duration must be a positive integer"],
      ["non-integer duration", withTask(0, (task) => ({ ...task, duration: 1.5 })), "duration must be a positive integer"],
      ["empty id", withTask(0, (task) => ({ ...task, id: "" })), "empty task id or title"],
      ["empty title", withTask(0, (task) => ({ ...task, title: " " })), "empty task id or title"],
      ["unknown prerequisite", withTask(1, (task) => ({ ...task, prerequisites: [{ taskId: "missing", kind: "workflow", reason: "확인" }] })), "unknown prerequisite missing"],
      ["self dependency", withTask(1, (task) => ({ ...task, prerequisites: [{ taskId: task.id, kind: "workflow", reason: "확인" }] })), "self dependency"],
      ["empty reason", withTask(1, (task) => ({ ...task, prerequisites: [{ ...task.prerequisites[0]!, reason: " " }] })), "empty prerequisite reason"],
      ["unknown resource", withTask(0, (task) => ({ ...task, resources: [{ resourceId: "missing", quantity: 1 }] })), "unknown resource missing"],
      ["over capacity", withTask(0, (task) => ({ ...task, resources: [{ resourceId: "printer", quantity: 2 }] })), "resource quantity exceeds capacity"],
      ["empty condition", withTask(0, (task) => ({ ...task, conditions: [{ id: "x", kind: "quality", label: " " }] })), "empty condition"],
      ["unknown unlock", withTask(0, (task) => ({ ...task, unlocks: [...task.unlocks, "missing"] })), "unknown unlock target"],
      ["reverse mismatch", withTask(0, (task) => ({ ...task, unlocks: [] })), "unlock reverse index mismatch"],
    ];
    for (const [, scenario, suffix] of cases) {
      expect(() => assertScenarioDefinition(scenario)).toThrow(suffix);
    }
  });
});
