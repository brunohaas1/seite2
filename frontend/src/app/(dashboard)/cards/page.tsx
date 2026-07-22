"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Calendar, Plus, AlertCircle, CheckCircle2, ChevronRight, DollarSign } from "lucide-react";

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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-indigo-400" />
            Gestão de Cartões de Crédito & Faturas
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Controle limites disponíveis, datas de fechamento, vencimento de faturas e compras parceladas.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
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
    </div>
  );
}
