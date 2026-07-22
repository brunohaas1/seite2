"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Clock, AlertCircle } from "lucide-react";

interface CalendarEvent {
  id: string;
  day: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  status: "paid" | "pending";
}

const defaultEvents: CalendarEvent[] = [
  { id: "1", day: 5, title: "Salário / Proventos", amount: 15000, type: "income", status: "paid" },
  { id: "2", day: 10, title: "Fatura Cartão Nubank", amount: 2450.80, type: "expense", status: "pending" },
  { id: "3", day: 15, title: "Aluguel & Condomínio", amount: 2800, type: "expense", status: "pending" },
  { id: "4", day: 20, title: "Recebimento Projeto SaaS", amount: 3500, type: "income", status: "pending" },
  { id: "5", day: 25, title: "Conta de Energia / Luz", amount: 320.50, type: "expense", status: "pending" },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
          <CalendarIcon className="h-7 w-7 text-indigo-400" />
          Agenda Financeira & Vencimentos
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Acompanhe no calendário mensal o vencimento de faturas, contas a pagar e receitas previstas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Julho 2026</h2>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400 mb-2">
            <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const dayEvents = events.filter((e) => e.day === day);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={day}
                  className={`min-h-[64px] p-1.5 rounded-xl border flex flex-col justify-between text-left text-xs transition-all ${
                    hasEvents
                      ? "bg-gray-800/80 border-indigo-500/50 shadow-md"
                      : "bg-gray-900/40 border-gray-800 text-gray-500"
                  }`}
                >
                  <span className={`font-bold ${hasEvents ? "text-indigo-300" : ""}`}>{day}</span>
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`px-1 py-0.5 rounded text-[10px] font-bold truncate ${
                        ev.type === "income" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      }`}
                      title={`${ev.title}: ${formatCurrency(ev.amount)}`}
                    >
                      {ev.type === "income" ? "+" : "-"}{formatCurrency(ev.amount)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Bills List */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Contas a Vencer no Mês
          </h2>

          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="p-3 bg-gray-800/50 border border-gray-700/40 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{ev.title}</p>
                  <span className="text-xs text-gray-400">Dia {ev.day} de Julho</span>
                </div>
                <span className={`text-sm font-extrabold ${ev.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                  {ev.type === "income" ? "+" : "-"}{formatCurrency(ev.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
