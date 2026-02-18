import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError, ErrorMessages } from "@/errors";
import {
  getCurrentUser,
  checkUserExists,
  upsertUser,
  updateUser,
  checkUserHasEmailAuth,
  deleteUserAccount,
} from "@/lib/api/users";
import type { User } from "@/lib/api/users";

// ---------------------------------------------------------------------------
// Hoisted mocks — created before any module is imported
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    then: vi.fn(), // PromiseLike — lets `await <chain>` resolve via resolveQuery()
  };
  (Object.keys(query) as (keyof typeof query)[])
    .filter((k) => k !== "then")
    .forEach((k) => {
      (query[k] as ReturnType<typeof vi.fn>).mockReturnValue(query);
    });

  const from = vi.fn(() => query);
  const rpc = vi.fn();     // direct async: supabase.rpc("delete_user")
  const getUser = vi.fn(); // direct async: supabase.auth.getUser()
  const signOut = vi.fn(); // direct async: supabase.auth.signOut(...)

  return { query, from, rpc, getUser, signOut };
});

vi.mock("@/supabase", () => ({
  supabase: {
    from: hoisted.from,
    rpc: hoisted.rpc,
    auth: {
      getUser: hoisted.getUser,
      signOut: hoisted.signOut,
    },
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Queue one resolution for the next awaited Supabase chain call. */
function resolveQuery(data: unknown, error: unknown = null): void {
  (hoisted.query.then as ReturnType<typeof vi.fn>).mockImplementationOnce(
    (resolve: (v: unknown) => void) => resolve({ data, error })
  );
}

const DB_ERROR = { message: "DB error", code: "500", details: null, hint: null };

const mockAuthUser = {
  id: "auth-u1",
  email: "test@example.com",
  user_metadata: {
    avatar_url: "https://avatar.com/pic.jpg",
    full_name: "Test User",
  },
};

// Partial fixture — double-cast because schema type requires all columns
const mockDbUser = {
  id: "db-u1",
  user_id: "auth-u1",
  email: "test@example.com",
  display_name: "Test User",
} as unknown as User;

// ---------------------------------------------------------------------------
// Global reset between tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  hoisted.from.mockClear();
  (Object.keys(hoisted.query) as (keyof typeof hoisted.query)[])
    .filter((k) => k !== "then")
    .forEach((k) => {
      (hoisted.query[k] as ReturnType<typeof vi.fn>).mockClear();
    });
  // mockReset clears queued mockImplementationOnce calls, preventing bleed
  hoisted.query.then.mockReset();
  hoisted.getUser.mockReset();
  hoisted.signOut.mockReset();
  hoisted.rpc.mockReset();
  vi.unstubAllGlobals(); // clean up fetch stubs
});

// ---------------------------------------------------------------------------
// getCurrentUser
// ---------------------------------------------------------------------------
describe("getCurrentUser", () => {
  it("returns failure when auth.getUser returns an error", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: null }, error: DB_ERROR });
    const result = await getCurrentUser();
    expect(result.success).toBe(false);
    expect(hoisted.from).not.toHaveBeenCalled();
  });

  it("returns AUTH_FAILED when no user is returned by auth", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const result = await getCurrentUser();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.userMessage).toBe(ErrorMessages.AUTH_FAILED);
    }
  });

  it("returns failure when DB query fails", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery(null, DB_ERROR);
    const result = await getCurrentUser();
    expect(result.success).toBe(false);
  });

  it("returns USER_NOT_FOUND when DB returns no record", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery([], null); // empty array — data[0] is undefined (falsy)
    const result = await getCurrentUser();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.userMessage).toBe(ErrorMessages.USER_NOT_FOUND);
    }
  });

  it("returns success with user data and avatar from user_metadata", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery([mockDbUser], null);
    const result = await getCurrentUser();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data).toBe(mockDbUser);
      expect(result.data.avatar).toBe(mockAuthUser.user_metadata.avatar_url);
    }
  });
});

