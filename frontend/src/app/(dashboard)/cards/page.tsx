"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, CheckCircle2, X } from "lucide-react";

interface CardItem {
  id: string;
  name: string;
  bank: string;
  brand: string;
  limitTotal: number;
  limitUsed: number;
  closingDay: number;
  dueDay: number;
  digits: string;
  color: string;
}

const defaultCards: CardItem[] = [
  { id: "1", name: "Nubank Roxinho", bank: "Nubank", brand: "Mastercard", limitTotal: 15000, limitUsed: 2450.80, closingDay: 3, dueDay: 10, digits: "4829", color: "from-purple-900 to-indigo-900" },
  { id: "2", name: "Itaú Personnalité", bank: "Itaú", brand: "Visa Black", limitTotal: 35000, limitUsed: 6820.00, closingDay: 12, dueDay: 20, digits: "9102", color: "from-gray-900 to-black" },
  { id: "3", name: "Inter Black", bank: "Banco Inter", brand: "Mastercard", limitTotal: 20000, limitUsed: 1200.50, closingDay: 1, dueDay: 8, digits: "3319", color: "from-amber-700 to-orange-900" },
];

export default function CardsPage() {
  const [cards, setCards] = useState<CardItem[]>(defaultCards);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [brand, setBrand] = useState("Mastercard");
  const [limitTotal, setLimitTotal] = useState("");
  const [closingDay, setClosingDay] = useState("5");
  const [dueDay, setDueDay] = useState("12");
  const [digits, setDigits] = useState("1234");
  const [toastSuccess, setToastSuccess] = useState(false);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !limitTotal) return;

    const newCard: CardItem = {
      id: Date.now().toString(),
      name,
      bank: bank || "Banco Emissor",
      brand,
      limitTotal: parseFloat(limitTotal),
      limitUsed: 0,
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay),
      digits: digits || "9999",
      color: "from-indigo-900 to-slate-900",
    };

    setCards([newCard, ...cards]);
    setIsModalOpen(false);
    setName("");
    setBank("");
    setLimitTotal("");
    setToastSuccess(true);
    setTimeout(() => setToastSuccess(false), 3000);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

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
            Novo Cartão cadastrado com sucesso!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-indigo-400" />
            Gestão de Cartões de Crédito & Faturas
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Controle limites disponíveis, datas de fechamento e vencimento de faturas.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Novo Cartão
        </button>
      </div>

      {/* Cards List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const availableLimit = card.limitTotal - card.limitUsed;
          const usedPercent = Math.round((card.limitUsed / card.limitTotal) * 100);

          return (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${card.color} border border-gray-700/60 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[220px] relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-300 block">{card.bank}</span>
                  <h3 className="text-lg font-black text-white">{card.name}</h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white">
                  {card.brand}
                </span>
              </div>

              <div className="my-4">
                <span className="text-xs text-gray-300 block">Fatura Atual em Aberto</span>
                <p className="text-2xl font-black text-white">{formatCurrency(card.limitUsed)}</p>
              </div>

              {/* Progress Limit Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-gray-300">
                  <span>Limite Usado ({usedPercent}%)</span>
                  <span>Disponível: {formatCurrency(availableLimit)}</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full"
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 text-xs text-gray-300 border-t border-white/10">
                <span>Fecha dia {card.closingDay}</span>
                <span>Vence dia {card.dueDay}</span>
                <span className="font-mono">•••• {card.digits}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Novo Cartão */}
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
                <h3 className="text-lg font-bold">Cadastrar Novo Cartão de Crédito</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Nome do Cartão
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Nubank Violeta, C6 Carbon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Instituição / Banco
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Nubank, Bradesco"
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Bandeira
                    </label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Mastercard">Mastercard</option>
                      <option value="Visa">Visa</option>
                      <option value="Elo">Elo</option>
                      <option value="Amex">American Express</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Limite Total (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="10000.00"
                      value={limitTotal}
                      onChange={(e) => setLimitTotal(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Dia Fechamento
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={closingDay}
                      onChange={(e) => setClosingDay(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Dia Vencimento
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dueDay}
                      onChange={(e) => setDueDay(e.target.value)}
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
                    Salvar Cartão
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
