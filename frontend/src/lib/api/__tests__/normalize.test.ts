import { listTransactions, createTransaction } from "../transactions";
import { apiGet, apiPost } from "../client";

jest.mock("../client", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

describe("listTransactions", () => {
  it("normaliza amount de string para number", async () => {
    (apiGet as jest.Mock).mockResolvedValue({
      items: [{ description: "Teste", amount: "150.50", type: "income" }],
      total: 1,
      page: 1,
      page_size: 100,
      total_pages: 1,
    });

    const result = await listTransactions();
    expect(result.items[0].amount).toBe(150.50);
  });

  it("guarda NaN como 0", async () => {
    (apiGet as jest.Mock).mockResolvedValue({
      items: [{ description: "Inválido", amount: "não-numérico", type: "expense" }],
      total: 1,
      page: 1,
      page_size: 100,
      total_pages: 1,
    });

    const result = await listTransactions();
    expect(result.items[0].amount).toBe(0);
  });

  it("lida com items vazios", async () => {
    (apiGet as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 100,
      total_pages: 0,
    });

    const result = await listTransactions();
    expect(result.items).toEqual([]);
  });
});

describe("createTransaction", () => {
  it("normaliza amount na resposta", async () => {
    (apiPost as jest.Mock).mockResolvedValue({
      id: "abc",
      description: "Nova",
      amount: "299.90",
      type: "expense",
      account_id: "acc1",
      date: "2026-07-01T00:00:00Z",
      status: "pending",
      is_recurring: false,
      is_installment: false,
      is_scheduled: false,
      is_transfer: false,
      is_confirmed: true,
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-01T00:00:00Z",
      category_name: null,
      account_name: "Conta Corrente",
    });

    const result = await createTransaction({
      account_id: "acc1",
      description: "Nova",
      amount: 299.90,
      type: "expense",
      date: "2026-07-01",
    });
    expect(result.amount).toBe(299.90);
  });
});
