import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { bannerService } from "@/services/bannerService";
import { cartService } from "@/services/cartService";
import { wishlistService } from "@/services/wishlistService";
import { orderService } from "@/services/orderService";
import { profileService } from "@/services/profileService";
import { promoService } from "@/services/promoService";
import { reviewService } from "@/services/reviewService";
import { generalService } from "@/services/generalService";
import { QUERY_KEYS } from "@/lib/constants";

import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";


// ─── Banner Hooks ─────────────────────────────────────────────────────────────
export function useHeroBanners(isHomeScreen: string, typeId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.HERO_BANNERS, isHomeScreen, typeId],
    queryFn: () => bannerService.getHeroBanners(isHomeScreen, typeId),
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
}

export function usePromoBanners() {
  return useQuery({
    queryKey: [QUERY_KEYS.PROMO_BANNERS],
    queryFn: bannerService.getPromoBanners,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
}

// ─── Home Sections ────────────────────────────────────────────────────────────

export function useGetType() {
  return useQuery({
    queryKey: ["getType"],
    queryFn: productService.getType,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}

export function useHomeSections(pageNo = 1, isHomeScreen = 1, typeId = 0) {
  return useQuery({
    queryKey: [QUERY_KEYS.SECTIONS, pageNo, isHomeScreen, typeId],
    queryFn: () => productService.getSections(pageNo, isHomeScreen, typeId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ─── Product Hooks ────────────────────────────────────────────────────────────
export function useProductDetail(itemId: number | string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_DETAIL, itemId],
    queryFn: () => productService.getItemDetails(itemId),
    enabled: !!itemId,
  });
}

export function useSimilarItems(itemId: number | string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "similar", itemId],
    queryFn: () => productService.getSimilarItems(itemId),
    enabled: !!itemId,
  });
}

export function useTopRatingItems(pageNo = 1) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "top-rating", pageNo],
    queryFn: () => productService.getTopRatingItems(pageNo),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchItems(query: string, pageNo = 1) {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH, query, pageNo],
    queryFn: () => productService.searchItems(query, pageNo),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useItemsByCategory(
  categoryId: number | string,
  subCategoryId: number | string = 0,
  pageNo = 1
) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "category", categoryId, subCategoryId, pageNo],
    queryFn: () => productService.getItemsByCategory(categoryId, subCategoryId, pageNo),
    enabled: !!categoryId,
  });
}

export function useSectionDetails(sectionId: number | string, pageNo = 1) {
  return useQuery({
    queryKey: [QUERY_KEYS.SECTIONS, "detail", sectionId, pageNo],
    queryFn: () => productService.getSectionDetails(sectionId, pageNo),
    enabled: !!sectionId,
  });
}

// ─── Category Hooks ───────────────────────────────────────────────────────────
export function useCategories(categoryId: number | string = 0, pageNo = 1) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, categoryId, pageNo],
    queryFn: () => categoryService.getCategoriesWithSubcat(categoryId, pageNo),
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Cart Hooks ───────────────────────────────────────────────────────────────
export function useServerCart() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [QUERY_KEYS.CART],
    queryFn: cartService.getCartItems,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      itemId: number | string;
      quantity: number;
      price: number;
      variation?: string;
    }) => cartService.addToCart(params.itemId, params.quantity, params.price, params.variation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
    },
    onError: () => { toast.error("Failed to add item to cart"); },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { itemId: number | string; quantity: number }) =>
      cartService.updateQuantity(params.itemId, params.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number | string) => cartService.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
    },
  });
}

// ─── Wishlist Hooks ───────────────────────────────────────────────────────────
export function useWishlist(pageNo = 1) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [QUERY_KEYS.WISHLIST, pageNo],
    queryFn: () => wishlistService.getWishlist(pageNo),
    enabled: isAuthenticated,
    staleTime: 0,          // always consider stale → refetch on every mount
    refetchOnMount: true,  // always hit API when component mounts
    retry: 1,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number | string) => wishlistService.toggleWishlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST] });
    },
  });
}

// ─── Order Hooks ──────────────────────────────────────────────────────────────
export function useOrders(orderStatus: number | string = "0", pageNo = 1) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [QUERY_KEYS.ORDERS, orderStatus, pageNo],
    queryFn: () => orderService.getCustomerOrders(orderStatus, pageNo),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Profile Hooks ────────────────────────────────────────────────────────────
export function useProfile() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: profileService.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddresses() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [QUERY_KEYS.ADDRESSES],
    queryFn: profileService.getAddresses,
    enabled: isAuthenticated,
  });
}

export function useNotifications(pageNo = 1) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, pageNo],
    queryFn: () => profileService.getNotifications(pageNo),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000,
  });
}

export function useTransactions(pageNo = 1) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, pageNo],
    queryFn: () => profileService.getTransactions(pageNo),
    enabled: isAuthenticated,
  });
}

// ─── Promo Hooks ──────────────────────────────────────────────────────────────
export function usePromoCodes(pageNo = 1) {
  return useQuery({
    queryKey: ["promo-codes", pageNo],
    queryFn: () => promoService.getPromoCodes(pageNo),
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Review Hooks ─────────────────────────────────────────────────────────────
export function useReviews(itemId: number | string) {
  return useQuery({
    queryKey: ["reviews", itemId],
    queryFn: () => reviewService.getReviews(itemId),
    enabled: !!itemId,
  });
}

// ─── General Setting Hook ─────────────────────────────────────────────────────
export function useGeneralSettings() {
  return useQuery({
    queryKey: ["general-settings"],
    queryFn: generalService.getGeneralSettings,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}
export function usePages() {
  return useQuery({
    queryKey: ["getPages"],
    queryFn: generalService.getPages,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}
export function useGetSocialLinks() {
  return useQuery({
    queryKey: ["getSocialLinks"],
    queryFn: generalService.getSocialLinks,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}


export function useGetPaymentOptions() {
  return useQuery({
    queryKey: ["getPaymentOptions"],
    queryFn: generalService.getPaymentOptions,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}