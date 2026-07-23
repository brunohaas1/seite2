import { exportReportCSV } from "../csv";
import type { ReportRow } from "@/types/transaction";

const mockRows: ReportRow[] = [
  { date: "01/07/2026", description: "Salário", category: "Salário & Proventos", amount: 5000, type: "Receita" },
  { date: "02/07/2026", description: "Supermercado", category: "Alimentação & Mercado", amount: 350.5, type: "Despesa" },
];

describe("exportReportCSV", () => {
  beforeAll(() => {
    // jsdom may not have URL.createObjectURL; provide a mock
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: jest.fn(() => "blob:mock"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: jest.fn(),
    });
  });

  it("não lança exceção com dados válidos", () => {
    expect(() => exportReportCSV(mockRows)).not.toThrow();
  });

  it("cria um elemento <a> no body", () => {
    const appendChild = jest.spyOn(document.body, "appendChild");
    exportReportCSV(mockRows);
    expect(appendChild).toHaveBeenCalled();
    appendChild.mockRestore();
  });
});
