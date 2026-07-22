"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, PieChart, BarChart2, CheckCircle2, RefreshCw } from "lucide-react";

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = (type: "PDF" | "Excel" | "CSV") => {
    setIsExporting(type);
    setTimeout(() => {
      setIsExporting(null);
      alert(`Relatório em formato ${type} gerado e baixado com sucesso!`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
          <FileText className="h-7 w-7 text-indigo-400" />
          Relatórios & Exportação Financeira
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gere relatórios completos consolidando receitas, despesas, investimentos e demonstrativo de resultados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl w-fit mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Relatório Completo em PDF</h3>
            <p className="text-xs text-gray-400 mt-1">
              Documento formatado pronto para impressão com gráficos comparativos, resumo de fluxo e extrato detalhado.
            </p>
          </div>
          <button
            onClick={() => handleExport("PDF")}
            disabled={isExporting !== null}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            {isExporting === "PDF" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Baixar Relatório PDF
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-3">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Planilha Consolidada Excel (.XLSX)</h3>
            <p className="text-xs text-gray-400 mt-1">
              Planilha com abas separadas para receitas, despesas, categorias e aba de balanço patrimonial.
            </p>
          </div>
          <button
            onClick={() => handleExport("Excel")}
            disabled={isExporting !== null}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            {isExporting === "Excel" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar para Excel
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-3">
              <BarChart2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Exportação de Dados CSV</h3>
            <p className="text-xs text-gray-400 mt-1">
              Arquivo bruto padronizado compatível com QuickBooks, Conta Azul, Notion e softwares contábeis.
            </p>
          </div>
          <button
            onClick={() => handleExport("CSV")}
            disabled={isExporting !== null}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            {isExporting === "CSV" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar CSV
          </button>
        </motion.div>
      </div>
    </div>
  );
}
