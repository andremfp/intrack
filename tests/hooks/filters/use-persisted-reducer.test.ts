import { renderHook, act } from "@testing-library/react";
import { usePersistedReducer } from "@/hooks/filters/use-persisted-reducer";

// Minimal reducer: supports SET (updates a field) and RESET (replaces state)
type State = { count: number };
type Action =
  | { type: "SET"; payload: { key: "count"; value: number } }
  | { type: "RESET"; payload: State };

function reducer(state: State, action: Action): State {
  if (action.type === "SET") return { ...state, [action.payload.key]: action.payload.value };
  if (action.type === "RESET") return action.payload;
  return state;
}

const resetAction = (payload: State): Action => ({ type: "RESET", payload });

const defaultState: State = { count: 0 };

/** Creates a simple in-memory storage shim for injection */
function makeStorage(): Pick<Storage, "getItem" | "setItem"> {
  const store: Record<string, string> = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
  };
}

describe("usePersistedReducer", () => {
  it("returns defaultState when storage is empty", () => {
    const storage = makeStorage();
    const { result } = renderHook(() =>
      usePersistedReducer("k", reducer, defaultState, resetAction, storage)
    );
    expect(result.current[0]).toEqual(defaultState);
  });

  it("loads pre-seeded storage value on mount", () => {
    const storage = makeStorage();
    storage.setItem("k", JSON.stringify({ count: 7 }));

    const { result } = renderHook(() =>
      usePersistedReducer("k", reducer, defaultState, resetAction, storage)
    );
    expect(result.current[0].count).toBe(7);
  });

  it("persists updated state to storage after dispatch", () => {
    const storage = makeStorage();
    const { result } = renderHook(() =>
      usePersistedReducer("k", reducer, defaultState, resetAction, storage)
    );

    act(() => {
      result.current[1]({ type: "SET", payload: { key: "count", value: 42 } });
    });

    expect(result.current[0].count).toBe(42);
    expect(JSON.parse(storage.getItem("k") ?? "{}")).toEqual({ count: 42 });
  });

  it("reloads state when key changes, falling back to defaultState when absent", () => {
    const storage = makeStorage();
    storage.setItem("key-a", JSON.stringify({ count: 1 }));

    let key = "key-a";
    const { result, rerender } = renderHook(() =>
      usePersistedReducer(key, reducer, defaultState, resetAction, storage)
    );

    expect(result.current[0].count).toBe(1);

    act(() => {
      key = "key-b"; // no value stored for this key
      rerender();
    });

    expect(result.current[0].count).toBe(0);
  });

  it("falls back to defaultState when storage contains malformed JSON", () => {
    const storage = makeStorage();
    storage.setItem("k", "not-valid-json{{{");

    const { result } = renderHook(() =>
      usePersistedReducer("k", reducer, defaultState, resetAction, storage)
    );

    expect(result.current[0]).toEqual(defaultState);
  });
});
