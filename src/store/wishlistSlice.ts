import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import type { ProductItem } from "@/types";

interface WishlistState {
  items: ProductItem[];
}

const initialState: WishlistState = { items: [] };

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist(state, action: PayloadAction<ProductItem>) {
      state.items.push(action.payload);
    },
    removeFromWishlist(state, action: PayloadAction<number>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    clearWishlist(state) {
      state.items = [];
    },
    syncWishlist(state, action: PayloadAction<ProductItem[]>) {
      state.items = action.payload;
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, syncWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;

// Selectors
export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectIsInWishlist = (productId: number) => (state: RootState) =>
  state.wishlist.items.some((p) => p.id === productId);
