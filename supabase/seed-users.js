import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.VITE_LOCAL_SUPABASE_URL,
  process.env.VITE_LOCAL_SUPABASE_SECRET
);

async function seedUsers() {
  try {
    //////////////////////////////////
    // Create test MGF specialty user
    //////////////////////////////////

    // Get MGF specialty ID
    const { data: specialtyData, error: specialtyError } = await supabase
      .from("specialties")
      .select("id")
      .eq("code", "mgf")
      .single();

    if (specialtyError || !specialtyData)
      throw new Error("Failed to get MGF specialty ID. Run seed.sql first.");

    // Create test user via Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: "test@example.com",
        password: "password123",
        email_confirm: true,
        user_metadata: { display_name: "João Silva" },
      });

    if (authError) throw authError;

    // Update profile with specialty
    const { error: profileError } = await supabase.from("users").insert({
      user_id: authData.user.id,
      display_name: "João Silva",
      email: "test@example.com",
      specialty_id: specialtyData.id,
      specialty_year: 1,
    });

    if (profileError) throw profileError;

    console.log("✅ Test user created successfully");
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    process.exit(1);
  }
}

seedUsers();
