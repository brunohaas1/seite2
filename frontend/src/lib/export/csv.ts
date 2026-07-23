import { unparse } from "papaparse";
import type { ReportRow } from "@/types/transaction";

export function exportReportCSV(rows: ReportRow[]) {
  const data = rows.map((r) => ({
    Data: r.date,
    Descrição: r.description,
    Categoria: r.category,
    "Valor (R$)": r.amount.toFixed(2),
    Tipo: r.type,
  }));

  const today = new Date().toISOString().split("T")[0];
  const csv = "﻿" + unparse(data, { delimiter: ",", quotes: true, header: true });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `seite2_relatorio_${today}.csv`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
