import { supabase } from "@/lib/supabase";

export async function upsertUser() {
  console.log("upsertUser: Getting current user...");
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("upsertUser: Auth error:", authError);
    throw authError;
  }

  if (!user || !user.email) {
    console.error("upsertUser: No user or email found to upsert user profile");
    return;
  }

  console.log("upsertUser: User found:", { id: user.id, email: user.email });

  const derivedName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : undefined) ||
    "Utilizador";

  console.log("upsertUser: Upserting user to database...", {
    user_id: user.id,
    display_name: derivedName,
    email: user.email,
  });

  const { error } = await supabase
    .from("users")
    .upsert(
      { user_id: user.id, display_name: derivedName, email: user.email },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

  if (error) {
    console.error("upsertUser: Database error:", error);
    throw error;
  }

  console.log("upsertUser: User upserted successfully");
}

export async function getUser() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id);
  if (error) throw error;
  return { data: data[0], avatar: user.user_metadata.avatar_url };
}

export async function updateUser({
  userId,
  specialtyId,
  displayName,
}: {
  userId: string;
  specialtyId?: string;
  displayName?: string;
}) {
  // Build update object with only provided fields
  const updateData: { specialty_id?: string; display_name?: string } = {};

  if (specialtyId !== undefined) {
    updateData.specialty_id = specialtyId;
  }

  if (displayName !== undefined) {
    updateData.display_name = displayName;
  }

  // Only update if there are fields to update
  if (Object.keys(updateData).length === 0) {
    throw new Error("No fields provided to update");
  }

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("user_id", userId);

  if (error) throw error;
}
