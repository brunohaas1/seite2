import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "./client";
import type { TransactionDTO, TransactionFilters, PaginatedResponse, CreateTransactionPayload } from "@/types/transaction";

// Normalize raw API item: amount comes as string|number, convert to number
type RawTransaction = Record<string, unknown>;

function normalize(raw: RawTransaction): TransactionDTO {
  const amount = Number(raw.amount);
  return { ...raw, amount: Number.isFinite(amount) ? amount : 0 } as TransactionDTO;
}

export async function listTransactions(filters: TransactionFilters = {}): Promise<PaginatedResponse<TransactionDTO>> {
  const data = await apiGet<PaginatedResponse<RawTransaction>>("/transactions", { params: filters });
  return {
    ...data,
    items: (data.items ?? []).map(normalize),
  };
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<TransactionDTO> {
  const raw = await apiPost<RawTransaction>("/transactions", payload);
  return normalize(raw);
}

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => listTransactions(filters),
  });
}

export function useAllTransactions(filters: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: ["allTransactions", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await listTransactions({ ...filters, page: pageParam });
      return res;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.page >= lastPage.total_pages) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 1,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
}
