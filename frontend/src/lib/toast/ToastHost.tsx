"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useToastStore } from "./store";

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colorMap = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-blue-600",
};

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = iconMap[t.kind];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${colorMap[t.kind]} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-medium text-sm`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {t.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
