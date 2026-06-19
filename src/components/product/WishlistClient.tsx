"use client";
import { useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiRefreshCw } from "react-icons/fi";
import { useWishlist } from "@/hooks/useApi";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useAppDispatch } from "@/store/hooks";
import { syncWishlist } from "@/store/wishlistSlice";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

export default function WishlistClient() {
  const { isAuthenticated, openModal } = useAuthStore();

  /* Always fetch fresh from API on mount (staleTime: 0 in hook) */
  const { data, isLoading, isFetching, refetch } = useWishlist(1);

  const dispatch = useAppDispatch();
  const { items } = useWishlistStore();

  /* Sync API response into local store */
  useEffect(() => {
    if (data?.result) dispatch(syncWishlist(data.result));
  }, [data, dispatch]);

  /* Not logged in */
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <FiHeart size={36} className="text-red-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-dm-muted mb-2">Your Wishlist</h2>
        <p className="text-gray-400 dark:text-dm-muted mb-6 text-sm">Sign in to view and manage your wishlist</p>
        <button onClick={openModal} className="btn-primary">Sign In</button>
      </div>
    );
  }

  /* Use API data as source of truth; fall back to local store while loading */
  const products = data?.result ?? items;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="section-title">My Wishlist</h1>
          {!isLoading && (
            <span className="text-sm text-gray-400">({products.length} items)</span>
          )}
        </div>
        {/* Manual refresh button */}
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-700 transition-colors disabled:opacity-50"
          aria-label="Refresh wishlist">
          <FiRefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <FiHeart size={36} className="text-red-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 dark:text-dm-muted mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 dark:text-dm-muted mb-6 text-sm">Save your favourite items here</p>
          <Link href="/" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        /* Product grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}