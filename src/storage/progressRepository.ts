import type { AppProgressV1, AppState } from "../app/appTypes";
import { encodeProgress } from "./progressCodec";

export type PersistenceResult = { ok: true } | { ok: false; message: string };

export interface ProgressRepository {
  hydrate(): AppProgressV1 | null;
  persist(state: AppState): PersistenceResult;
  clear(): PersistenceResult;
}

export function createMemoryProgressRepository(): ProgressRepository {
  let value: AppProgressV1 | null = null;
  return {
    hydrate: () => value,
    persist: (state) => {
      if (!state.saveEnabled) return { ok: true };
      value = encodeProgress(state);
      return { ok: true };
    },
    clear: () => {
      value = null;
      return { ok: true };
    },
  };
}
