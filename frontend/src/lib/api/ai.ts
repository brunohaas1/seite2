import { useMutation } from "@tanstack/react-query";
import { apiPost } from "./client";

export interface AIQueryResponse {
  response: string;
  conversation_id?: string;
  data?: Record<string, unknown>;
}

export function useAIQuery() {
  return useMutation({
    mutationFn: (query: string) => apiPost<AIQueryResponse>("/ai/query", { query }),
  });
}
