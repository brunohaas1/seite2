import { useToastStore } from "./store";

export function useToast() {
  const show = useToastStore((s) => s.show);
  return {
    success: (msg: string, ms?: number) => show(msg, "success", ms),
    error: (msg: string, ms?: number) => show(msg, "error", ms ?? 4000),
    info: (msg: string, ms?: number) => show(msg, "info", ms),
  };
}
