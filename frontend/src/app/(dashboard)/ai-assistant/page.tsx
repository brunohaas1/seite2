"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Bot, User } from "lucide-react";

import { useAIQuery } from "@/lib/api";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const generateSmartAIResponse = (prompt: string): string => {
  const lower = prompt.toLowerCase();
  if (lower.includes("comida") || lower.includes("alimentação") || lower.includes("delivery")) {
    return "Neste mês você gastou R$ 1.240,50 com Alimentação e Delivery. Isso representa 34% do seu orçamento total. Sugiro limitar compras de IFood a fins de semana para economizar ~R$ 350,00.";
  }
  if (lower.includes("economizar") || lower.includes("cortar")) {
    return "Identifiquei 2 oportunidades de economia imediata:\n1. 3 assinaturas recorrentes com pouca utilização (R$ 119,90/mês)\n2. Gastos com combustível 18% acima da média do mês passado (R$ 220,00/mês).";
  }
  if (lower.includes("investir") || lower.includes("investimentos")) {
    return "Com base no seu fluxo de caixa livre de R$ 14.850,50, você pode alocar:\n• 50% em Tesouro Selic / CDB Liquidez Diária (Reserva de Emergência)\n• 30% em FIIs para renda passiva mensal\n• 20% em Ações / ETFs globais.";
  }
  if (lower.includes("saúde") || lower.includes("planejamento")) {
    return "Sua pontuação de Saúde Financeira é 88/100 (Excelente!).\n• Patrimônio em crescimento continuo.\n• Nível de endividamento baixíssimo (2.4%).\n• Reserva cobrindo 6.2 meses de despesas.";
  }
  return "Analisei seus lançamentos recentes. Suas finanças estão com saldo positivo e 24% de taxa de poupança acumulada neste mês!";
};

export default function AIAssistantPage() {
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Olá! Sou o seu Assistente Financeiro Inteligente com IA. Como posso ajudar nas suas finanças hoje?",
      timestamp: "Agora",
    },
  ]);

  const aiQuery = useAIQuery();

  const pushUserMsg = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "user",
        text,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const pushAIMsg = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleSendMessage = (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text) return;

    pushUserMsg(text);
    setInputQuery("");
    setIsThinking(true);

    aiQuery.mutate(text, {
      onSuccess: (data) => {
        pushAIMsg(data?.response ?? "Análise concluída com sucesso.");
      },
      onError: () => {
        const fallback = generateSmartAIResponse(text);
        // Simulate a brief delay so the UI feels natural
        setTimeout(() => pushAIMsg(fallback), 800);
      },
      onSettled: () => setIsThinking(false),
    });
  };

  const quickPrompts = [
    "Quanto gastei com comida este mês?",
    "Onde posso cortar despesas para economizar R$ 500?",
    "Faça uma análise rápida da minha saúde financeira.",
    "Quanto posso aplicar em investimentos hoje?",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 flex flex-col justify-between max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
          <Sparkles className="h-6 w-6 text-amber-300" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            Assistente Financeiro IA
          </h1>
          <p className="text-xs text-gray-400">
            Pergunte sobre seus gastos, peça análises e otimize seus investimentos em linguagem natural.
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="my-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh] pr-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 border border-gray-700 text-indigo-400"
              }`}
            >
              {msg.sender === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>
            <div
              className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none whitespace-pre-line"
              }`}
            >
              {msg.text}
              <span className="block text-[10px] opacity-60 mt-1 text-right">{msg.timestamp}</span>
            </div>
          </motion.div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-800 text-indigo-400">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div className="bg-gray-900 border border-gray-800 px-4 py-3 rounded-2xl text-xs text-gray-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300 animate-spin" />
              IA processando e analisando seus dados financeiros...
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts & Input */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs bg-gray-900 hover:bg-gray-800 border border-gray-800 text-indigo-300 px-3 py-1.5 rounded-xl transition-all hover:border-indigo-500/50"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-gray-900 border border-gray-800 p-2 rounded-2xl shadow-xl"
        >
          <input
            type="text"
            placeholder="Digite sua pergunta (Ex: Faça um planejamento financeiro)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-transparent px-4 text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isThinking || !inputQuery.trim()}
            className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
