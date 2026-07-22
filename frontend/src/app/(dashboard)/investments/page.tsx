"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, PieChart, DollarSign, Wallet, ArrowUpRight, Plus,
  ShieldCheck, Bitcoin, Layers, ChevronRight
} from "lucide-react";

interface InvestmentAsset {
  id: string;
  ticker: string;
  name: string;
  type: "Ações" | "FIIs" | "Tesouro/CDB" | "Cripto";
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  profit: number;
  profitPercent: number;
}

const defaultAssets: InvestmentAsset[] = [
  { id: "1", ticker: "PETR4", name: "Petrobras PN", type: "Ações", quantity: 200, avgPrice: 32.50, currentPrice: 38.20, totalValue: 7640.00, profit: 1140.00, profitPercent: 17.5 },
  { id: "2", ticker: "HGLG11", name: "CSHG Logística", type: "FIIs", quantity: 50, avgPrice: 155.00, currentPrice: 162.80, totalValue: 8140.00, profit: 390.00, profitPercent: 5.0 },
  { id: "3", ticker: "BTC", name: "Bitcoin", type: "Cripto", quantity: 0.08, avgPrice: 280000.00, currentPrice: 360000.00, totalValue: 28800.00, profit: 6400.00, profitPercent: 28.5 },
  { id: "4", ticker: "CDB 110%", name: "Banco Sofisa Direto", type: "Tesouro/CDB", quantity: 1, avgPrice: 10000.00, currentPrice: 10850.00, totalValue: 10850.00, profit: 850.00, profitPercent: 8.5 },
];

export default function InvestmentsPage() {
  const [assets, setAssets] = useState<InvestmentAsset[]>(defaultAssets);

  const totalPortfolioValue = assets.reduce((acc, a) => acc + a.totalValue, 0);
  const totalProfit = assets.reduce((acc, a) => acc + a.profit, 0);
  const totalProfitPercent = (totalProfit / (totalPortfolioValue - totalProfit)) * 100;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            Carteira de Investimentos & Dividendos
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Acompanhe ações, fundos imobiliários, renda fixa e criptomoedas em tempo real.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
          <Plus className="h-4 w-4" />
          Novo Ativo
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5"
        >
          <span className="text-xs text-gray-400 font-medium block mb-2">Patrimônio Investido</span>
          <p className="text-3xl font-extrabold text-white">{formatCurrency(totalPortfolioValue)}</p>
          <span className="text-xs text-emerald-400 flex items-center gap-1 mt-2 font-medium">
            <ArrowUpRight className="h-3 w-3" /> Cotação atualizada
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5"
        >
          <span className="text-xs text-gray-400 font-medium block mb-2">Lucro / Valorização</span>
          <p className="text-3xl font-extrabold text-emerald-400">+{formatCurrency(totalProfit)}</p>
          <span className="text-xs text-emerald-400 font-semibold mt-2 block">
            +{totalProfitPercent.toFixed(2)}% sobre o capital investido
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5"
        >
          <span className="text-xs text-gray-400 font-medium block mb-2">Projeção de Proventos</span>
          <p className="text-3xl font-extrabold text-purple-300">R$ 412,50/mês</p>
          <span className="text-xs text-purple-400 mt-2 block">Dividend Yield médio: 9.2% a.a.</span>
        </motion.div>
      </div>

      {/* Assets Table */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Meus Ativos na Carteira</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-gray-800/60 text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-3 px-4">Ativo / Código</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Qtd</th>
                <th className="py-3 px-4">Preço Médio</th>
                <th className="py-3 px-4">Preço Atual</th>
                <th className="py-3 px-4">Total Investido</th>
                <th className="py-3 px-4">Rentabilidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-extrabold text-xs">
                        {asset.ticker.slice(0, 3)}
                      </div>
                      <div>
                        <span>{asset.ticker}</span>
                        <span className="block text-[11px] text-gray-400 font-normal">{asset.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-400">{asset.type}</td>
                  <td className="py-3.5 px-4 font-semibold">{asset.quantity}</td>
                  <td className="py-3.5 px-4">{formatCurrency(asset.avgPrice)}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{formatCurrency(asset.currentPrice)}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{formatCurrency(asset.totalValue)}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    +{formatCurrency(asset.profit)} ({asset.profitPercent}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
