import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { User, ApiResponse } from "@/types";
import Cookies from "js-cookie";

/**
 * Login types (from Flutter: type => 1-OTP, 2-Google, 3-Apple, 4-Normal)
 */
export const LOGIN_TYPE = {
  OTP: "1",
  GOOGLE: "2",
  APPLE: "3",
  NORMAL: "4",
} as const;

/** Device type (1=Android / 2=iOS / 3=Web) */
const DEVICE_TYPE = "3";
const DEVICE_TOKEN = "web";

/* ─── Response shape from Flutter API ──────────────────────────────────────── */
export interface FlutterLoginResult {
  id: number;
  is_seller: number;
  user_name: string | null;
  full_name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_number: string | null;
  country_name: string | null;
  image: string | null;
  device_type: number;
  device_token: string | null;
  wallet_amount: number;
  type: number;
  status: number;
}

export interface FlutterLoginResponse {
  status: number;   // 200 = success
  message: string;
  result: FlutterLoginResult[] | null;
}

export interface FlutterSuccessResponse {
  status: number;
  message: string;
}

/* ─── Auth Service ──────────────────────────────────────────────────────────── */
export const authService = {

  /**
   * Step 1 — Phone login (OTP flow)
   * POST /login  { type:1, mobile_number, country_code, country_name, device_type, device_token }
   * → API sends OTP via Firebase; this call registers the mobile with the backend.
   */
  loginWithOTP: async (
    mobileNumber: string,
    countryCode: string = "+91",
    countryName: string = "India"
  ): Promise<FlutterLoginResponse> => {
    const { data } = await apiClient.post<FlutterLoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        type: LOGIN_TYPE.OTP,
        mobile_number: mobileNumber,
        country_code: countryCode,
        country_name: countryName,
        device_name: "web",
        device_type: DEVICE_TYPE,
        device_token: DEVICE_TOKEN,
      }
    );
    return data;
  },

  /**
   * Normal email/password login
   * POST /login  { type:4, email, password, device_type, device_token }
   */
  normalLogin: async (
    email: string,
    password: string
  ): Promise<FlutterLoginResponse> => {
    const { data } = await apiClient.post<FlutterLoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        type: LOGIN_TYPE.NORMAL,
        email,
        password,
        device_type: DEVICE_TYPE,
        device_token: DEVICE_TOKEN,
      }
    );
    return data;
  },

  /**
   * Google / social login
   * POST /login  { type:2, email, full_name, device_type, device_token }
   */
  loginWithGoogle: async (
    email: string,
    fullName: string
  ): Promise<FlutterLoginResponse> => {
    const { data } = await apiClient.post<FlutterLoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        type: LOGIN_TYPE.GOOGLE,
        email,
        full_name: fullName,
        device_type: DEVICE_TYPE,
        device_token: DEVICE_TOKEN,
      }
    );
    return data;
  },

  /**
   * Register
   * POST /registration
   */
  register: async (params: {
    full_name: string;
    email: string;
    mobile_number: string;
    password: string;
    country_code?: string;
    country_name?: string;
  }): Promise<FlutterLoginResponse> => {
    const { data } = await apiClient.post<FlutterLoginResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        ...params,
        country_code: params.country_code ?? "+91",
        country_name: params.country_name ?? "India",
        device_type: DEVICE_TYPE,
        device_token: DEVICE_TOKEN,
      }
    );
    return data;
  },

  /**
   * Forgot password
   * POST /forgot_password  { email }
   */
  forgotPassword: async (email: string): Promise<FlutterSuccessResponse> => {
    const { data } = await apiClient.post<FlutterSuccessResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return data;
  },

  /**
   * Logout — clears local token (API logout not in Flutter source)
   */
  logout: async (): Promise<void> => {
    Cookies.remove("auth_token");
    Cookies.remove("dtbasket-auth");
  },

  /**
   * Get profile
   * POST /get_profile  { customer_id }
   */
  getProfile: async (customerId: string | number): Promise<ApiResponse> => {
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.ME, {
      customer_id: customerId,
    });
    return data;
  },

  /**
   * Save login result to store/cookie — called after successful login
   */
  persistUser: (result: FlutterLoginResult, token?: string): User => {
    const user: User = {
      id: result.id,
      name: result.full_name ?? result.user_name ?? "User",
      email: result.email ?? "",
      phone: result.mobile_number ?? undefined,
      role: result.is_seller === 1 ? "vendor" : "customer",
    };

    if (token) {
      Cookies.set("auth_token", token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
    // Store customer_id for API calls that need it
    Cookies.set("customer_id", String(result.id), {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return user;
  },
};