// ---------------------------------------------------------------------------
// checkUserExists
// ---------------------------------------------------------------------------
describe("checkUserExists", () => {
  it("returns AUTH_FAILED for AuthSessionMissingError matched by name", async () => {
    const authErr = { name: "AuthSessionMissingError", message: "session gone" };
    hoisted.getUser.mockResolvedValueOnce({ data: { user: null }, error: authErr });
    const result = await checkUserExists();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.userMessage).toBe(ErrorMessages.AUTH_FAILED);
    }
    expect(hoisted.from).not.toHaveBeenCalled();
  });

  it("returns AUTH_FAILED for AuthSessionMissingError matched by message content", async () => {
    const authErr = { name: "OtherError", message: "Auth session missing error occurred" };
    hoisted.getUser.mockResolvedValueOnce({ data: { user: null }, error: authErr });
    const result = await checkUserExists();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.userMessage).toBe(ErrorMessages.AUTH_FAILED);
    }
  });

  it("returns failure for a generic auth error (no special handling)", async () => {
    const authErr = { name: "NetworkError", message: "connection refused" };
    hoisted.getUser.mockResolvedValueOnce({ data: { user: null }, error: authErr });
    const result = await checkUserExists();
    expect(result.success).toBe(false);
    expect(hoisted.from).not.toHaveBeenCalled();
  });

  it("returns AUTH_FAILED when auth returns no user", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const result = await checkUserExists();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe(ErrorMessages.AUTH_FAILED);
    }
  });

  it("returns failure when DB query fails", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery(null, DB_ERROR);
    const result = await checkUserExists();
    expect(result.success).toBe(false);
  });

  it("returns true when a user record is found", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery([{ user_id: "auth-u1" }], null);
    const result = await checkUserExists();
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(true);
  });

  it("returns false when no user record exists", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery([], null);
    const result = await checkUserExists();
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// upsertUser
// ---------------------------------------------------------------------------
describe("upsertUser", () => {
  it("returns failure when auth.getUser returns an error", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: null }, error: DB_ERROR });
    const result = await upsertUser();
    expect(result.success).toBe(false);
    expect(hoisted.from).not.toHaveBeenCalled();
  });

  it("returns AUTH_FAILED when user has no email", async () => {
    const noEmailUser = { ...mockAuthUser, email: null };
    hoisted.getUser.mockResolvedValueOnce({ data: { user: noEmailUser }, error: null });
    const result = await upsertUser();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe(ErrorMessages.AUTH_FAILED);
    }
  });

  it("returns failure when DB upsert fails", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery(null, DB_ERROR);
    const result = await upsertUser();
    expect(result.success).toBe(false);
  });

  it("returns failure when DB returns no data", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery(null, null); // no error but no data either
    const result = await upsertUser();
    expect(result.success).toBe(false);
  });

  it("returns success with user data on successful upsert", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery(mockDbUser, null); // single() resolves to the record directly
    const result = await upsertUser();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data).toBe(mockDbUser);
    }
  });
});

// ---------------------------------------------------------------------------
// updateUser
// ---------------------------------------------------------------------------
describe("updateUser", () => {
  it("returns NO_FIELDS_TO_UPDATE when no optional fields are provided", async () => {
    const result = await updateUser({ userId: "u1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe(ErrorMessages.NO_FIELDS_TO_UPDATE);
    }
    expect(hoisted.from).not.toHaveBeenCalled();
  });

  it("succeeds with a single field update", async () => {
    resolveQuery(null, null);
    const result = await updateUser({ userId: "u1", specialtyId: "sp1" });
    expect(result.success).toBe(true);
    expect(hoisted.query.update).toHaveBeenCalledWith({ specialty_id: "sp1" });
  });

  it("succeeds with all three optional fields", async () => {
    resolveQuery(null, null);
    const result = await updateUser({
      userId: "u1",
      specialtyId: "sp1",
      specialtyYear: 2,
      displayName: "Dr. Test",
    });
    expect(result.success).toBe(true);
    expect(hoisted.query.update).toHaveBeenCalledWith({
      specialty_id: "sp1",
      specialty_year: 2,
      display_name: "Dr. Test",
    });
  });

  it("returns failure when DB update fails", async () => {
    resolveQuery(null, DB_ERROR);
    const result = await updateUser({ userId: "u1", specialtyId: "sp1" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkUserHasEmailAuth
// ---------------------------------------------------------------------------
describe("checkUserHasEmailAuth", () => {
  it("returns true when response.hasEmailAuth is true", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hasEmailAuth: true }),
    }));
    const result = await checkUserHasEmailAuth("user@example.com");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(true);
  });

  it("returns false when response.hasEmailAuth is false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hasEmailAuth: false }),
    }));
    const result = await checkUserHasEmailAuth("user@example.com");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(false);
  });

  it("returns failure when response.ok is false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false }));
    const result = await checkUserHasEmailAuth("user@example.com");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe("Erro ao verificar o tipo de conta");
    }
  });

  it("returns failure when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("Network failed")));
    const result = await checkUserHasEmailAuth("user@example.com");
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteUserAccount
// ---------------------------------------------------------------------------
describe("deleteUserAccount", () => {
  it("returns failure when auth.getUser returns an error", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: null }, error: DB_ERROR });
    const result = await deleteUserAccount();
    expect(result.success).toBe(false);
    expect(hoisted.from).not.toHaveBeenCalled();
    expect(hoisted.signOut).not.toHaveBeenCalled();
  });

  it("returns AUTH_FAILED when auth returns no user", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const result = await deleteUserAccount();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe(ErrorMessages.AUTH_FAILED);
    }
    expect(hoisted.signOut).not.toHaveBeenCalled();
  });

  it("returns failure when DB delete fails, does not call rpc or signOut", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery(null, DB_ERROR);
    const result = await deleteUserAccount();
    expect(result.success).toBe(false);
    expect(hoisted.rpc).not.toHaveBeenCalled();
    expect(hoisted.signOut).not.toHaveBeenCalled();
  });

  it("calls signOut and returns failure when RPC call fails", async () => {
    // signOut is invoked before the rpcError check — it always runs
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery(null, null); // delete succeeds
    hoisted.rpc.mockResolvedValueOnce({ error: DB_ERROR });
    hoisted.signOut.mockResolvedValueOnce({ error: null });
    const result = await deleteUserAccount();
    expect(result.success).toBe(false);
    expect(hoisted.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("calls signOut with { scope: 'local' } and returns success on full success", async () => {
    hoisted.getUser.mockResolvedValueOnce({ data: { user: mockAuthUser }, error: null });
    resolveQuery(null, null); // delete succeeds
    hoisted.rpc.mockResolvedValueOnce({ error: null });
    hoisted.signOut.mockResolvedValueOnce({ error: null });
    const result = await deleteUserAccount();
    expect(result.success).toBe(true);
    expect(hoisted.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});
