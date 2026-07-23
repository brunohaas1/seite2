import axios, { AxiosError } from "axios";
import { getAuthToken, logoutAndRedirect } from "./auth";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api/v1",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: inject Bearer token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap body, normalize errors, handle 401.
// The interceptor returns `response.data`, so every request resolves to the
// parsed JSON body (not the AxiosResponse wrapper).
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      logoutAndRedirect();
    }
    const detail =
      (error.response?.data as { detail?: string } | undefined)?.detail ??
      error.message ??
      "Erro de conexão com o servidor.";
    return Promise.reject(Object.assign(new Error(detail), { status }));
  },
);

// Typed helpers that reflect the interceptor's unwrap (returns the JSON body).
export async function apiGet<T>(url: string, config?: Parameters<typeof apiClient.get>[1]): Promise<T> {
  return (await apiClient.get(url, config)) as unknown as T;
}

export async function apiPost<T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.post>[2]): Promise<T> {
  return (await apiClient.post(url, data, config)) as unknown as T;
}

export async function apiPut<T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.put>[2]): Promise<T> {
  return (await apiClient.put(url, data, config)) as unknown as T;
}

export async function apiDelete<T>(url: string, config?: Parameters<typeof apiClient.delete>[1]): Promise<T> {
  return (await apiClient.delete(url, config)) as unknown as T;
}
