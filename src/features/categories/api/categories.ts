import { supabase } from "../../../lib/supabase/client";
import type { Category, CategoryInput } from "../../../types/habit";

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories_habit")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from("categories_habit")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories_habit")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from("categories_habit")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function countHabitsInCategory(categoryId: string): Promise<number> {
  const { count, error } = await supabase
    .from("habits")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (error) throw error;
  return count ?? 0;
}
