import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { CONFIG } from "@/branding";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

console.log("🚀 API_BASE_URL:", API_BASE_URL); // Debug log

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: CONFIG.apiTimeout,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

/* ─── Request — log and attach customer_id ────────────────────────────────────────── */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log("📤 Request:", config.baseURL + config.url, config.data); // Debug log
    const customerId = Cookies.get("customer_id");

    // Inject customer_id into POST body if not already present
    if (config.method === "post" && customerId) {
      if (config.data && typeof config.data === "object" && !Array.isArray(config.data)) {
        if (!config.data.customer_id) {
          config.data = { ...config.data, customer_id: customerId };
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Response — log and handle 401 ──────────────────────────────────────────────── */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("📥 Response:", response.config.url, response.data); // Debug log
    return response;
  },
  async (error: AxiosError) => {
    console.error("❌ Error:", error.config?.url, error.response?.data, error.message); // Debug log
    if (error.response?.status === 401) {
      Cookies.remove("auth_token");
      Cookies.remove("customer_id");
      if (typeof window !== "undefined") window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
