import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterPagedResponse, FlutterResponse, ProductItem } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const wishlistService = {
  /** POST /get_wishlist */
  getWishlist: async (pageNo = 1): Promise<FlutterPagedResponse<ProductItem>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.WISHLIST.GET, {
      customer_id: getCustomerId(),
      page_no: pageNo,
      page_limit: 50
    });
    return data;
  },

  /** POST /add_remove_wishlist — toggles */
  toggleWishlist: async (itemId: number | string): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.WISHLIST.TOGGLE, {
      customer_id: getCustomerId(),
      item_id: itemId,
    });
    return data;
  },
};
