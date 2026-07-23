import { jsPDF } from "jspdf";
import type { ReportRow } from "@/types/transaction";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function exportReportPDF(
  rows: ReportRow[],
  totals: { receitas: number; despesas: number },
) {
  const saldo = totals.receitas - totals.despesas;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let cursorY = 50;

  // --- Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.text("Seite2 Financial SaaS", marginX, cursorY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Relatório Executivo - Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
    marginX,
    cursorY + 16,
  );
  cursorY += 40;

  // --- KPI Cards ---
  const kpiCards = [
    { label: "Saldo Total", value: saldo, color: [17, 24, 39] as [number, number, number] },
    { label: "Receitas", value: totals.receitas, color: [5, 150, 105] as [number, number, number] },
    { label: "Despesas", value: totals.despesas, color: [220, 38, 38] as [number, number, number] },
  ];
  const cardWidth = (pageWidth - marginX * 2 - 20) / 3;
  kpiCards.forEach((kpi, i) => {
    const x = marginX + i * (cardWidth + 10);
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(x, cursorY, cardWidth, 60, 8, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.setFont("helvetica", "bold");
    doc.text(kpi.label.toUpperCase(), x + 12, cursorY + 20);
    doc.setFontSize(16);
    doc.setTextColor(...kpi.color);
    const val = Number.isFinite(kpi.value) ? kpi.value : 0;
    doc.text(`R$ ${formatBRL(val)}`, x + 12, cursorY + 44);
  });
  cursorY += 80;

  // --- Table title ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text("Demonstrativo de Lançamentos", marginX, cursorY);
  cursorY += 20;

  // --- Table columns ---
  const cols: Array<{ key: string; label: string; w: number; align?: "right" }> = [
    { key: "date", label: "Data", w: 80 },
    { key: "description", label: "Descrição", w: 200 },
    { key: "category", label: "Categoria", w: 140 },
    { key: "amount", label: "Valor (R$)", w: 90, align: "right" },
  ];

  // Helper: draw table header at current cursorY
  const drawTableHead = (y: number) => {
    doc.setFillColor(31, 41, 55);
    doc.rect(marginX, y, pageWidth - marginX * 2, 22, "F");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    let hX = marginX;
    cols.forEach((c) => {
      const textX = c.align === "right" ? hX + c.w - 6 : hX + 6;
      doc.text(c.label, textX, y + 15, { align: c.align === "right" ? "right" : "left" });
      hX += c.w;
    });
  };

  drawTableHead(cursorY);
  cursorY += 22;

  // --- Rows with page break ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const rowHeight = 18;
  const tableBottom = doc.internal.pageSize.getHeight() - 40;

  rows.forEach((r, idx) => {
    // Page break check
    if (cursorY + rowHeight > tableBottom) {
      doc.addPage();
      cursorY = 50;
      drawTableHead(cursorY);
      cursorY += 22;
    }

    // Zebra
    if (idx % 2 === 0) {
      doc.setFillColor(243, 244, 246);
      doc.rect(marginX, cursorY, pageWidth - marginX * 2, rowHeight, "F");
    }

    // Determine color by type
    const amountColor: [number, number, number] =
      r.type === "Receita" ? [5, 150, 105] : [220, 38, 38];
    const textColor: [number, number, number] = [55, 65, 81];

    // Draw each column
    let cX = marginX;
    cols.forEach((c) => {
      const textX = c.align === "right" ? cX + c.w - 6 : cX + 6;
      if (c.key === "amount") {
        doc.setTextColor(...amountColor);
      } else {
        doc.setTextColor(...textColor);
      }

      let cellText = "";
      if (c.key === "amount") {
        cellText = `R$ ${formatBRL(Number.isFinite(r.amount) ? r.amount : 0)}`;
      } else if (c.key === "date") cellText = r.date;
      else if (c.key === "description") cellText = r.description;
      else if (c.key === "category") cellText = r.category;

      // Use splitTextToSize so long text wraps instead of being truncated
      const maxWidth = c.w - 12;
      const lines = doc.splitTextToSize(cellText, maxWidth);
      doc.text(lines, textX, cursorY + 12, {
        align: c.align === "right" ? "right" : "left",
      });

      cX += c.w;
    });
    cursorY += rowHeight;
  });

  const today = new Date().toISOString().split("T")[0];
  doc.save(`seite2_relatorio_${today}.pdf`);
}
