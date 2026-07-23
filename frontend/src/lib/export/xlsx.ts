import * as XLSX from "xlsx";
import type { ReportRow } from "@/types/transaction";

export function exportReportXLSX(rows: ReportRow[]) {
  const headers = ["Data", "Descrição", "Categoria", "Valor (R$)", "Tipo"];
  const body = rows.map((r) => [r.date, r.description, r.category, r.amount, r.type]);
  const wsData = [headers, ...body];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [
    { wch: 12 },
    { wch: 40 },
    { wch: 24 },
    { wch: 14 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Demonstrativo");

  const today = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `seite2_relatorio_${today}.xlsx`);
}
