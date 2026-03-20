import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AppError } from "@/errors";
import type { ConsultationsFilters } from "@/lib/api/consultations";

// ---------------------------------------------------------------------------
// Hoisted mocks — must be defined before vi.mock() calls
// ---------------------------------------------------------------------------
const { mockApiError } = vi.hoisted(() => ({
  mockApiError: vi.fn(),
}));

vi.mock("@/utils/toasts", () => ({
  toasts: { apiError: mockApiError },
}));

// ---------------------------------------------------------------------------
// Import subject under test AFTER mocks are established
// ---------------------------------------------------------------------------
import { useDataFetching } from "@/hooks/filters/use-data-fetching";

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------
const baseFilters: ConsultationsFilters = {
  year: undefined,
  location: undefined,
  internship: undefined,
  processNumber: undefined,
  sex: undefined,
  autonomy: undefined,
  ageMin: undefined,
  ageMax: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  type: undefined,
  presential: undefined,
  smoker: undefined,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useDataFetching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initial state: isLoading=true, data=null, error=null before fetch resolves", async () => {
    // Use a deferred promise so we can inspect pre-resolve state
    let resolveDeferred!: (value: unknown) => void;
    const deferred = new Promise((res) => {
      resolveDeferred = res;
    });
    const fetchFunction = vi.fn().mockReturnValue(deferred);

    const { result } = renderHook(() =>
      useDataFetching({
        filters: baseFilters,
        fetchFunction,
        loadDependencies: [],
      }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Resolve deferred to avoid dangling promise warning
    await act(async () => {
      resolveDeferred({ success: true, data: [] });
      await deferred;
    });
  });

  it("successful fetch on mount: isLoading becomes false, data is set, error remains null", async () => {
    const mockData = [{ id: "1" }];
    const fetchFunction = vi
      .fn()
      .mockResolvedValue({ success: true, data: mockData });

    const { result } = renderHook(() =>
      useDataFetching({
        filters: baseFilters,
        fetchFunction,
        loadDependencies: [],
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("failed fetch on initial load: isLoading becomes false, error is set, data remains null", async () => {
    const mockError = new AppError("Falha ao carregar");
    const fetchFunction = vi
      .fn()
      .mockResolvedValue({ success: false, error: mockError });

    const { result } = renderHook(() =>
      useDataFetching({
        filters: baseFilters,
        fetchFunction,
        loadDependencies: [],
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBeNull();
    expect(mockApiError).not.toHaveBeenCalled();
  });

  it("failed fetch after initial load: error state NOT updated, cached data stays, toasts.apiError is called", async () => {
    const mockData = [{ id: "1" }];
    const backgroundError = new AppError("Erro em background");
    const fetchFunction = vi
      .fn()
      .mockResolvedValueOnce({ success: true, data: mockData })
      .mockResolvedValueOnce({ success: false, error: backgroundError });

    const { result } = renderHook(() =>
      useDataFetching({
        filters: baseFilters,
        fetchFunction,
        loadDependencies: [],
      }),
    );

    // Wait for initial load to succeed
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(mockData);

    // Trigger background refresh which will fail
    await act(async () => {
      await result.current.loadData();
    });

    // Cached data should remain, error state should NOT be set
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockApiError).toHaveBeenCalledWith(
      backgroundError,
      "Erro ao carregar dados",
    );
  });

  it("loadData with filtersOverride: fetchFunction called with merged filters (override takes precedence)", async () => {
    const filtersWithYear: ConsultationsFilters = { ...baseFilters, year: 2024 };
    const fetchFunction = vi
      .fn()
      .mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() =>
      useDataFetching({
        filters: filtersWithYear,
        fetchFunction,
        loadDependencies: [],
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Call loadData with an override that changes the year
    await act(async () => {
      await result.current.loadData({ year: 2025 });
    });

    expect(fetchFunction).toHaveBeenLastCalledWith({
      ...filtersWithYear,
      year: 2025,
    });
  });

  it("retryLoadData calls loadData again, allowing re-fetch after failure", async () => {
    const mockError = new AppError("Erro inicial");
    const mockData = [{ id: "1" }];
    const fetchFunction = vi
      .fn()
      .mockResolvedValueOnce({ success: false, error: mockError })
      .mockResolvedValueOnce({ success: true, data: mockData });

    const { result } = renderHook(() =>
      useDataFetching({
        filters: baseFilters,
        fetchFunction,
        loadDependencies: [],
      }),
    );

    // Initial load fails
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe(mockError);
    expect(fetchFunction).toHaveBeenCalledTimes(1);

    // Retry: hasLoadedRef is still false (load never succeeded), so this is
    // treated as initial — isLoading goes back to true, then resolves
    await act(async () => {
      await result.current.retryLoadData();
    });

    expect(fetchFunction).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("re-runs on loadDependencies change: hasLoadedRef is reset, next fetch treated as initial", async () => {
    const fetchFunction = vi
      .fn()
      .mockResolvedValue({ success: true, data: [] });

    let userId = "user1";
    const { rerender } = renderHook(() =>
      useDataFetching({
        filters: baseFilters,
        fetchFunction,
        loadDependencies: [userId],
      }),
    );

    await waitFor(() => expect(fetchFunction).toHaveBeenCalledTimes(1));

    // Simulate dependency change by updating the captured variable and rerendering
    userId = "user2";
    rerender();

    await waitFor(() => expect(fetchFunction).toHaveBeenCalledTimes(2));
  });

  it("does not set isLoading=true on non-initial fetches (background refresh stays transparent)", async () => {
    const mockData = [{ id: "1" }];
    const fetchFunction = vi
      .fn()
      .mockResolvedValue({ success: true, data: mockData });

    const { result } = renderHook(() =>
      useDataFetching({
        filters: baseFilters,
        fetchFunction,
        loadDependencies: [],
      }),
    );

    // Wait for initial load to complete (hasLoadedRef becomes true)
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Trigger a non-initial loadData call and verify isLoading stays false
    await act(async () => {
      await result.current.loadData();
    });

    expect(result.current.isLoading).toBe(false);
  });
});
