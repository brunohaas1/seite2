"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, PiggyBank, Plus, ArrowUpRight, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

const initialGoals: Goal[] = [
  { id: "1", title: "Reserva de Emergência", target: 30000, current: 21500, deadline: "2026-12-31", category: "Reserva" },
  { id: "2", title: "Viagem de Férias / Europa", target: 15000, current: 8400, deadline: "2026-11-15", category: "Viagem" },
  { id: "3", title: "Entrada do Carro Novo", target: 25000, current: 17200, deadline: "2027-04-01", category: "Veículos" },
];

const initialBudgets: Budget[] = [
  { id: "1", category: "Alimentação & Mercado", limit: 2500, spent: 1840 },
  { id: "2", category: "Lazer & Restaurantes", limit: 1200, spent: 1150 },
  { id: "3", category: "Transporte & Combustível", limit: 800, spent: 420 },
  { id: "4", category: "Assinaturas & SaaS", limit: 500, spent: 480 },
];

export default function BudgetsGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            Metas & Orçamentos Mensais
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Planeje seus objetivos financeiros e acompanhe o teto de gastos por categoria.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
          <Plus className="h-4 w-4" />
          Nova Meta / Orçamento
        </button>
      </div>

      {/* Section 1: Financial Goals */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-400" />
          Minhas Metas Financeiras
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {goal.category}
                  </span>
                  <span className="text-xs text-gray-400">Meta: {goal.deadline}</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    {formatCurrency(goal.current)}{" "}
                    <span className="text-xs font-normal text-gray-400">de {formatCurrency(goal.target)}</span>
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-indigo-300 font-bold">{percent}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Monthly Budgets */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-purple-400" />
          Teto de Orçamento por Categoria
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
            const isNearLimit = percent >= 85;

            return (
              <div key={b.id} className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{b.category}</span>
                  {isNearLimit && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Próximo do limite
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-black text-white">{formatCurrency(b.spent)}</span>
                  <span className="text-xs text-gray-400">Limite: {formatCurrency(b.limit)}</span>
                </div>

                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isNearLimit ? "bg-rose-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
