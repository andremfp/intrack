import { supabase } from "@/lib/supabase";
import type { ApiResponse } from "@/lib/errors";
import type { Tables } from "@/schema";
import { success, failure, AppError, ErrorMessages } from "@/lib/errors";

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
  if (authError) return failure(authError, "checkUserExists");
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

export async function upsertUser(): Promise<ApiResponse<void>> {
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

  const { error } = await supabase
    .from("users")
    .upsert(
      { user_id: user.id, display_name: derivedName, email: user.email },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

  if (error) return failure(error, "upsertUser");
  return success();
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
