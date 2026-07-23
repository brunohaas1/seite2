"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  BarChart2,
  RefreshCw,
  AlertCircle,
  Search,
} from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";

import { useAllTransactions, useAccounts, useCategories } from "@/lib/api";
import { useToast } from "@/lib/toast/useToast";
import type { TransactionDTO, ReportRow, TransactionFilters } from "@/types/transaction";

// ── Helpers ──

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const escapeHtml = (str: string) => {
  const esc = (c: string) => String.fromCharCode(38) + c;
  const map: Record<string, string> = {
    "&": esc("amp;"),
    "<": esc("lt;"),
    ">": esc("gt;"),
    '"': esc("quot;"),
    "'": esc("#39;"),
  };
  return str.replace(/[&<>"']/g, (c) => map[c] ?? c);
};

// ── Period presets ──

type PeriodPreset = "this_month" | "last_month" | "this_year" | "all";

const periodPresets: { label: string; value: PeriodPreset }[] = [
  { label: "Este mês", value: "this_month" },
  { label: "Mês passado", value: "last_month" },
  { label: "Este ano", value: "this_year" },
  { label: "Tudo", value: "all" },
];

function dateRangeForPreset(p: PeriodPreset): { start_date?: string; end_date?: string } {
  const now = new Date();
  switch (p) {
    case "this_month":
      return {
        start_date: startOfMonth(now).toISOString(),
        end_date: endOfMonth(now).toISOString(),
      };
    case "last_month": {
      const lm = subMonths(now, 1);
      return { start_date: startOfMonth(lm).toISOString(), end_date: endOfMonth(lm).toISOString() };
    }
    case "this_year":
      return { start_date: startOfYear(now).toISOString(), end_date: endOfYear(now).toISOString() };
    default:
      return {};
  }
}

// ── API DTO → ReportRow (B1: transfers are NOT Despesa) ──

function toReportRow(tx: TransactionDTO): ReportRow {
  const kind = tx.is_transfer || tx.type === "transfer"
    ? "Transferência"
    : tx.type === "income"
      ? "Receita"
      : "Despesa";
  return {
    date: new Date(tx.date).toLocaleDateString("pt-BR"),
    description: tx.description ?? "",
    category: tx.category_name ?? tx.account_name ?? "Sem categoria",
    amount: Number.isFinite(tx.amount) ? tx.amount : 0,
    type: kind,
  };
}

// ── Button base class ──

const btnBase =
  "w-full py-2.5 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50";

// ── Page ──

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodPreset>("this_month");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");

  const toast = useToast();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  // Build filters from UI state
  const filters: TransactionFilters = useMemo(() => {
    const dr = dateRangeForPreset(period);
    return {
      ...dr,
      ...(typeFilter !== "all" ? { type: typeFilter as "income" | "expense" | "transfer" } : {}),
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(accountId ? { account_id: accountId } : {}),
      page_size: 100,
    };
  }, [period, typeFilter, categoryId, accountId]);

  // ── Data fetching (B4: React Query handles cancellation + strict mode) ──
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAllTransactions(filters);

  // Flatten pages
  const allPages = data?.pages ?? [];
  const rawItems = allPages.flatMap((p) => p.items) ?? [];
  const totalCount = allPages[0]?.total ?? 0;
  const pageCount = rawItems.length;

  const reportRows = useMemo(() => rawItems.map(toReportRow), [rawItems]);

  // KPIs (B1: transfers excluded from Despesa)
  const totals = useMemo(
    () =>
      reportRows.reduce(
        (acc, r) => {
          if (r.type === "Receita") acc.receitas += r.amount;
          else if (r.type === "Despesa") acc.despesas += r.amount;
          else acc.transferencias += r.amount;
          return acc;
        },
        { receitas: 0, despesas: 0, transferencias: 0 },
      ),
    [reportRows],
  );
  const saldo = totals.receitas - totals.despesas;

  // B5: truncation warning
  const isTruncated = pageCount > 0 && totalCount > pageCount;

  // ── Export handlers ──
  const guardRows = () => {
    if (!reportRows.length) {
      toast.error("Nenhum lançamento para exportar.");
      return false;
    }
    return true;
  };

  const exportCSV = async () => {
    if (!guardRows()) return;
    setIsExporting("CSV");
    const { exportReportCSV } = await import("@/lib/export/csv");
    exportReportCSV(reportRows);
    setIsExporting(null);
    toast.success("Arquivo CSV baixado com sucesso!");
  };

  const exportXLSX = async () => {
    if (!guardRows()) return;
    setIsExporting("Excel");
    const { exportReportXLSX } = await import("@/lib/export/xlsx");
    exportReportXLSX(reportRows);
    setIsExporting(null);
    toast.success("Planilha Excel baixada com sucesso!");
  };

  const exportPDF = async () => {
    if (!guardRows()) return;
    setIsExporting("PDF");
    const { exportReportPDF } = await import("@/lib/export/pdf");
    exportReportPDF(reportRows, totals);
    setIsExporting(null);
    toast.success("Relatório PDF baixado com sucesso!");
  };

  // ── Skeleton loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-8 w-64 bg-gray-800 rounded-lg" />
        <div className="h-10 bg-gray-800/60 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-800/60 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-800/30 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-800/40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 font-medium">
            Não foi possível carregar suas transações.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state (P4) ──
  if (!reportRows.length) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
            <FileText className="h-7 w-7 text-indigo-400" />
            Relatórios & Exportação Financeira
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gere relatórios completos consolidando receitas, despesas, investimentos.
          </p>
        </div>

        {/* Filter bar (so the user can change period and retry) */}
        <FilterBar
          period={period}
          setPeriod={setPeriod}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          accountId={accountId}
          setAccountId={setAccountId}
          accounts={accounts ?? []}
          categories={categories ?? []}
        />

        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full mb-6 border border-indigo-500/20">
            <FileText className="h-16 w-16 text-indigo-400/60" />
          </div>
          <p className="text-xl font-bold text-gray-300">Você ainda não tem lançamentos neste período.</p>
          <p className="text-sm mt-2 text-gray-500 max-w-md text-center">
            Crie sua primeira transação no Dashboard ou ajuste os filtros para ver dados existentes.
          </p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
          <FileText className="h-7 w-7 text-indigo-400" />
          Relatórios & Exportação Financeira
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gere relatórios completos consolidando receitas, despesas, investimentos e salvando diretamente no seu dispositivo.
        </p>
      </div>

      {/* ── Filter bar (P1) ── */}
      <FilterBar
        period={period}
        setPeriod={setPeriod}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        accountId={accountId}
        setAccountId={setAccountId}
        accounts={accounts ?? []}
        categories={categories ?? []}
      />

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([
          { label: "Saldo", value: saldo, color: "text-white", delay: 0 },
          { label: "Receitas", value: totals.receitas, color: "text-emerald-400", delay: 0.05 },
          { label: "Despesas", value: totals.despesas, color: "text-red-400", delay: 0.1 },
          { label: "Transferências", value: totals.transferencias, color: "text-gray-400", delay: 0.15 },
        ] as const).map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: kpi.delay, duration: 0.3 }}
          >
            <KpiCard label={kpi.label} value={kpi.value} color={kpi.color} />
          </motion.div>
        ))}
      </div>

      {/* ── B5 truncation warning ── */}
      {isTruncated && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Relatório limitado a {pageCount} lançamento{pageCount !== 1 ? "s" : ""} de{" "}
            {totalCount} total. Afine os filtros para ver o restante.
          </span>
        </div>
      )}

      {/* ── Transaction table ── */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-300 text-left text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Valor (R$)</th>
                <th className="px-4 py-3">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {reportRows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-4 py-3 text-gray-200 max-w-[200px] truncate">
                    {r.description}
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate">
                    {r.category}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                      r.type === "Receita" ? "text-emerald-400" : r.type === "Despesa" ? "text-red-400" : "text-gray-400"
                    }`}
                  >
                    {r.type === "Receita" ? "+" : "–"}R$ {formatBRL(r.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.type === "Receita"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : r.type === "Despesa"
                            ? "bg-red-500/10 text-red-300"
                            : "bg-gray-500/10 text-gray-300"
                      }`}
                    >
                      {r.type === "Receita" ? "Receita" : r.type === "Despesa" ? "Despesa" : "Transf"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination load more ── */}
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isFetchingNextPage ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Carregar mais lançamentos
          </button>
        </div>
      )}

      {/* ── Export cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF card */}
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
              Documento formatado com indicadores e extrato detalhado, baixado diretamente como PDF.
            </p>
          </div>
          <button
            onClick={exportPDF}
            disabled={isExporting !== null}
            className={`${btnBase} bg-red-600 hover:bg-red-500 text-white`}
          >
            {isExporting === "PDF" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Gerar & Baixar PDF
          </button>
        </motion.div>

        {/* Excel card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-3">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Planilha Excel (.XLSX)</h3>
            <p className="text-xs text-gray-400 mt-1">
              Planilha formatada compatível com Microsoft Excel, Google Sheets e LibreOffice.
            </p>
          </div>
          <button
            onClick={exportXLSX}
            disabled={isExporting !== null}
            className={`${btnBase} bg-emerald-600 hover:bg-emerald-500 text-white`}
          >
            {isExporting === "Excel" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exportar para Excel
          </button>
        </motion.div>

        {/* CSV card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-3">
              <BarChart2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Exportação CSV</h3>
            <p className="text-xs text-gray-400 mt-1">
              Arquivo bruto padronizado compatível com softwares contábeis e sistemas de gestão.
            </p>
          </div>
          <button
            onClick={exportCSV}
            disabled={isExporting !== null}
            className={`${btnBase} bg-indigo-600 hover:bg-indigo-500 text-white`}
          >
            {isExporting === "CSV" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exportar arquivo CSV
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Filter bar sub-component ──

function FilterBar({
  period,
  setPeriod,
  typeFilter,
  setTypeFilter,
  categoryId,
  setCategoryId,
  accountId,
  setAccountId,
  accounts,
  categories,
}: {
  period: PeriodPreset;
  setPeriod: (v: PeriodPreset) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  accountId: string;
  setAccountId: (v: string) => void;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; color?: string | null }[];
}) {
  const activeChip = "bg-indigo-600 text-white border-indigo-500";
  const idleChip = "bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-500";

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex flex-wrap items-center gap-3">
      {/* Period presets */}
      <span className="text-xs text-gray-400 font-medium mr-1">Período</span>
      {periodPresets.map((p) => (
        <button
          key={p.value}
          onClick={() => setPeriod(p.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
            period === p.value ? activeChip : idleChip
          }`}
        >
          {p.label}
        </button>
      ))}

      <span className="w-px h-6 bg-gray-700 mx-1" />

      {/* Type filter */}
      <span className="text-xs text-gray-400 font-medium mr-1">Tipo</span>
      {["all", "income", "expense", "transfer"].map((t) => (
        <button
          key={t}
          onClick={() => setTypeFilter(t)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
            typeFilter === t ? activeChip : idleChip
          }`}
        >
          {t === "all" ? "Todos" : t === "income" ? "Receitas" : t === "expense" ? "Despesas" : "Transferências"}
        </button>
      ))}

      <span className="w-px h-6 bg-gray-700 mx-1" />

      {/* Category select */}
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-1.5 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">Todas categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Account select */}
      <select
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-1.5 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">Todas contas</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── KPI card ──

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  const iconMap: Record<string, string> = {
    Saldo: "💰",
    Receitas: "📈",
    Despesas: "📉",
    Transferências: "🔄",
  };

  const gradientMap: Record<string, string> = {
    Saldo: "from-gray-900/80 to-gray-800/40",
    Receitas: "from-emerald-900/30 to-emerald-800/10",
    Despesas: "from-red-900/30 to-red-800/10",
    Transferências: "from-gray-800/50 to-gray-700/20",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className={`bg-gradient-to-br ${gradientMap[label] ?? "from-gray-900/80 to-gray-800/40"} border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-all cursor-default shadow-lg`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">{label}</p>
        <span className="text-lg">{iconMap[label] ?? "📊"}</span>
      </div>
      <p className={`text-xl font-extrabold ${color}`}>
        R$ {formatBRL(value)}
      </p>
    </motion.div>
  );
}
