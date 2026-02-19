import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Hoisted mocks — must be defined before vi.mock() calls
// ---------------------------------------------------------------------------
const { mockSignInWithPassword, mockSignInWithOAuth, mockNavigate, mockUpsertUser } =
  vi.hoisted(() => ({
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

// ---------------------------------------------------------------------------
// Import subject under test AFTER mocks are established
// ---------------------------------------------------------------------------
import { LoginForm } from "@/components/forms/login-form";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading 'Bem vindo ao InTrack'", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("heading", { name: /Bem vindo ao InTrack/i })
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
      screen.getByRole("button", { name: /Login com Google/i })
    ).toBeInTheDocument();
  });

  it("clicking eye icon toggles password input type between 'password' and 'text'", async () => {
    render(<LoginForm />);
    const passwordInput = document.querySelector(
      "input#password"
    ) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    // The eye toggle button is the only button with tabIndex=-1
    const eyeButton = document.querySelector(
      "button[tabindex='-1']"
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
      "test@example.com"
    );
    await userEvent.type(document.querySelector("input#password")!, "password");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard")
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
      "test@example.com"
    );
    await userEvent.type(document.querySelector("input#password")!, "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() =>
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    );
  });
});
