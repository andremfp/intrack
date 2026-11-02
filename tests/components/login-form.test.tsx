import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Hoisted mocks — must be defined before vi.mock() calls
// ---------------------------------------------------------------------------
const {
  mockSignInWithPassword,
  mockSignInWithOAuth,
  mockNavigate,
  mockUpsertUser,
} = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignInWithOAuth: vi.fn(),
  mockNavigate: vi.fn(),
  mockUpsertUser: vi.fn(),
}));

vi.mock("@/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
  },
}));

vi.mock("@/lib/api/users", () => ({
  upsertUser: mockUpsertUser,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Stand-in widget: clicking it "solves" the challenge with a fixed token.
vi.mock("@marsidev/react-turnstile", async () => {
  const { forwardRef, useImperativeHandle } = await import("react");
  return {
    Turnstile: forwardRef(function TurnstileMock(
      {
        onSuccess,
        onError,
        onUnsupported,
        scriptOptions,
      }: {
        onSuccess: (token: string) => void;
        onError?: () => void;
        onUnsupported?: () => void;
        scriptOptions?: { onError?: () => void };
      },
      ref,
    ) {
      useImperativeHandle(ref, () => ({ reset: vi.fn() }));
      return (
        <>
          <button
            type="button"
            data-testid="turnstile"
            onClick={() => onSuccess("test-captcha-token")}
          >
            captcha
          </button>
          <button type="button" data-testid="turnstile-error" onClick={onError} />
          <button
            type="button"
            data-testid="turnstile-unsupported"
            onClick={onUnsupported}
          />
          <button
            type="button"
            data-testid="turnstile-script-error"
            onClick={scriptOptions?.onError}
          />
        </>
      );
    }),
  };
});

// ---------------------------------------------------------------------------
// Import subject under test AFTER mocks are established
// ---------------------------------------------------------------------------
import { LoginForm } from "@/components/forms/login-form";

const solveCaptcha = () => userEvent.click(screen.getByTestId("turnstile"));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading 'Bem vindo ao InTrack'", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("heading", { name: /Bem vindo ao InTrack/i }),
    ).toBeInTheDocument();
  });

  it("renders input#email and input#password", () => {
    render(<LoginForm />);
    expect(document.querySelector("input#email")).toBeInTheDocument();
    expect(document.querySelector("input#password")).toBeInTheDocument();
  });

  it("renders submit button with accessible name 'Login'", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("renders 'Login com Google' button", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: /Login com Google/i }),
    ).toBeInTheDocument();
  });

  it("clicking eye icon toggles password input type between 'password' and 'text'", async () => {
    render(<LoginForm />);
    const passwordInput = document.querySelector(
      "input#password",
    ) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    // The eye toggle button is the only button with tabIndex=-1
    const eyeButton = document.querySelector(
      "button[tabindex='-1']",
    ) as HTMLButtonElement;
    await userEvent.click(eyeButton);
    expect(passwordInput.type).toBe("text");

    await userEvent.click(eyeButton);
    expect(passwordInput.type).toBe("password");
  });

  it("successful sign-in calls navigate('/dashboard')", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "uid" } },
      error: null,
    });
    mockUpsertUser.mockResolvedValueOnce(undefined);

    render(<LoginForm />);
    await userEvent.type(
      document.querySelector("input#email")!,
      "test@example.com",
    );
    await userEvent.type(document.querySelector("input#password")!, "password");
    await solveCaptcha();
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard"),
    );
  });

  it("failed sign-in renders error message in the document", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {},
      error: new Error("Invalid credentials"),
    });

    render(<LoginForm />);
    await userEvent.type(
      document.querySelector("input#email")!,
      "test@example.com",
    );
    await userEvent.type(document.querySelector("input#password")!, "wrong");
    await solveCaptcha();
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() =>
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument(),
    );
  });

  // Regression: Supabase rejects password sign-in with "no captcha_token found"
  // when the token is not forwarded.
  describe("captcha", () => {
    it("disables the Login button until the captcha is solved", async () => {
      render(<LoginForm />);
      const submit = screen.getByRole("button", { name: "Login" });
      expect(submit).toBeDisabled();

      await solveCaptcha();
      expect(submit).toBeEnabled();
    });

    it("forwards the captcha token to signInWithPassword", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: { id: "uid" } },
        error: null,
      });
      mockUpsertUser.mockResolvedValueOnce(undefined);

      render(<LoginForm />);
      await userEvent.type(
        document.querySelector("input#email")!,
        "test@example.com",
      );
      await userEvent.type(
        document.querySelector("input#password")!,
        "password",
      );
      await solveCaptcha();
      await userEvent.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() =>
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password",
          options: { captchaToken: "test-captcha-token" },
        }),
      );
    });

    it.each([
      ["widget error", "turnstile-error"],
      ["unsupported browser", "turnstile-unsupported"],
      ["blocked script", "turnstile-script-error"],
    ])(
      "shows a captcha message and keeps Login disabled on %s",
      async (_label, testId) => {
        render(<LoginForm />);
        await userEvent.click(screen.getByTestId(testId));

        expect(
          await screen.findByText(/Não foi possível verificar o captcha/i),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Login" })).toBeDisabled();
      },
    );

    it("clears the captcha message once the challenge is solved", async () => {
      render(<LoginForm />);
      await userEvent.click(screen.getByTestId("turnstile-error"));
      await screen.findByText(/Não foi possível verificar o captcha/i);

      await solveCaptcha();
      expect(
        screen.queryByText(/Não foi possível verificar o captcha/i),
      ).not.toBeInTheDocument();
    });

    it("requires a fresh captcha after a failed attempt (tokens are single-use)", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: {},
        error: new Error("Invalid credentials"),
      });

      render(<LoginForm />);
      await userEvent.type(
        document.querySelector("input#email")!,
        "test@example.com",
      );
      await userEvent.type(document.querySelector("input#password")!, "wrong");
      await solveCaptcha();
      await userEvent.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() =>
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument(),
      );
      expect(screen.getByRole("button", { name: "Login" })).toBeDisabled();
    });
  });
});
