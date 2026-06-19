"use client";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  addItem, removeItem, updateQty, clearCart,
  openCart, closeCart, toggleCart,
  selectCart, selectCartIsOpen,
} from "./cartSlice";
import type { CartStoreItem, ProductItem } from "@/types";
import { cartService } from "@/services/cartService";
import toast from "react-hot-toast";

export function useCartStore() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const isOpen = useAppSelector(selectCartIsOpen);

  return {
    cart,
    isOpen,

    addItem: (product: ProductItem, quantity = 1) => {
      dispatch(addItem({ product, quantity }));
      toast.success(`${product.name} added to cart`);
      cartService.addToCart(product.id, quantity, product.final_price ?? product.price).catch(() => null);
    },

    removeItem: (productId: number) => {
      dispatch(removeItem(productId));
      cartService.removeFromCart(productId).catch(() => null);
    },

    updateQuantity: (productId: number, quantity: number) => {
      if (quantity < 1) {
        dispatch(removeItem(productId));
        cartService.removeFromCart(productId).catch(() => null);
        return;
      }
      dispatch(updateQty({ productId, quantity }));
      cartService.updateQuantity(productId, quantity).catch(() => null);
    },

    clearCart: () => {
      const itemIds = (cart.items as CartStoreItem[]).map((i) => i.product_id);
      dispatch(clearCart());
      itemIds.forEach((id) => cartService.removeFromCart(id).catch(() => null));
    },
    openCart: () => dispatch(openCart()),
    closeCart: () => dispatch(closeCart()),
    toggleCart: () => dispatch(toggleCart()),
  };
}
