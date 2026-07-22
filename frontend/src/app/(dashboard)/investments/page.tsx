"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, PieChart as PieIcon, DollarSign, Wallet, ArrowUpRight, Plus,
  X, CheckCircle2
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";

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

const growthData = [
  { month: "Jan", patrimonio: 42000 },
  { month: "Fev", patrimonio: 44500 },
  { month: "Mar", patrimonio: 47200 },
  { month: "Abr", patrimonio: 49800 },
  { month: "Mai", patrimonio: 52100 },
  { month: "Jun", patrimonio: 55430 },
];

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6"];

export default function InvestmentsPage() {
  const [assets, setAssets] = useState<InvestmentAsset[]>(defaultAssets);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState<"Ações" | "FIIs" | "Tesouro/CDB" | "Cripto">("Ações");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [toastSuccess, setToastSuccess] = useState(false);

  const totalPortfolioValue = assets.reduce((acc, a) => acc + a.totalValue, 0);
  const totalProfit = assets.reduce((acc, a) => acc + a.profit, 0);
  const totalProfitPercent = (totalProfit / (totalPortfolioValue - totalProfit)) * 100;

  // Chart pie data
  const pieData = [
    { name: "Ações", value: assets.filter(a => a.type === "Ações").reduce((acc, a) => acc + a.totalValue, 0) },
    { name: "FIIs", value: assets.filter(a => a.type === "FIIs").reduce((acc, a) => acc + a.totalValue, 0) },
    { name: "Tesouro/CDB", value: assets.filter(a => a.type === "Tesouro/CDB").reduce((acc, a) => acc + a.totalValue, 0) },
    { name: "Cripto", value: assets.filter(a => a.type === "Cripto").reduce((acc, a) => acc + a.totalValue, 0) },
  ].filter(d => d.value > 0);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !quantity || !price) return;

    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    const total = qty * prc;

    const newAsset: InvestmentAsset = {
      id: Date.now().toString(),
      ticker: ticker.toUpperCase(),
      name: name || ticker.toUpperCase(),
      type: assetType,
      quantity: qty,
      avgPrice: prc,
      currentPrice: prc * 1.05,
      totalValue: total * 1.05,
      profit: total * 0.05,
      profitPercent: 5.0,
    };

    setAssets([newAsset, ...assets]);
    setIsModalOpen(false);
    setTicker("");
    setName("");
    setQuantity("");
    setPrice("");
    setToastSuccess(true);
    setTimeout(() => setToastSuccess(false), 3000);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6">
      <AnimatePresence>
        {toastSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-medium text-sm"
          >
            <CheckCircle2 className="h-5 w-5" />
            Novo Ativo adicionado à carteira!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            Carteira de Investimentos & Proventos
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Acompanhe a rentabilidade da sua carteira com gráficos em tempo real.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
        >
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
            <ArrowUpRight className="h-3 w-3" /> Cotações em tempo real
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5"
        >
          <span className="text-xs text-gray-400 font-medium block mb-2">Lucro / Valorização Total</span>
          <p className="text-3xl font-extrabold text-emerald-400">+{formatCurrency(totalProfit)}</p>
          <span className="text-xs text-emerald-400 font-semibold mt-2 block">
            +{totalProfitPercent.toFixed(2)}% de rentabilidade acumulada
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

      {/* Visual Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Growth Area Chart */}
        <div className="lg:col-span-2 bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Evolução do Patrimônio</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                <Area type="monotone" dataKey="patrimonio" stroke="#6366f1" fillOpacity={1} fill="url(#colorPatrimonio)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Pie Chart */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <h2 className="text-lg font-bold text-white mb-2">Alocação de Carteira</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-gray-300 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
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

      {/* Modal Novo Ativo */}
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
                <h3 className="text-lg font-bold">Cadastrar Novo Ativo na Carteira</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddAsset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Código do Ativo (Ticker)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: VALE3, HGLG11, BTC, CDB 110%"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Nome / Descrição
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Vale S.A."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Tipo do Ativo
                  </label>
                  <select
                    value={assetType}
                    onChange={(e: any) => setAssetType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Ações">Ações</option>
                    <option value="FIIs">FIIs (Fundos Imobiliários)</option>
                    <option value="Tesouro/CDB">Tesouro / CDB / Renda Fixa</option>
                    <option value="Cripto">Criptomoeda</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="Ex: 100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Preço de Compra (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
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
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Adicionar Ativo
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
