const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const BASIC_AUTH = import.meta.env.VITE_API_BASIC_AUTH || "";

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (BASIC_AUTH) {
    headers["X-Tunnel-Authorization"] = `Basic ${BASIC_AUTH}`;
  }
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function tunnelFetch(url: string, options: RequestInit): Promise<Response> {
  let res = await fetch(url, options);
  // If tunnel returns 401, it needs basic auth - retry with basic auth in Authorization header
  if (res.status === 401 && BASIC_AUTH) {
    const headers = { ...(options.headers as Record<string, string>) };
    headers["Authorization"] = `Basic ${BASIC_AUTH}`;
    res = await fetch(url, { ...options, headers });
  }
  return res;
}

export async function apiPost(path: string, body: Record<string, unknown>) {
  const res = await tunnelFetch(`${API_URL}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function apiGet(path: string) {
  const res = await tunnelFetch(`${API_URL}${path}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function apiPut(path: string, body: Record<string, unknown>) {
  const res = await tunnelFetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// Auth helpers
export function setAuth(token: string, username: string, userId: number) {
  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
  localStorage.setItem("userId", String(userId));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
}

export function getUsername(): string {
  return localStorage.getItem("username") || "";
}
