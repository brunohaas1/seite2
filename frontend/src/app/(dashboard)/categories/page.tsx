"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tags, Plus, Sparkles, FolderTree, Settings2, ArrowRight } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
            <Tags className="h-7 w-7 text-indigo-400" />
            Categorias & Regras Automáticas por IA
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Organize suas finanças com categorias ilimitadas e crie regras automáticas de categorização.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-300" />
            Regras Automáticas da IA
          </h2>
          <p className="text-xs text-gray-400">
            A IA classifica automaticamente suas compras no extrato ou no OCR com base em palavras-chave.
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
    </div>
  );
}
