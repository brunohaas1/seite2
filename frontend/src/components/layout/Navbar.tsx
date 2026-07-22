"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ScanText, Sparkles, TrendingUp,
  FileSpreadsheet, Target, Calendar, FileText,
  CreditCard, Landmark, Tags, Settings, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Cartões", href: "/cards", icon: CreditCard },
    { name: "Contas", href: "/accounts", icon: Landmark },
    { name: "Categorias", href: "/categories", icon: Tags },
    { name: "OCR", href: "/ocr", icon: ScanText },
    { name: "IA Assistant", href: "/ai-assistant", icon: Sparkles },
    { name: "Investir", href: "/investments", icon: TrendingUp },
    { name: "Importar", href: "/import", icon: FileSpreadsheet },
    { name: "Metas", href: "/budgets-goals", icon: Target },
    { name: "Agenda", href: "/calendar", icon: Calendar },
    { name: "Relatórios", href: "/reports", icon: FileText },
    { name: "Ajustes", href: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-lg text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
              S2
            </div>
            <div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                Seite2
              </span>
              <span className="hidden sm:block text-[10px] text-gray-400 font-medium -mt-1">
                Financial SaaS Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-950/60 p-1.5 rounded-2xl border border-gray-800/80">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? "text-white shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-4 w-4 ${isActive ? "text-amber-300" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right User Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="p-2.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-colors"
              title="Sair da Conta"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-gray-800 text-gray-300 hover:text-white rounded-xl"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-b border-gray-800 bg-gray-900 px-4 pt-2 pb-4 space-y-2"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair da Conta</span>
          </button>
        </motion.div>
      )}
    </header>
  );
}
