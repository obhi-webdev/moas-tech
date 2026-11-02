import { API_URL } from "./api";

const TOKEN_KEY = "vc-tech-admin-token";

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveAdminToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function logoutAdmin() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function adminRequest(endpoint, options = {}) {
  const token = getAdminToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}
