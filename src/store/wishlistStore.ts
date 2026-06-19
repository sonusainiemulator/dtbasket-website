"use client";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  addToWishlist, removeFromWishlist, clearWishlist,
  selectWishlistItems,
} from "./wishlistSlice";
import type { ProductItem } from "@/types";
import { wishlistService } from "@/services/wishlistService";
import { queryClient } from "@/lib/queryClient";
import toast from "react-hot-toast";

export function useWishlistStore() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);

  const invalidateWishlist = () =>
    queryClient.invalidateQueries({ queryKey: ["wishlist"] });

  return {
    items,

    addItem: (product: ProductItem) => {
      dispatch(addToWishlist(product));
      toast.success("Added to wishlist");
      wishlistService.toggleWishlist(product.id)
        .then(() => invalidateWishlist())
        .catch(() => {
          dispatch(removeFromWishlist(product.id));
          toast.error("Failed to add to wishlist");
        });
    },

    removeItem: (productId: number) => {
      const removed = items.find((p) => p.id === productId);
      dispatch(removeFromWishlist(productId));
      toast.success("Removed from wishlist");
      wishlistService.toggleWishlist(productId)
        .then(() => invalidateWishlist())
        .catch(() => {
          if (removed) dispatch(addToWishlist(removed));
          toast.error("Failed to remove from wishlist");
        });
    },

    isInWishlist: (productId: number) => items.some((p) => p.id === productId),

    toggleItem: (product: ProductItem) => {
      const isWishlisted = items.some((p) => p.id === product.id);
      if (isWishlisted) {
        const removed = items.find((p) => p.id === product.id);
        dispatch(removeFromWishlist(product.id));
        toast.success("Removed from wishlist");
        wishlistService.toggleWishlist(product.id)
          .then(() => invalidateWishlist())
          .catch(() => {
            if (removed) dispatch(addToWishlist(removed));
            toast.error("Failed to remove from wishlist");
          });
      } else {
        dispatch(addToWishlist(product));
        toast.success("Added to wishlist");
        wishlistService.toggleWishlist(product.id)
          .then(() => invalidateWishlist())
          .catch(() => {
            dispatch(removeFromWishlist(product.id));
            toast.error("Failed to add to wishlist");
          });
      }
    },

    clearWishlist: () => dispatch(clearWishlist()),
  };
}
