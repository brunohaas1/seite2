export type TransactionType = "income" | "expense" | "transfer";

export interface TransactionDTO {
  id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number; // normalized from string|number at fetch boundary
  description: string;
  date: string; // ISO datetime
  status: string;
  is_recurring: boolean;
  is_installment: boolean;
  is_scheduled: boolean;
  is_transfer: boolean;
  is_confirmed: boolean;
  category_name: string | null;
  account_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  type?: TransactionType;
  category_id?: string;
  account_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface CreateTransactionPayload {
  account_id: string;
  category_id?: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
}

export interface ReportRow {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "Receita" | "Despesa" | "Transferência";
}
