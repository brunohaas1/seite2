import { exportReportXLSX } from "../xlsx";
import type { ReportRow } from "@/types/transaction";

const writeFileMock = jest.fn();
jest.mock("xlsx", () => ({
  utils: {
    aoa_to_sheet: jest.fn(() => ({})),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  writeFile: (...args: unknown[]) => writeFileMock(...args),
}));

const mockRows: ReportRow[] = [
  { date: "01/07/2026", description: "Salário", category: "Salário & Proventos", amount: 5000, type: "Receita" },
];

describe("exportReportXLSX", () => {
  it("não lança exceção com dados válidos", () => {
    expect(() => exportReportXLSX(mockRows)).not.toThrow();
  });

  it("chama writeFile", () => {
    exportReportXLSX(mockRows);
    expect(writeFileMock).toHaveBeenCalled();
  });
});
