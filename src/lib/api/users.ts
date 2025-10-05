import { supabase } from "@/lib/supabase";

export async function upsertUserProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user || !user.email) {
    console.error("No user or email found to upsert user profile");
    return;
  }

  const derivedName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : undefined) ||
    "Utilizador";

  const { error } = await supabase
    .from("users")
    .upsert(
      { user_id: user.id, display_name: derivedName, email: user.email },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

  if (error) throw error;
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
