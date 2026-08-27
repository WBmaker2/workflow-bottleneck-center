import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { AppProvider, useAppDispatch, useAppState } from "../../src/app/AppProvider";
import { createInitialState } from "../../src/app/appReducer";
import { encodeProgress, decodeProgress, rehydrateProgress } from "../../src/storage/progressCodec";
import { createLocalProgressRepository, PROGRESS_STORAGE_KEY } from "../../src/storage/localProgressRepository";
import { createMemoryProgressRepository } from "../../src/storage/progressRepository";
import { requiredEdgesFromScenario } from "../../src/domain/scenarioValidation";
import { getScenario } from "../../src/data/scenarios";

const noWaitScienceDraft = () => {
  const scenario = getScenario("science-display");
  const starts: Record<string, number> = {
    "verify-content": 0,
    "prepare-print-file": 2,
    "prepare-illustrations": 2,
    "print-text": 4,
    "attach-materials": 6,
    "final-review": 8,
  };
  const roles: Record<string, readonly ("A" | "B" | "C")[]> = {
    "verify-content": ["A"],
    "prepare-print-file": ["B"],
    "prepare-illustrations": ["C"],
    "print-text": ["A"],
    "attach-materials": ["B", "C"],
    "final-review": ["A", "B"],
  };
  return {
    learnerEdges: requiredEdgesFromScenario(scenario),
    entries: scenario.tasks.map((task) => ({ taskId: task.id, plannedStart: starts[task.id]!, roleIds: roles[task.id]! })),
  };
};

const mockStorage = (): Storage => ({
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(() => null),
  get length() { return 0; },
});

