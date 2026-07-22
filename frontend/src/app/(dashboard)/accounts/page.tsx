"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Landmark, Plus, ArrowLeftRight, CheckCircle2, X } from "lucide-react";

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
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // New account form
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [type, setType] = useState("Conta Corrente");
  const [balance, setBalance] = useState("");

  // Transfer form
  const [fromAcc, setFromAcc] = useState(defaultAccounts[0]?.id || "1");
  const [toAcc, setToAcc] = useState(defaultAccounts[1]?.id || "2");
  const [transferAmount, setTransferAmount] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newAcc: AccountItem = {
      id: Date.now().toString(),
      name,
      bank: bank || "Banco Geral",
      type,
      balance: balance ? parseFloat(balance) : 0,
      currency: "BRL",
    };

    setAccounts([newAcc, ...accounts]);
    setIsAccountModalOpen(false);
    setName("");
    setBank("");
    setBalance("");
    setToastMessage("Nova Conta bancária criada com sucesso!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || fromAcc === toAcc) return;

    const amountVal = parseFloat(transferAmount);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAcc) return { ...acc, balance: acc.balance - amountVal };
        if (acc.id === toAcc) return { ...acc, balance: acc.balance + amountVal };
        return acc;
      })
    );

    setIsTransferModalOpen(false);
    setTransferAmount("");
    setToastMessage("Transferência realizada com sucesso!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-medium text-sm"
          >
            <CheckCircle2 className="h-5 w-5" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
            <Landmark className="h-7 w-7 text-indigo-400" />
            Contas Bancárias, Carteiras & PIX
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gerencie o saldo de suas contas bancárias e efetue transferências entre elas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="h-4 w-4 text-indigo-400" />
            Transferência entre Contas
          </button>
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
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

      {/* Modal Nova Conta */}
      <AnimatePresence>
        {isAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                <h3 className="text-lg font-bold">Cadastrar Nova Conta Bancária</h3>
                <button onClick={() => setIsAccountModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Nome da Conta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Itaú PJ, NuConta Reserva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Banco / Instituição</label>
                    <input
                      type="text"
                      placeholder="Ex: Itaú, Bradesco, Inter"
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Tipo de Conta</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Conta Corrente">Conta Corrente</option>
                      <option value="Conta Digital">Conta Digital</option>
                      <option value="Carteira">Dinheiro Físico</option>
                      <option value="Corretora">Corretora / Investimentos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Saldo Inicial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAccountModalOpen(false)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20">
                    Salvar Conta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Transferência */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-indigo-400" />
                  Transferência entre Contas
                </h3>
                <button onClick={() => setIsTransferModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Conta de Origem (Sairá dinheiro)</label>
                  <select
                    value={fromAcc}
                    onChange={(e) => setFromAcc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Conta de Destino (Receberá dinheiro)</label>
                  <select
                    value={toAcc}
                    onChange={(e) => setToAcc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Valor da Transferência (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20">
                    Confirmar Transferência
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
