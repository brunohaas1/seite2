"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Landmark, Plus, ArrowLeftRight, CheckCircle2, QrCode } from "lucide-react";

interface AccountItem {
  id: string;
  name: string;
  bank: string;
  type: string;
  balance: number;
  currency: string;
}

const defaultAccounts: AccountItem[] = [
  { id: "1", name: "Conta Corrente Itaú", bank: "Itaú Unibanco", type: "Conta Corrente", balance: 14500.00, currency: "BRL" },
  { id: "2", name: "Reserva NuConta", bank: "Nubank", type: "Conta Digital", balance: 28400.50, currency: "BRL" },
  { id: "3", name: "Carteira Dinheiro Físico", bank: "Carteira", type: "Dinheiro", balance: 450.00, currency: "BRL" },
  { id: "4", name: "Conta Investimentos XP", bank: "XP Investimentos", type: "Corretora", balance: 48900.00, currency: "BRL" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>(defaultAccounts);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
            <Landmark className="h-7 w-7 text-indigo-400" />
            Contas Bancárias, Carteiras & PIX
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gerencie o saldo de suas contas bancárias, contas de investimento e efetue transferências PIX.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold rounded-xl transition-colors">
            <ArrowLeftRight className="h-4 w-4" />
            Transferência entre Contas
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
            <Plus className="h-4 w-4" />
            Nova Conta
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => (
          <motion.div
            key={acc.id}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase">{acc.type}</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{acc.name}</h3>
              <p className="text-xs text-gray-400">{acc.bank}</p>
            </div>
            <div className="pt-2 border-t border-gray-800">
              <span className="text-xs text-gray-400 block">Saldo Disponível</span>
              <p className="text-2xl font-black text-emerald-400">{formatCurrency(acc.balance)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
