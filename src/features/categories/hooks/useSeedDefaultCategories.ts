import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase/client";
import { queryKeys } from "../../../lib/queryKeys";
import { DEFAULT_CATEGORIES } from "../../../shared/constants/categories";
import { useAuthStore } from "../../auth/stores/authStore";
import { useCategories } from "./useCategories";

export function useSeedDefaultCategories() {
  const qc = useQueryClient();
  const { data: categories, isSuccess } = useCategories();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isSuccess || !user) return;
    if (categories && categories.length > 0) return;

    void (async () => {
      const { error } = await supabase.from("categories_habit").insert(
        DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: user.id })),
      );
      if (!error) {
        void qc.invalidateQueries({ queryKey: queryKeys.categories });
      }
    })();
  }, [isSuccess, user, categories, qc]);
}
