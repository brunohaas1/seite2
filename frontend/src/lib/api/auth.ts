// localStorage access helpers — safe to call from interceptors.

const TOKEN_KEY = "token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  // Also set an httpOnly-style cookie for Next.js middleware to read
  document.cookie = `auth_token=${token}; path=/; SameSite=Lax; max-age=${30 * 24 * 60 * 60}`;
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem("user");
  document.cookie = "auth_token=; path=/; max-age=0";
}

export function logoutAndRedirect(): void {
  clearAuthToken();
  if (typeof window !== "undefined") window.location.assign("/login");
}
