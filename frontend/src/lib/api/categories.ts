import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./client";
import type { CategoryDTO } from "@/types/category";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<CategoryDTO[]>("/categories"),
  });
}
