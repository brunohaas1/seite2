"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, Wallet,
  ArrowUpRight, ArrowDownRight, Plus,
  Sparkles, RefreshCw, X, CreditCard,
  Target, Clock, ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

import { useDashboardOverview, useCreateTransaction, useAccounts, useCategories, getAuthToken } from "@/lib/api";
import type { DashboardOverview } from "@/lib/api";
import { useToast } from "@/lib/toast/useToast";

// ── Types ──

type DashboardData = DashboardOverview;

const defaultDemoData: DashboardData = {
  balance: 42850.50,
  period_income: 14500.00,
  period_expense: 6240.80,
  period_net: 8259.20,
  account_count: 4,
  recent_transactions: [
    { id: "1", description: "Supermercado Carrefour", amount: 480.50, type: "expense", date: new Date().toISOString() },
    { id: "2", description: "Recebimento Projeto Client SaaS", amount: 7500.00, type: "income", date: new Date().toISOString() },
    { id: "3", description: "Fatura Nubank Roxinho", amount: 2450.80, type: "expense", date: new Date().toISOString() },
    { id: "4", description: "Reabastecimento Posto Shell", amount: 220.00, type: "expense", date: new Date().toISOString() },
    { id: "5", description: "Proventos Dividendos HGLG11", amount: 412.50, type: "income", date: new Date().toISOString() },
  ],
  monthly_data: [
    { month: 1, income: 12000, expense: 5500 },
    { month: 2, income: 13500, expense: 5800 },
    { month: 3, income: 11000, expense: 6100 },
    { month: 4, income: 14000, expense: 5900 },
    { month: 5, income: 15200, expense: 6300 },
    { month: 6, income: 14500, expense: 6240 },
  ],
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

// ── Page ──

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const token = getAuthToken();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txCategoryId, setTxCategoryId] = useState("");

  // ── Data (A3: React Query instead of manual useEffect+fetch) ──
  // Gate on token: if no token, don't fire the query, use demo data.
  const overview = useDashboardOverview("month");
  const accounts = useAccounts();
  const createTx = useCreateTransaction();

  const isDemo = !token || (!!overview.error && !overview.data);
  const data: DashboardData = overview.data ?? defaultDemoData;

  const loading = token ? overview.isLoading : false;

  // ── Create transaction ──
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || !txAmount) return;

    const amountVal = parseFloat(txAmount);

    // Resolve an account_id (the backend TransactionCreate schema requires it).
    // Without this, the previous POST always 422'd.
    const firstAccountId = accounts.data?.[0]?.id;
    if (!firstAccountId) {
      toast.error("Nenhuma conta encontrada. Crie uma conta antes de lançar transações.");
      return;
    }

    // Close modal + reset fields immediately (mutation resolves asynchronously with toasts)
    setIsModalOpen(false);
    setTxDesc("");
    setTxAmount("");

    createTx.mutate(
      {
        account_id: firstAccountId,
        ...(txCategoryId ? { category_id: txCategoryId } : {}),
        description: txDesc,
        amount: amountVal,
        type: txType,
        date: txDate || new Date().toISOString(),
      },
      {
        onSuccess: () => toast.success("Transação registrada com sucesso!"),
        onError: () =>
          toast.error("Erro ao salvar no servidor. Tente novamente."),
      },
    );
  };

  // ── Skeleton loading (P7) ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white animate-pulse p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-gray-800 rounded-lg" />
        <div className="h-16 bg-gray-800/60 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-800/60 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-800/60 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-800/60 rounded-2xl" />
          <div className="h-80 bg-gray-800/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Sub Header / Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Visão Geral Financeira 360°
            </h1>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
              {isDemo ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                  <Sparkles className="h-3 w-3" />
                  Demonstração
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ao Vivo
                </span>
              )}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Transação</span>
          </motion.button>
        </motion.div>

        {/* AI Insight Card */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/10 text-amber-300 rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-xs md:text-sm text-gray-300">
              <strong className="text-white">Insight da IA Seite2:</strong>{" "}
              Seus gastos com Alimentação estão{" "}
              <span className="text-emerald-400 font-bold">12% abaixo do teto</span>.{" "}
              Você pode aportar R$ 350,00 adicionais na sua Meta de Reserva!
            </p>
          </div>
          <button
            onClick={() => router.push("/ai-assistant")}
            className="hidden sm:flex items-center gap-1 text-xs text-indigo-300 hover:text-white font-bold whitespace-nowrap"
          >
            Falar com IA <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Primary KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">Saldo Total Consolidado</span>
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">
              {formatCurrency(data?.balance || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>Soma de {data?.account_count || 0} contas conectadas</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">Receitas do Mês</span>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400">
              {formatCurrency(data?.period_income || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>Entradas este mês</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">Despesas do Mês</span>
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-400">
              {formatCurrency(data?.period_expense || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-rose-400">
              <ArrowDownRight className="h-3 w-3" />
              <span>Saídas este mês</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">Resultado Líquido</span>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-300">
              {formatCurrency(data?.period_net || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-purple-400">
              <span>Economia acumulada</span>
            </div>
          </motion.div>
        </div>

        {/* Executive Quick Summaries Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => router.push("/cards")}
            className="bg-gray-900/60 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-purple-400" /> Cartões de Crédito
              </span>
              <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white" />
            </div>
            <p className="text-xl font-extrabold text-white">R$ 10.471,30</p>
            <span className="text-[11px] text-gray-400 block">Faturas em aberto • Vence dia 10</span>
          </div>

          <div
            onClick={() => router.push("/investments")}
            className="bg-gray-900/60 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> Investimentos
              </span>
              <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white" />
            </div>
            <p className="text-xl font-extrabold text-emerald-400">R$ 55.430,00</p>
            <span className="text-[11px] text-gray-400 block">Rendimento: +18.4% a.a.</span>
          </div>

          <div
            onClick={() => router.push("/budgets-goals")}
            className="bg-gray-900/60 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                <Target className="h-4 w-4 text-indigo-400" /> Metas Principais
              </span>
              <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white" />
            </div>
            <p className="text-xl font-extrabold text-indigo-300">71% Concluído</p>
            <span className="text-[11px] text-gray-400 block">Reserva de Emergência</span>
          </div>

          <div
            onClick={() => router.push("/calendar")}
            className="bg-gray-900/60 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-400" /> Próximas Contas
              </span>
              <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white" />
            </div>
            <p className="text-xl font-extrabold text-amber-300">3 Vencimentos</p>
            <span className="text-[11px] text-gray-400 block">Nos próximos 7 dias</span>
          </div>
        </div>

        {/* Charts & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-gray-900/80 border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Fluxo Financeiro Mensal (Receitas vs Despesas)</h2>
            </div>
            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(data?.monthly_data || []).map((d) => ({
                    ...d,
                    monthName:
                      ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][d.month] ||
                      `M${d.month}`,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="monthName" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#fff" }} />
                  <Bar dataKey="income" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Transações Recentes</h2>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px] pr-1">
              {(data?.recent_transactions || []).map((tx, i) => (
                <motion.div
                  key={tx.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        tx.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200 line-clamp-1">{tx.description}</p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(tx.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold shrink-0 ${
                      tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                </motion.div>
              ))}
              {(!data?.recent_transactions || data.recent_transactions.length === 0) && (
                <p className="text-center text-gray-500 py-12 text-sm">
                  Nenhuma transação cadastrada.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* New Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                <h3 className="text-lg font-bold">Nova Transação Financeira</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                    Tipo de Transação
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTxType("income")}
                      className={`py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all ${
                        txType === "income"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md"
                          : "bg-gray-800 border-gray-700 text-gray-400"
                      }`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Receita
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType("expense")}
                      className={`py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all ${
                        txType === "expense"
                          ? "bg-rose-500/20 border-rose-500 text-rose-400 shadow-md"
                          : "bg-gray-800 border-gray-700 text-gray-400"
                      }`}
                    >
                      <ArrowDownRight className="h-4 w-4" />
                      Despesa
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Licença SaaS, Pagamento Cliente"
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Data da Transação
                    </label>
                    <input
                      type="date"
                      required
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Categoria
                  </label>
                  <CategorySelect
                    value={txCategoryId}
                    onChange={setTxCategoryId}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createTx.isPending}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {createTx.isPending ? "Salvando..." : "Salvar Transação"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Category select from API ──

function CategorySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data: categories } = useCategories();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Sem categoria</option>
      {(categories ?? []).map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
      {(!categories || categories.length === 0) && (
        <>
          <option value="">Alimentação & Mercado</option>
          <option value="">Lazer & Restaurantes</option>
          <option value="">Transporte & Combustível</option>
          <option value="">Moradia & Contas</option>
          <option value="">Saúde & Cuidados</option>
          <option value="">Educação & Cursos</option>
          <option value="">Assinaturas & SaaS</option>
          <option value="">Salário & Proventos</option>
          <option value="">Reserva & Investimentos</option>
          <option value="">Viagem & Férias</option>
          <option value="">Veículos</option>
          <option value="">Outros</option>
        </>
      )}
    </select>
  );
}
