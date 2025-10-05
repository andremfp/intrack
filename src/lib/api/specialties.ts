import { supabase } from "@/lib/supabase";

export async function getSpecialties() {
  const { data, error } = await supabase
    .from("specialties")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getSpecialty(id: string) {
  const { data, error } = await supabase
    .from("specialties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
