import { supabase } from "@/supabase";
import type { ApiResponse } from "@/errors";
import type { Tables } from "@/schema";
import { success, failure, AppError, ErrorMessages } from "@/errors";

function isAuthSessionMissingError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const typedError = error as { name?: string; message?: unknown };
  const nameMatch = typedError.name === "AuthSessionMissingError";
  const message =
    typeof typedError.message === "string"
      ? typedError.message
      : String(typedError.message ?? "");
  const messageMatch = message.toLowerCase().includes("auth session missing");

  return nameMatch || messageMatch;
}

export type User = Tables<"users">;

export type UserData = {
  data: User;
  avatar?: string;
};

export async function getCurrentUser(): Promise<ApiResponse<UserData>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) return failure(authError, "getCurrentUser");
  if (!user) {
    return failure(new AppError(ErrorMessages.AUTH_FAILED), "getCurrentUser");
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id);

  if (error) return failure(error, "getCurrentUser");
  if (!data?.[0]) {
    return failure(
      new AppError(ErrorMessages.USER_NOT_FOUND),
      "getCurrentUser"
    );
  }

  return success({
    data: data[0],
    avatar: user.user_metadata.avatar_url,
  });
}

export async function checkUserExists(): Promise<ApiResponse<boolean>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) {
    if (isAuthSessionMissingError(authError)) {
      // Treat missing auth session as an authentication failure with a clear message
      return {
        success: false,
        error: new AppError(ErrorMessages.AUTH_FAILED, authError),
      };
    }
    return failure(authError, "checkUserExists");
  }
  if (!user) {
    return failure(new AppError(ErrorMessages.AUTH_FAILED), "checkUserExists");
  }

  const { data, error } = await supabase
    .from("users")
    .select("user_id")
    .eq("user_id", user.id)
    .limit(1);

  if (error) return failure(error, "checkUserExists");
  return success(!!data?.[0]);
}

export async function upsertUser(): Promise<ApiResponse<UserData>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) return failure(authError, "upsertUser");
  if (!user?.email) {
    return failure(new AppError(ErrorMessages.AUTH_FAILED), "upsertUser");
  }

  const derivedName =
    user.user_metadata?.full_name || user.email.split("@")[0] || "Utilizador";

  // Upsert and return the created/updated user data in one operation
  const { data, error } = await supabase
    .from("users")
    .upsert(
      { user_id: user.id, display_name: derivedName, email: user.email },
      { onConflict: "user_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) return failure(error, "upsertUser");
  if (!data) {
    return failure(
      new AppError("Não foi possível criar o perfil do utilizador."),
      "upsertUser"
    );
  }

  return success({
    data,
  });
}

export async function updateUser({
  userId,
  specialtyId,
  displayName,
}: {
  userId: string;
  specialtyId?: string;
  displayName?: string;
}): Promise<ApiResponse<void>> {
  const updateData: { specialty_id?: string; display_name?: string } = {};

  if (specialtyId !== undefined) updateData.specialty_id = specialtyId;
  if (displayName !== undefined) updateData.display_name = displayName;

  if (Object.keys(updateData).length === 0) {
    return failure(
      new AppError(ErrorMessages.NO_FIELDS_TO_UPDATE),
      "updateUser"
    );
  }

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("user_id", userId);

  if (error) return failure(error, "updateUser");
  return success();
}

export async function checkUserHasEmailAuth(
  email: string
): Promise<ApiResponse<boolean>> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-user-provider`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      return failure(
        new AppError("Erro ao verificar o tipo de conta"),
        "checkUserHasEmailAuth"
      );
    }

    const data = await response.json();
    return success(data.hasEmailAuth === true);
  } catch (err) {
    return failure(err, "checkUserHasEmailAuth");
  }
}

export async function deleteUserAccount(): Promise<ApiResponse<void>> {
  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) return failure(authError, "deleteUserAccount");
    if (!user) {
      return failure(
        new AppError(ErrorMessages.AUTH_FAILED),
        "deleteUserAccount"
      );
    }

    // Step 1: Delete from public.users table
    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("user_id", user.id);

    if (userError) {
      return failure(userError, "deleteUserAccount");
    }

    // Step 2: Delete from auth.users using RPC function
    // This will CASCADE delete consultations automatically
    const { error: rpcError } = await supabase.rpc("delete_user");

    // Step 3: Clear session locally (user is deleted, API signOut would fail)
    await supabase.auth.signOut({ scope: "local" });

    // Log RPC error but don't fail (user is deleted and session cleared)
    if (rpcError) {
      return failure(rpcError, "deleteUserAccount");
    }

    return success();
  } catch (err) {
    return failure(err, "deleteUserAccount");
  }
}
