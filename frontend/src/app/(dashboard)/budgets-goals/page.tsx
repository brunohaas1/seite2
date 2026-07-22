"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, PiggyBank, Plus, ArrowUpRight, AlertTriangle, CheckCircle2, X } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"goal" | "budget">("goal");

  // Goal Form State
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [category, setCategory] = useState("Reserva");
  const [deadline, setDeadline] = useState("");

  // Budget Form State
  const [budCat, setBudCat] = useState("");
  const [budLimit, setBudLimit] = useState("");

  const [toastSuccess, setToastSuccess] = useState<string | null>(null);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      target: parseFloat(targetAmount),
      current: currentAmount ? parseFloat(currentAmount) : 0,
      deadline: deadline || "2026-12-31",
      category,
    };

    setGoals([newGoal, ...goals]);
    setIsModalOpen(false);
    setTitle("");
    setTargetAmount("");
    setCurrentAmount("");
    setToastSuccess("Nova Meta cadastrada com sucesso!");
    setTimeout(() => setToastSuccess(null), 3000);
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budCat || !budLimit) return;

    const newBudget: Budget = {
      id: Date.now().toString(),
      category: budCat,
      limit: parseFloat(budLimit),
      spent: 0,
    };

    setBudgets([newBudget, ...budgets]);
    setIsModalOpen(false);
    setBudCat("");
    setBudLimit("");
    setToastSuccess("Novo Teto de Orçamento cadastrado!");
    setTimeout(() => setToastSuccess(null), 3000);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <AnimatePresence>
        {toastSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-medium text-sm"
          >
            <CheckCircle2 className="h-5 w-5" />
            {toastSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            Metas & Orçamentos Mensais
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Planeje seus objetivos financeiros e defina tetos de gastos por categoria.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setModalTab("budget");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <PiggyBank className="h-4 w-4 text-purple-400" />
            Novo Teto de Orçamento
          </button>
          <button
            onClick={() => {
              setModalTab("goal");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nova Meta
          </button>
        </div>
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-purple-400" />
            Teto de Orçamento por Categoria
          </h2>
          <button
            onClick={() => {
              setModalTab("budget");
              setIsModalOpen(true);
            }}
            className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Adicionar Teto
          </button>
        </div>

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

      {/* Unified Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalTab("goal")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      modalTab === "goal" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    🎯 Nova Meta
                  </button>
                  <button
                    onClick={() => setModalTab("budget")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      modalTab === "budget" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    🐷 Novo Teto de Orçamento
                  </button>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {modalTab === "goal" ? (
                <form onSubmit={handleAddGoal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Título da Meta</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Viagem Europa, Reserva de Emergência"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Valor Alvo (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="20000.00"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Já Guardado (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={currentAmount}
                        onChange={(e) => setCurrentAmount(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Categoria</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Reserva">Reserva</option>
                        <option value="Viagem">Viagem</option>
                        <option value="Veículos">Veículos</option>
                        <option value="Imóveis">Imóveis</option>
                        <option value="Educação">Educação</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Data Limite</label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 font-semibold rounded-xl text-sm">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20">
                      Salvar Meta
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddBudget} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Categoria de Despesa</label>
                    <select
                      value={budCat}
                      onChange={(e) => setBudCat(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione uma Categoria...</option>
                      <option value="Alimentação & Mercado">Alimentação & Mercado</option>
                      <option value="Lazer & Restaurantes">Lazer & Restaurantes</option>
                      <option value="Transporte & Combustível">Transporte & Combustível</option>
                      <option value="Moradia & Contas">Moradia & Contas</option>
                      <option value="Saúde & Cuidados">Saúde & Cuidados</option>
                      <option value="Educação & Cursos">Educação & Cursos</option>
                      <option value="Assinaturas & SaaS">Assinaturas & SaaS</option>
                      <option value="Viagem & Férias">Viagem & Férias</option>
                      <option value="Veículos">Veículos</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Teto Máximo Mensal (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 2500.00"
                      value={budLimit}
                      onChange={(e) => setBudLimit(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 font-semibold rounded-xl text-sm">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-purple-500/20">
                      Salvar Teto de Orçamento
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