describe("versioned local progress", () => {
  it("does not write until saving is explicitly enabled", () => {
    const storage = mockStorage();
    const repository = createLocalProgressRepository(storage);
    repository.persist(createInitialState());
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("stores only the versioned allowlist and role labels", () => {
    const state = { ...createInitialState(), saveEnabled: true, announcement: "비공개 문구", updateDialogOpen: true };
    const encoded = encodeProgress(state);
    expect(encoded.version).toBe(1);
    expect(JSON.stringify(encoded)).not.toMatch(/studentName|learnerName|email|announcement|updateDialogOpen/);
  });

  it("ignores corrupt, wrong-version, and unknown-scenario payloads", () => {
    expect(decodeProgress("not-json")).toBeNull();
    expect(decodeProgress('{"version":2}')).toBeNull();
    expect(decodeProgress('{"version":1,"selectedScenarioId":"unknown"}')).toBeNull();
  });

  it("clears exactly the progress key and never clears unrelated storage", () => {
    const storage = mockStorage();
    createLocalProgressRepository(storage).clear();
    expect(storage.removeItem).toHaveBeenCalledTimes(1);
    expect(storage.removeItem).toHaveBeenCalledWith(PROGRESS_STORAGE_KEY);
    expect(storage.clear).not.toHaveBeenCalled();
  });

  it("rehydrates derived snapshots from saved drafts instead of persisted metrics", () => {
    const state = { ...createInitialState(), saveEnabled: true };
    const encoded = encodeProgress(state);
    const restored = rehydrateProgress(encoded);
    expect(restored.attempts["science-display"]!.initialSnapshot).toBeNull();
    expect(restored.attempts["science-display"]!.revisedSnapshot).toBeNull();
    expect(restored.announcement).toBe("");
  });

  it("keeps memory progress only when saving is enabled", () => {
    const repository = createMemoryProgressRepository();
    expect(repository.hydrate()).toBeNull();
    repository.persist(createInitialState());
    expect(repository.hydrate()).toBeNull();
    const saved = { ...createInitialState(), saveEnabled: true };
    repository.persist(saved);
    expect(repository.hydrate()?.version).toBe(1);
    repository.clear();
    expect(repository.hydrate()).toBeNull();
  });

  it("restores an explicitly saved schedule stage without falling back to briefing", () => {
    const state = createInitialState();
    const progress = encodeProgress({ ...state, saveEnabled: true });
    const science = progress.attempts["science-display"];
    const edges = requiredEdgesFromScenario(getScenario("science-display"));
    const edited = {
      ...progress,
      attempts: { ...progress.attempts, "science-display": { ...science, stage: "schedule" as const, conditionsAcknowledged: true, relationEdges: edges, draftSchedule: { entries: [], learnerEdges: edges } } },
    };
    const restored = rehydrateProgress(edited);
    expect(restored.attempts["science-display"]!.stage).toBe("schedule");
  });

  it("deep-freezes derived snapshots rebuilt during hydration", () => {
    const scenario = getScenario("science-display");
    const edges = requiredEdgesFromScenario(scenario);
    const entries = scenario.tasks.map((task) => ({ taskId: task.id, plannedStart: 0, roleIds: scenario.roles.slice(0, task.peopleRequired).map(({ id }) => id) }));
    const progress = encodeProgress({ ...createInitialState(), saveEnabled: true });
    const science = progress.attempts["science-display"];
    const analysis = { ...science, stage: "analysis" as const, conditionsAcknowledged: true, relationEdges: edges, draftSchedule: { entries, learnerEdges: edges }, prediction: "dependency" as const, predictionExplanation: "앞 작업을 기다립니다." };
    const decoded = decodeProgress(JSON.stringify({ ...progress, attempts: { ...progress.attempts, "science-display": analysis } }));
    expect(decoded).not.toBeNull();
    const restored = rehydrateProgress(decoded!);
    const rebuilt = restored.attempts["science-display"]!.initialSnapshot!;
    expect(Object.isFrozen(rebuilt)).toBe(true);
    expect(Object.isFrozen(rebuilt.result.runs)).toBe(true);
  });

  it("rejects unsafe planned starts at the persisted draft boundary", () => {
    const progress = encodeProgress({ ...createInitialState(), saveEnabled: true });
    const science = progress.attempts["science-display"];
    const unsafe = {
      ...science,
      stage: "schedule" as const,
      conditionsAcknowledged: true,
      draftSchedule: { entries: [{ taskId: "verify-content", plannedStart: Number.MAX_SAFE_INTEGER + 1, roleIds: ["A"] }], learnerEdges: [] },
    };
    expect(decodeProgress(JSON.stringify({ ...progress, attempts: { ...progress.attempts, "science-display": unsafe } }))).toBeNull();
  });

  it("rejects contradictory stage prerequisites and unknown selected findings", () => {
    const progress = encodeProgress({ ...createInitialState(), saveEnabled: true });
    const science = progress.attempts["science-display"];
    expect(decodeProgress(JSON.stringify({ ...progress, attempts: { ...progress.attempts, "science-display": { ...science, stage: "analysis" as const } } }))).toBeNull();
    const edges = requiredEdgesFromScenario(getScenario("science-display"));
    const revision = { ...science, stage: "revision" as const, conditionsAcknowledged: true, relationEdges: edges, draftSchedule: { entries: [], learnerEdges: edges }, prediction: "dependency" as const, selectedFindingId: "missing-finding" };
    expect(decodeProgress(JSON.stringify({ ...progress, attempts: { ...progress.attempts, "science-display": revision } }))).toBeNull();
  });

  it("round-trips no-wait analysis through revision and report with null finding evidence", () => {
    const progress = encodeProgress({ ...createInitialState(), saveEnabled: true });
    const science = progress.attempts["science-display"];
    const draft = noWaitScienceDraft();
    const saved = { ...science, stage: "report" as const, conditionsAcknowledged: true, relationEdges: draft.learnerEdges, draftSchedule: draft, prediction: null, predictionExplanation: "", selectedFindingId: null, revisedSchedule: draft };
    const decoded = decodeProgress(JSON.stringify({ ...progress, attempts: { ...progress.attempts, "science-display": saved } }));
    expect(decoded).not.toBeNull();
    const restored = rehydrateProgress(decoded!);
    const attempt = restored.attempts["science-display"]!;
    expect(attempt.stage).toBe("report");
    expect(attempt.initialSnapshot?.result.waits).toHaveLength(0);
    expect(attempt.initialSnapshot?.bottlenecks.findings).toHaveLength(0);
    expect(attempt.prediction).toBeNull();
    expect(attempt.selectedFindingId).toBeNull();
    expect(attempt.revisedSnapshot).not.toBeNull();
    expect(attempt.comparison).not.toBeNull();
  });

  it("rejects a saved completed report whose revised evaluation misses the time goal", () => {
    const progress = encodeProgress({ ...createInitialState(), saveEnabled: true });
    const science = progress.attempts["science-display"];
    const draft = noWaitScienceDraft();
    const lateDraft = { ...draft, entries: draft.entries.map((entry) => entry.taskId === "final-review" ? { ...entry, plannedStart: 20 } : entry) };
    const saved = { ...science, stage: "report" as const, conditionsAcknowledged: true, relationEdges: draft.learnerEdges, draftSchedule: draft, prediction: null, predictionExplanation: "", selectedFindingId: null, revisedSchedule: lateDraft, completed: true, evidence: { dependencyExplanation: "선행 관계를 충분히 설명한 문장입니다.", parallelExplanation: "병렬 관계를 충분히 설명한 문장입니다.", bottleneckExplanation: "표시된 병목이 없다는 사실을 설명합니다.", tradeoffExplanation: "안전 품질 역할 공정성을 함께 지킨 절충입니다." } };
    expect(decodeProgress(JSON.stringify({ ...progress, attempts: { ...progress.attempts, "science-display": saved } }))).toBeNull();
  });

  it("rejects null prediction when a recomputed schedule has waits", () => {
    const progress = encodeProgress({ ...createInitialState(), saveEnabled: true });
    const science = progress.attempts["science-display"];
    const scenario = getScenario("science-display");
    const draft = { learnerEdges: requiredEdgesFromScenario(scenario), entries: scenario.tasks.map((task) => ({ taskId: task.id, plannedStart: 0, roleIds: scenario.roles.slice(0, task.peopleRequired).map(({ id }) => id) })) };
    const saved = { ...science, stage: "analysis" as const, conditionsAcknowledged: true, relationEdges: draft.learnerEdges, draftSchedule: draft, prediction: null, predictionExplanation: "", selectedFindingId: null };
    expect(decodeProgress(JSON.stringify({ ...progress, attempts: { ...progress.attempts, "science-display": saved } }))).toBeNull();
  });

  it("announces a clear failure once per enable-to-disable transition", async () => {
    const repository = {
      hydrate: vi.fn(() => null),
      persist: vi.fn(() => ({ ok: true as const })),
      clear: vi.fn(() => ({ ok: false as const, message: "잠금" })),
    };
    function Harness() {
      const dispatch = useAppDispatch();
      const state = useAppState();
      return createElement("div", null,
        createElement("button", { onClick: () => dispatch({ type: "SET_SAVE_ENABLED", enabled: true }) }, "enable"),
        createElement("button", { onClick: () => dispatch({ type: "SET_SAVE_ENABLED", enabled: false }) }, "disable"),
        createElement("div", { role: "status" }, state.announcement),
      );
    }
    render(createElement(AppProvider, { repository, children: createElement(Harness) }));
    await act(async () => { screen.getByRole("button", { name: "enable" }).click(); });
    await act(async () => { screen.getByRole("button", { name: "disable" }).click(); });
    expect(repository.clear).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).not.toBeNull();
    expect(screen.getByText("이 기기의 저장 내용을 지우지 못했지만 현재 활동은 계속할 수 있습니다.")).toBeVisible();
    await act(async () => { screen.getByRole("button", { name: "disable" }).click(); });
    expect(repository.clear).toHaveBeenCalledTimes(1);
    await act(async () => { screen.getByRole("button", { name: "enable" }).click(); });
    await act(async () => { screen.getByRole("button", { name: "disable" }).click(); });
    expect(repository.clear).toHaveBeenCalledTimes(2);
  });
});
