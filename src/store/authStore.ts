"use client";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  setUser, login, logout, setLoading, openModal, closeModal,
  selectUser, selectCustomerId, selectIsAuthenticated, selectIsLoading, selectIsModalOpen,
} from "./authSlice";
import { clearCart } from "./cartSlice";
import { clearWishlist } from "./wishlistSlice";
import { persistor } from "./index";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@/types";

export function useAuthStore() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const customerId = useAppSelector(selectCustomerId);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const isModalOpen = useAppSelector(selectIsModalOpen);

  return {
    user,
    customerId,
    isAuthenticated,
    isLoading,
    isModalOpen,
    setUser: (u: User) => dispatch(setUser(u)),
    login: (u: User, id: string) => dispatch(login({ user: u, customerId: id })),
    logout: () => {
      dispatch(logout());
      dispatch(clearCart());
      dispatch(clearWishlist());
      queryClient.removeQueries({ queryKey: ["cart"] });
      queryClient.removeQueries({ queryKey: ["wishlist"] });
      persistor.purge();   // wipes redux-persist localStorage
    },
    setLoading: (loading: boolean) => dispatch(setLoading(loading)),
    openModal: () => dispatch(openModal()),
    closeModal: () => dispatch(closeModal()),
  };
}
