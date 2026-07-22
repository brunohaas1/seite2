"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Sparkles, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "demo@seite2.com",
      password: "password123",
    },
  });

  const handleLoginOrRegister = async (data: LoginForm) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Tentar Login
      let res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // 2. Se a conta não existir, tentar registrar automaticamente
      if (!res.ok && res.status === 401) {
        const regRes = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            name: data.email.split("@")[0] || "Usuário",
          }),
        });

        if (regRes.ok) {
          const regJson = await regRes.json();
          if (regJson.access_token) {
            localStorage.setItem("token", regJson.access_token);
            localStorage.setItem("user", JSON.stringify(regJson.user));
            router.push("/dashboard");
            return;
          }
        }
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Falha na autenticação. Verifique seu e-mail e senha.");
      }

      const json = await res.json();
      if (json.access_token) {
        localStorage.setItem("token", json.access_token);
        localStorage.setItem("user", JSON.stringify(json.user));
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro de conexão com a API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setValue("email", "demo@seite2.com");
    setValue("password", "password123");
    await handleLoginOrRegister({
      email: "demo@seite2.com",
      password: "password123",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-gray-900 to-black p-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
            >
              Seite2
            </motion.h1>
            <p className="text-gray-400 text-sm mt-2">
              Sistema Financeiro & Gestão SaaS
            </p>
          </div>

          {/* Quick Demo Access Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDemoLogin}
            type="button"
            disabled={isLoading}
            className="w-full mb-6 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="h-5 w-5 text-amber-300" />
            Entrar em Modo Demonstração (1-Clique)
          </motion.button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-800 px-3 text-gray-400 font-medium">
                Ou entre com seus dados
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(handleLoginOrRegister)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900/60 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-300">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-700 bg-gray-900/60 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 text-sm shadow-md"
            >
              {isLoading ? "Entrando..." : "Entrar / Cadastrar"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}