import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { CONFIG } from "@/branding";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: CONFIG.apiTimeout,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

/* ─── Request — attach customer_id to every POST body ───────────────────────── */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

/* ─── Response — handle 401 ──────────────────────────────────────────────────── */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth_token");
      Cookies.remove("customer_id");
      if (typeof window !== "undefined") window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
