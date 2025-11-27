import { useEffect, useReducer } from "react";
import { loadPersistedState } from "./helpers";

/**
 * Hook that provides reducer state synced with localStorage.
 * Automatically persists state changes and loads from localStorage on mount/key change.
 * The reducer action type must support a "RESET" action with payload of type T.
 */
export function usePersistedReducer<
  T extends Record<string, unknown>,
  A extends { type: string; payload?: unknown }
>(
  key: string,
  reducer: (state: T, action: A) => T,
  defaultState: T,
  resetAction: (payload: T) => A
): [T, React.Dispatch<A>] {
  // Load initial state from localStorage
  const [state, dispatch] = useReducer(
    reducer,
    defaultState,
    (defaultValue) => {
      const loaded = loadPersistedState(key, defaultValue);
      return loaded;
    }
  );

  // Update state when key changes (e.g., tab switch)
  useEffect(() => {
    const loadedState = loadPersistedState(key, defaultState);
    dispatch(resetAction(loadedState));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, defaultState]);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving state to cache for key "${key}":`, error);
    }
  }, [key, state]);

  return [state, dispatch] as const;
}
