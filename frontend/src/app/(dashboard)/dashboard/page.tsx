"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard,
  PiggyBank, ArrowUpRight, ArrowDownRight, Plus,
  MoreHorizontal, Wallet, BarChart3, Target,
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/v1/dashboard/overview?period=month", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Visão geral das suas finanças
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Transação</span>
          </motion.button>
        </motion.div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-6 card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Saldo Total</span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.balance || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-success">
              <ArrowUpRight className="h-3 w-3" />
              <span>Atualizado</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6 card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <span className="text-xs text-muted-foreground">Receitas</span>
            </div>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(data?.period_income || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-success">
              <ArrowUpRight className="h-3 w-3" />
              <span>Este mês</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6 card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-error" />
              </div>
              <span className="text-xs text-muted-foreground">Despesas</span>
            </div>
            <p className="text-2xl font-bold text-error">
              {formatCurrency(data?.period_expense || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-error">
              <ArrowDownRight className="h-3 w-3" />
              <span>Este mês</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-6 card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-info/10 rounded-lg">
                <Wallet className="h-5 w-5 text-info" />
              </div>
              <span className="text-xs text-muted-foreground">Contas</span>
            </div>
            <p className="text-2xl font-bold">
              {data?.account_count || 0}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-info">
              <BarChart3 className="h-3 w-3" />
              <span>Ativas</span>
            </div>
          </motion.div>
        </div>

        {/* Charts & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 glass rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Fluxo Mensal</h2>
            <div className="h-64 flex items-end gap-2">
              {(data?.monthly_data || []).map((item, i) => {
                const maxVal = Math.max(
                  ...(data?.monthly_data || []).map((d) =>
                    Math.max(d.income, d.expense)
                  ),
                  1
                );
                const incomeH = (item.income / maxVal) * 200;
                const expenseH = (item.expense / maxVal) * 200;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center gap-0.5">
                      <div
                        className="w-full bg-success/60 rounded-t"
                        style={{ height: `${incomeH}px` }}
                      />
                      <div
                        className="w-full bg-error/60 rounded-t"
                        style={{ height: `${expenseH}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                        "Jul", "Ago", "Set", "Out", "Nov", "Dez"][item.month]}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Últimas</h2>
              <button className="text-sm text-primary hover:underline">
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {(data?.recent_transactions || []).slice(0, 5).map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.type === "income"
                          ? "bg-success/10"
                          : "bg-error/10"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-error" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      tx.type === "income" ? "text-success" : "text-error"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                </motion.div>
              ))}
              {(!data?.recent_transactions || data.recent_transactions.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma transação recente
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: TrendingUp, label: "Receita", color: "text-success", bg: "bg-success/10" },
            { icon: TrendingDown, label: "Despesa", color: "text-error", bg: "bg-error/10" },
            { icon: Target, label: "Metas", color: "text-primary", bg: "bg-primary/10" },
            { icon: PiggyBank, label: "Investir", color: "text-info", bg: "bg-info/10" },
          ].map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass rounded-xl p-4 flex flex-col items-center gap-2 card-hover"
            >
              <div className={`p-3 rounded-lg ${item.bg}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}