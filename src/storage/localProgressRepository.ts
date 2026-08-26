import { decodeProgress, encodeProgress } from "./progressCodec";
import type { AppState } from "../app/appTypes";
import type { ProgressRepository, PersistenceResult } from "./progressRepository";

export const PROGRESS_STORAGE_KEY = "workflow-bottleneck-center:progress:v1";

export function createLocalProgressRepository(storage: Storage): ProgressRepository {
  return {
    hydrate: () => {
      try {
        const raw = storage.getItem(PROGRESS_STORAGE_KEY);
        return raw === null ? null : decodeProgress(raw);
      } catch {
        return null;
      }
    },
    persist: (state: AppState): PersistenceResult => {
      if (!state.saveEnabled) return { ok: true };
      try {
        storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(encodeProgress(state)));
        return { ok: true };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "저장할 수 없습니다." };
      }
    },
    clear: (): PersistenceResult => {
      try {
        storage.removeItem(PROGRESS_STORAGE_KEY);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "저장 내용을 지울 수 없습니다." };
      }
    },
  };
}
