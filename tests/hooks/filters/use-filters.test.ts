import { renderHook, act } from "@testing-library/react";
import { useFilters } from "@/hooks/filters/use-filters";
import { defaultConsultationsFilters } from "@/hooks/filters/helpers";

const FILTERS_KEY = "test-filters";

describe("useFilters", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaultFilters on first render when nothing is stored", () => {
    const { result } = renderHook(() =>
      useFilters({ filtersKey: FILTERS_KEY, defaultFilters: defaultConsultationsFilters })
    );
    expect(result.current.filters).toEqual(defaultConsultationsFilters);
  });

  it("setFilter updates the specific field", () => {
    const { result } = renderHook(() =>
      useFilters({ filtersKey: FILTERS_KEY, defaultFilters: defaultConsultationsFilters })
    );

    act(() => {
      result.current.setFilter("year", 2024);
    });

    expect(result.current.filters.year).toBe(2024);
  });

  it("setFilter persists the updated value to localStorage under filtersKey", () => {
    const { result } = renderHook(() =>
      useFilters({ filtersKey: FILTERS_KEY, defaultFilters: defaultConsultationsFilters })
    );

    act(() => {
      result.current.setFilter("year", 2023);
    });

    const stored = JSON.parse(localStorage.getItem(FILTERS_KEY) ?? "{}");
    expect(stored.year).toBe(2023);
  });
});
