"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Shield, Bell, Globe, Moon, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [currency, setCurrency] = useState("BRL");
  const [language, setLanguage] = useState("pt-BR");
  const [twoFactor, setTwoFactor] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
          <Settings className="h-7 w-7 text-indigo-400" />
          Configurações do Perfil & Preferências
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gerencie seu perfil, preferências de moeda, idioma, notificações e segurança da conta.
        </p>
      </div>

      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-6">
        {/* Profile Info */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-800">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-indigo-500/20">
            B
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Bruno Haas</h2>
            <p className="text-xs text-gray-400">bruno@seite2.com • Conta Pro Enterprise</p>
          </div>
        </div>

        {/* Currency & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Moeda Principal</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="BRL">Real Brasileiro (R$ - BRL)</option>
              <option value="USD">Dólar Americano ($ - USD)</option>
              <option value="EUR">Euro (€ - EUR)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Idioma da Interface</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (United States)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
        </div>

        {/* Security 2FA */}
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-white text-sm block">Autenticação de Dois Fatores (2FA)</span>
            <span className="text-xs text-gray-400">Adicione uma camada extra de segurança à sua conta com TOTP / Google Authenticator.</span>
          </div>
          <input
            type="checkbox"
            checked={twoFactor}
            onChange={() => setTwoFactor(!twoFactor)}
            className="h-5 w-5 rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Configurações Salvas com Sucesso!
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Salvar Preferências
            </>
          )}
        </button>
      </div>
    </div>
  );
}
