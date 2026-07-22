"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, Wallet,
  ArrowUpRight, ArrowDownRight, Plus, LogOut,
  Sparkles, RefreshCw, X, CheckCircle
} from "lucide-react";

interface DashboardData {
  balance: number;
  period_income: number;
  period_expense: number;
  period_net: number;
  account_count: number;
  recent_transactions: Array<{
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
  }>;
  monthly_data: Array<{
    month: number;
    income: number;
    expense: number;
  }>;
}

const defaultDemoData: DashboardData = {
  balance: 14850.50,
  period_income: 18500.00,
  period_expense: 3649.50,
  period_net: 14850.50,
  account_count: 3,
  recent_transactions: [
    { id: "1", description: "Venda de Serviços SaaS", amount: 4500.00, type: "income", date: new Date().toISOString() },
    { id: "2", description: "Pagamento Servidor ZimaOS / Cloud", amount: 150.00, type: "expense", date: new Date().toISOString() },
    { id: "3", description: "Licença de Software", amount: 299.90, type: "expense", date: new Date().toISOString() },
    { id: "4", description: "Projeto Freelance", amount: 8000.00, type: "income", date: new Date().toISOString() },
    { id: "5", description: "Assinatura Internet", amount: 200.00, type: "expense", date: new Date().toISOString() },
  ],
  monthly_data: [
    { month: 1, income: 12000, expense: 3000 },
    { month: 2, income: 15000, expense: 4000 },
    { month: 3, income: 14000, expense: 3500 },
    { month: 4, income: 16000, expense: 3800 },
    { month: 5, income: 17500, expense: 4200 },
    { month: 6, income: 18500, expense: 3649.5 },
  ],
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"income" | "expense">("income");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setIsDemo(true);
      setData(defaultDemoData);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/dashboard/overview?period=month", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && (json.balance !== 0 || json.recent_transactions?.length > 0)) {
          setData(json);
          setIsDemo(false);
        } else {
          setData({ ...defaultDemoData, ...json });
          setIsDemo(true);
        }
      } else {
        setIsDemo(true);
        setData(defaultDemoData);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      setIsDemo(true);
      setData(defaultDemoData);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || !txAmount) return;

    setIsSubmitting(true);
    const amountVal = parseFloat(txAmount);
    const token = localStorage.getItem("token");

    const newTx = {
      id: Date.now().toString(),
      description: txDesc,
      amount: amountVal,
      type: txType,
      date: new Date().toISOString(),
    };

    if (token) {
      try {
        await fetch("/api/v1/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            description: txDesc,
            amount: amountVal,
            type: txType,
            date: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Failed to push transaction to API:", err);
      }
    }

    // Update local state dynamically
    setData((prev) => {
      if (!prev) return defaultDemoData;
      const newIncome = txType === "income" ? prev.period_income + amountVal : prev.period_income;
      const newExpense = txType === "expense" ? prev.period_expense + amountVal : prev.period_expense;
      const newNet = newIncome - newExpense;

      return {
        ...prev,
        balance: prev.balance + (txType === "income" ? amountVal : -amountVal),
        period_income: newIncome,
        period_expense: newExpense,
        period_net: newNet,
        recent_transactions: [newTx, ...prev.recent_transactions],
      };
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    setTxDesc("");
    setTxAmount("");
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="text-gray-400 text-sm font-medium">Carregando Seite2...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-medium"
          >
            <CheckCircle className="h-5 w-5" />
            Transação registrada com sucesso!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Sub Header / Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Visão Geral Financeira
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {isDemo ? "Visualizando em Modo Demonstração" : "Conectado ao Servidor ZimaOS em tempo real"}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Transação</span>
          </motion.button>
        </motion.div>


        {/* Demo Banner */}
        {isDemo && (
          <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-300 shrink-0" />
              <p className="text-xs md:text-sm text-gray-300">
                Você está visualizando dados interativos de demonstração. Adicione novas transações abaixo para testar em tempo real!
              </p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">Saldo Total</span>
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">
              {formatCurrency(data?.balance || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>Atualizado em tempo real</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">Receitas</span>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400">
              {formatCurrency(data?.period_income || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>Este mês</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">Despesas</span>
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-400">
              {formatCurrency(data?.period_expense || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-rose-400">
              <ArrowDownRight className="h-3 w-3" />
              <span>Este mês</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
              <span>Balanço mensal</span>
            </div>
          </motion.div>
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
              <h2 className="text-lg font-bold text-white">Fluxo Financeiro Mensal</h2>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-emerald-500" />
                  <span className="text-gray-400">Receitas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-rose-500" />
                  <span className="text-gray-400">Despesas</span>
                </div>
              </div>
            </div>

            <div className="h-64 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-gray-800">
              {(data?.monthly_data || []).map((item, i) => {
                const maxVal = Math.max(
                  ...(data?.monthly_data || []).map((d) => Math.max(d.income, d.expense)),
                  1
                );
                const incomeH = (item.income / maxVal) * 180;
                const expenseH = (item.expense / maxVal) * 180;
                const monthName = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][item.month] || `M${item.month}`;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1">
                      <div
                        className="w-full max-w-[16px] bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t transition-all"
                        style={{ height: `${Math.max(incomeH, 4)}px` }}
                        title={`Receita: ${formatCurrency(item.income)}`}
                      />
                      <div
                        className="w-full max-w-[16px] bg-rose-500/80 group-hover:bg-rose-400 rounded-t transition-all"
                        style={{ height: `${Math.max(expenseH, 4)}px` }}
                        title={`Despesa: ${formatCurrency(item.expense)}`}
                      />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{monthName}</span>
                  </div>
                );
              })}
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
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Transação"}
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