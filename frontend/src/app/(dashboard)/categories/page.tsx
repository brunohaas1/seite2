"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tags, Plus, Sparkles, FolderTree, ArrowRight, CheckCircle2, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
  type: "Despesa" | "Receita";
  subcategories: string[];
}

interface AutoRule {
  id: string;
  keyword: string;
  targetCategory: string;
}

const defaultCategories: Category[] = [
  { id: "1", name: "Alimentação & Delivery", color: "bg-emerald-500", type: "Despesa", subcategories: ["Mercado", "Restaurantes", "iFood", "Padaria"] },
  { id: "2", name: "Transporte & Veículo", color: "bg-indigo-500", type: "Despesa", subcategories: ["Combustível", "Uber", "Estacionamento", "Manutenção"] },
  { id: "3", name: "Moradia & Contas", color: "bg-purple-500", type: "Despesa", subcategories: ["Aluguel", "Energia", "Internet", "Condomínio"] },
  { id: "4", name: "Salário & Proventos", color: "bg-amber-500", type: "Receita", subcategories: ["Salário CLT", "Dividendos", "Freelance", "Rendimentos"] },
];

const defaultRules: AutoRule[] = [
  { id: "1", keyword: "Uber", targetCategory: "Transporte & Veículo" },
  { id: "2", keyword: "iFood", targetCategory: "Alimentação & Delivery" },
  { id: "3", keyword: "Amazon", targetCategory: "Moradia & Contas" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [rules, setRules] = useState<AutoRule[]>(defaultRules);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  // New Category state
  const [name, setName] = useState("");
  const [catType, setCatType] = useState<"Despesa" | "Receita">("Despesa");
  const [subcats, setSubcats] = useState("");

  // New Rule state
  const [keyword, setKeyword] = useState("");
  const [targetCategory, setTargetCategory] = useState(defaultCategories[0]?.name || "");

  const [toastSuccess, setToastSuccess] = useState<string | null>(null);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newCat: Category = {
      id: Date.now().toString(),
      name,
      color: catType === "Despesa" ? "bg-rose-500" : "bg-emerald-500",
      type: catType,
      subcategories: subcats ? subcats.split(",").map((s) => s.trim()) : ["Geral"],
    };

    setCategories([newCat, ...categories]);
    setIsCatModalOpen(false);
    setName("");
    setSubcats("");
    setToastSuccess("Nova Categoria salva com sucesso!");
    setTimeout(() => setToastSuccess(null), 3000);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !targetCategory) return;

    const newRule: AutoRule = {
      id: Date.now().toString(),
      keyword,
      targetCategory,
    };

    setRules([newRule, ...rules]);
    setIsRuleModalOpen(false);
    setKeyword("");
    setToastSuccess("Nova Regra Automática criada!");
    setTimeout(() => setToastSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
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
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
            <Tags className="h-7 w-7 text-indigo-400" />
            Categorias & Regras Automáticas por IA
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Organize suas finanças selecionando categorias existentes ou criando novas categorias personalizadas.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            Nova Regra IA
          </button>
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nova Categoria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-indigo-400" />
            Minhas Categorias & Subcategorias
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.01 }}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${cat.color}`} />
                    <h3 className="font-bold text-white text-base">{cat.name}</h3>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                    {cat.type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {cat.subcategories.map((sub, i) => (
                    <span key={i} className="text-xs bg-gray-800/60 border border-gray-700/50 text-gray-300 px-2.5 py-1 rounded-lg">
                      {sub}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Auto Rules */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-300" />
              Regras Automáticas
            </h2>
            <button
              onClick={() => setIsRuleModalOpen(true)}
              className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Criar Regra
            </button>
          </div>
          <p className="text-xs text-gray-400">
            A IA associa automaticamente transações com base nas suas categorias cadastradas.
          </p>

          <div className="space-y-3">
            {rules.map((r) => (
              <div key={r.id} className="p-3 bg-gray-800/50 border border-gray-700/40 rounded-xl text-xs flex items-center justify-between">
                <span className="font-bold text-indigo-300">Se contiver "{r.keyword}"</span>
                <ArrowRight className="h-4 w-4 text-gray-500" />
                <span className="font-semibold text-emerald-400">{r.targetCategory}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Nova Categoria */}
      <AnimatePresence>
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                <h3 className="text-lg font-bold">Criar Nova Categoria</h3>
                <button onClick={() => setIsCatModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Nome da Categoria</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Educação & Cursos, Lazer & Hobbies"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Tipo</label>
                  <select
                    value={catType}
                    onChange={(e: any) => setCatType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Despesa">Despesa</option>
                    <option value="Receita">Receita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Subcategorias (separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: Cursos Online, Livros, Mentorias"
                    value={subcats}
                    onChange={(e) => setSubcats(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsCatModalOpen(false)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20">
                    Salvar Categoria
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nova Regra IA */}
      <AnimatePresence>
        {isRuleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                  Criar Regra Automática por IA
                </h3>
                <button onClick={() => setIsRuleModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddRule} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Se o texto no extrato contiver:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Netflix, Uber, Carrefour"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Classificar automaticamente como:</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} ({cat.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsRuleModalOpen(false)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-amber-500/20">
                    Criar Regra IA
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
