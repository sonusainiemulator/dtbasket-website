import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import type { CartStoreItem, ProductItem, Cart, CartItem } from "@/types";

const initialCart: Cart = { items: [], total_items: 0, subtotal: 0, total: 0 };

function recalc(items: CartStoreItem[]): Pick<Cart, "subtotal" | "total" | "total_items"> {
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const total_items = items.reduce((s, i) => s + i.quantity, 0);
  return { subtotal, total: subtotal, total_items };
}

interface CartState {
  cart: Cart;
  isOpen: boolean;
}

const initialState: CartState = { cart: initialCart, isOpen: false };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<{ product: ProductItem; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload;
      const price = product.final_price ?? product.price;
      const items = state.cart.items as CartStoreItem[];
      const existingIdx = items.findIndex((i) => i.product_id === product.id);

      if (existingIdx >= 0) {
        const item = items[existingIdx];
        item.quantity += quantity;
        item.subtotal = item.quantity * item.price;
      } else {
        items.push({
          id: `local-${product.id}`,
          product,
          product_id: product.id,
          quantity,
          price,
          subtotal: price * quantity,
          delivery_charges: product.regular_delivery_charges ?? 0,
          handling_charges: 0,
          variation: {},
        });
      }
      Object.assign(state.cart, recalc(items));
    },

    removeItem(state, action: PayloadAction<number>) {
      state.cart.items = state.cart.items.filter(
        (i) => i.product_id !== action.payload,
      );
      Object.assign(state.cart, recalc(state.cart.items as CartStoreItem[]));
    },

    updateQty(state, action: PayloadAction<{ productId: number; quantity: number }>) {
      const { productId, quantity } = action.payload;
      const item = state.cart.items.find(
        (i) => i.product_id === productId,
      ) as CartStoreItem | undefined;
      if (item) {
        item.quantity = quantity;
        item.subtotal = item.price * quantity;
        Object.assign(state.cart, recalc(state.cart.items as CartStoreItem[]));
      }
    },

    clearCart(state) {
      state.cart = initialCart;
    },

    openCart(state) { state.isOpen = true; },
    closeCart(state) { state.isOpen = false; },
    toggleCart(state) { state.isOpen = !state.isOpen; },

    syncFromServer(state, action: PayloadAction<CartItem[]>) {
      const items: CartStoreItem[] = action.payload.map((si) => ({
        id: si.id,
        product_id: si.item_id,
        product: {
          id: si.item_id,
          name: si.item_title,
          portrait_img: si.item_image,
          landscape_img: si.item_image,
          final_price: si.item_price,
          price: si.item_price,
          unit: si.item_unit,
          per_unit: si.item_per_unit,
          total_stock: si.item_total_stock,
          enable_stock: si.item_enable_stock,
        } as ProductItem,
        quantity: si.quantity,
        price: si.item_price,
        subtotal: si.total_price,
      }));
      state.cart = { ...state.cart, items, ...recalc(items) };
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQty,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
  syncFromServer,
} = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartItems = (state: RootState) => state.cart.cart.items;
export const selectCartSubtotal = (state: RootState) => state.cart.cart.subtotal;
export const selectCartTotalItems = (state: RootState) => state.cart.cart.total_items;
export const selectCartIsOpen = (state: RootState) => state.cart.isOpen;
