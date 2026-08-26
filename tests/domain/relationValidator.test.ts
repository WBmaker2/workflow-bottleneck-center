import { getScenario } from "../../src/data/scenarios";
import { requiredEdgesFromScenario } from "../../src/domain/scenarioValidation";
import { edgeKey, validateRelationMap } from "../../src/domain/relationValidator";

describe("relation validator", () => {
  const scenario = getScenario("science-display");
  const required = requiredEdgesFromScenario(scenario);

  it("accepts the fully published required map", () => {
    expect(validateRelationMap(scenario, required)).toEqual({
      status: "valid",
      missingRequired: [],
      unnecessary: [],
      duplicate: [],
      unknown: [],
      cycleTaskIds: [],
    });
  });

  it("names a missing public edge instead of hiding the rule", () => {
    const withoutPrintBeforeAttach = required.filter(
      (edge) => !(edge.beforeTaskId === "print-text" && edge.afterTaskId === "attach-materials"),
    );
    const result = validateRelationMap(scenario, withoutPrintBeforeAttach);

    expect(result.status).toBe("invalid");
    expect(result.missingRequired).toContainEqual({
      beforeTaskId: "print-text",
      afterTaskId: "attach-materials",
    });
  });

  it("allows an unnecessary safe edge but marks lost parallelism", () => {
    const extra = { beforeTaskId: "prepare-print-file", afterTaskId: "prepare-illustrations" };
    const result = validateRelationMap(scenario, [...required, extra]);

    expect(result.status).toBe("valid-with-extra");
    expect(result.unnecessary).toEqual([extra]);
  });

  it("reports each repeated edge once", () => {
    const repeated = required[0]!;
    const result = validateRelationMap(scenario, [...required, repeated, repeated]);

    expect(result.status).toBe("invalid");
    expect(result.duplicate).toEqual([repeated]);
  });

  it("reports an unknown edge unchanged", () => {
    const unknown = { beforeTaskId: "missing", afterTaskId: "verify-content" };
    const result = validateRelationMap(scenario, [...required, unknown]);

    expect(result.status).toBe("invalid");
    expect(result.unknown).toEqual([unknown]);
  });

  it("returns only cyclic task ids in stable scenario order", () => {
    const cyclic = [
      ...required,
      { beforeTaskId: "prepare-print-file", afterTaskId: "prepare-illustrations" },
      { beforeTaskId: "prepare-illustrations", afterTaskId: "prepare-print-file" },
    ];
    const result = validateRelationMap(scenario, cyclic);

    expect(result.status).toBe("invalid");
    expect(result.cycleTaskIds).toEqual(["prepare-print-file", "prepare-illustrations"]);
  });

  it("uses the published edge key contract", () => {
    expect(edgeKey({ beforeTaskId: "a", afterTaskId: "b" })).toBe("a->b");
  });
});
