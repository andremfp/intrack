import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "@/components/error-boundary";

// Suppress React's console.error for expected thrown errors in tests
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Helper component that throws on demand */
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test error");
  return <div>Child content</div>;
}

describe("ErrorBoundary", () => {
  it("renders children normally when no error is thrown", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders default fallback with 'Algo correu mal' when child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Algo correu mal")).toBeInTheDocument();
  });

  it("renders custom fallback with error and resetError when provided and child throws", async () => {
    function CustomFallback({
      error,
      resetError,
    }: {
      error: Error | null;
      resetError: () => void;
    }) {
      return (
        <div>
          <p>Custom: {error?.message}</p>
          <button onClick={resetError}>Reset</button>
        </div>
      );
    }

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom: Test error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();

    // Clicking resetError clears the error and re-renders children (which will throw again here,
    // but we only assert the fallback renders the reset button correctly).
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
  });
});
