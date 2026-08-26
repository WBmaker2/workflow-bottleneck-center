import { describe, expect, it, vi } from "vitest";
import { createInitialState } from "../../src/app/appReducer";
import { encodeProgress, decodeProgress, rehydrateProgress } from "../../src/storage/progressCodec";
import { createLocalProgressRepository, PROGRESS_STORAGE_KEY } from "../../src/storage/localProgressRepository";
import { createMemoryProgressRepository } from "../../src/storage/progressRepository";

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
});
