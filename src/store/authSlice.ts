import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import type { RootState } from "./index";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  customerId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isModalOpen: boolean;
}

const initialState: AuthState = {
  user: null,
  customerId: null,
  isAuthenticated: false,
  isLoading: false,
  isModalOpen: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    login(state, action: PayloadAction<{ user: User; customerId: string }>) {
      const { user, customerId } = action.payload;
      Cookies.set("customer_id", customerId, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      state.user = user;
      state.customerId = customerId;
      state.isAuthenticated = true;
      state.isModalOpen = false;
    },
    logout(state) {
      Cookies.remove("auth_token");
      Cookies.remove("customer_id");
      state.user = null;
      state.customerId = null;
      state.isAuthenticated = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    openModal(state) {
      state.isModalOpen = true;
    },
    closeModal(state) {
      state.isModalOpen = false;
    },
  },
});

export const { setUser, login, logout, setLoading, openModal, closeModal } =
  authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectCustomerId = (state: RootState) => state.auth.customerId;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectIsModalOpen = (state: RootState) => state.auth.isModalOpen;
