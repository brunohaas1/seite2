import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./client";

export interface DashboardOverview {
  balance: number;
  period_income: number;
  period_expense: number;
  period_net: number;
  account_count: number;
  recent_transactions: Array<{
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
    category_id?: string | null;
  }>;
  monthly_data: Array<{ month: number; income: number; expense: number }>;
}

export function useDashboardOverview(period: "week" | "month" | "year" = "month") {
  return useQuery({
    queryKey: ["dashboard", "overview", period],
    queryFn: () => apiGet<DashboardOverview>("/dashboard/overview", { params: { period } }),
  });
}
