import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { appReducer, createInitialState } from "./appReducer";
import type { AppAction, AppState } from "./appTypes";
import { rehydrateProgress } from "../storage/progressCodec";
import { createLocalProgressRepository } from "../storage/localProgressRepository";
import { createMemoryProgressRepository } from "../storage/progressRepository";
import type { ProgressRepository } from "../storage/progressRepository";

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<React.Dispatch<AppAction> | null>(null);

export interface AppProviderProps {
  children: React.ReactNode;
  repository?: ProgressRepository;
}

const defaultRepository = (): ProgressRepository => {
  try {
    return typeof window !== "undefined" ? createLocalProgressRepository(window.localStorage) : createMemoryProgressRepository();
  } catch {
    return createMemoryProgressRepository();
  }
};

export function AppProvider({ children, repository: suppliedRepository }: AppProviderProps) {
  const repository = useMemo(() => suppliedRepository ?? defaultRepository(), [suppliedRepository]);
  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    const progress = repository.hydrate();
    return progress ? rehydrateProgress(progress) : createInitialState();
  });
  const previousSaveEnabled = useRef(state.saveEnabled);
  const saveErrorAnnounced = useRef(false);
  const clearErrorAnnounced = useRef(false);

  useEffect(() => {
    if (previousSaveEnabled.current && !state.saveEnabled) {
      const result = repository.clear();
      if (!result.ok && !clearErrorAnnounced.current) {
        clearErrorAnnounced.current = true;
        dispatch({ type: "ANNOUNCE", message: "이 기기의 저장 내용을 지우지 못했지만 현재 활동은 계속할 수 있습니다." });
      }
      saveErrorAnnounced.current = false;
    } else if (state.saveEnabled) {
      clearErrorAnnounced.current = false;
      const result = repository.persist(state);
      if (!result.ok && !saveErrorAnnounced.current) {
        saveErrorAnnounced.current = true;
        dispatch({ type: "ANNOUNCE", message: "이 기기에 저장하지 못했지만 현재 활동은 계속할 수 있습니다." });
      }
    }
    previousSaveEnabled.current = state.saveEnabled;
  }, [repository, state]);

  return <StateContext.Provider value={state}><DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider></StateContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState(): AppState {
  const state = useContext(StateContext);
  if (!state) throw new Error("useAppState must be used inside AppProvider");
  return state;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppDispatch(): React.Dispatch<AppAction> {
  const dispatch = useContext(DispatchContext);
  if (!dispatch) throw new Error("useAppDispatch must be used inside AppProvider");
  return dispatch;
}
