import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./client";
import type { AccountDTO } from "@/types/account";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () => apiGet<AccountDTO[]>("/accounts"),
  });
}
