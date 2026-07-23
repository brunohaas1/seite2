import { exportReportPDF } from "../pdf";
import type { ReportRow } from "@/types/transaction";

const mockRows: ReportRow[] = [
  { date: "01/07/2026", description: "Salário", category: "Salário & Proventos", amount: 5000, type: "Receita" },
  { date: "02/07/2026", description: "Supermercado", category: "Alimentação & Mercado", amount: 350.5, type: "Despesa" },
];

const mockTotals = { receitas: 5000, despesas: 350.5, transferencias: 1000 };

describe("exportReportPDF", () => {
  beforeAll(() => {
    jest.mock("jspdf", () => {
      const mockDoc = {
        internal: { pageSize: { getWidth: () => 595, getHeight: () => 842 } },
        setFont: jest.fn(),
        setFontSize: jest.fn(),
        setTextColor: jest.fn(),
        setFillColor: jest.fn(),
        text: jest.fn(),
        roundedRect: jest.fn(),
        rect: jest.fn(),
        addPage: jest.fn(),
        save: jest.fn(),
        splitTextToSize: jest.fn((text: string) => [text]),
      };
      return { jsPDF: jest.fn(() => mockDoc) };
    });
  });

  it("não lança exceção com dados válidos", () => {
    expect(() => exportReportPDF(mockRows, mockTotals)).not.toThrow();
  });
});
