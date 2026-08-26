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

  it("rejects contradictory stage prerequisites and unknown selected findings", () => {
    const progress = encodeProgress({ ...createInitialState(), saveEnabled: true });
    const science = progress.attempts["science-display"];
    expect(decodeProgress(JSON.stringify({ ...progress, attempts: { ...progress.attempts, "science-display": { ...science, stage: "analysis" as const } } }))).toBeNull();
    const edges = requiredEdgesFromScenario(getScenario("science-display"));
    const revision = { ...science, stage: "revision" as const, conditionsAcknowledged: true, relationEdges: edges, draftSchedule: { entries: [], learnerEdges: edges }, prediction: "dependency" as const, selectedFindingId: "missing-finding" };
    expect(decodeProgress(JSON.stringify({ ...progress, attempts: { ...progress.attempts, "science-display": revision } }))).toBeNull();
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
