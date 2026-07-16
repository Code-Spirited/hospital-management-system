// ─────────────────────────────────────────────────────────────────────────────
// apiClient.js
//
// Shared Axios instance every service file will eventually call through.
// No service function actually invokes this yet (see each service
// file's own header) — it exists fully configured and ready, so wiring
// in a real backend later is a one-line change per function, not a
// redesign.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

// Vite only exposes env vars prefixed VITE_ to client code
// (import.meta.env.VITE_*). Falls back to a sensible localhost default
// so nothing requires creating a .env file today.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — the one place a real auth token would be
// attached to every outgoing request, once this app has real
// authentication (Login.jsx is currently cosmetic).
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("hms_auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — centralizes what happens on a failed request,
// rather than every future service function needing its own handling
// for the same handful of cases.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "API request unauthorized (401) — no real auth system exists yet.",
      );
    }
    return Promise.reject(error);
  },
);

export default apiClient;
