import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterPagedResponse, FlutterResponse, ProductItem } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const wishlistService = {
  /** POST /get_wishlist */
  getWishlist: async (pageNo = 1): Promise<FlutterPagedResponse<ProductItem>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("page_no", pageNo.toString());
    formData.append("page_limit", "50");

    const { data } = await apiClient.post(API_ENDPOINTS.WISHLIST.GET, formData);
    return data;
  },

  /** POST /add_remove_wishlist — toggles */
  toggleWishlist: async (itemId: number | string): Promise<FlutterResponse<unknown>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("item_id", itemId.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.WISHLIST.TOGGLE, formData);
    return data;
  },
};
