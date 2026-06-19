import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterPagedResponse, FlutterResponse, CartItem } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const cartService = {
  /** POST /get_cart_items */
  getCartItems: async (): Promise<FlutterPagedResponse<CartItem>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.CART.GET, {
      customer_id: getCustomerId(),
    });
    return data;
  },

  /** POST /add_to_cart */
  addToCart: async (
    itemId: number | string,
    quantity: number,
    price: number,
    variation: string = ""
  ): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.CART.ADD, {
      item_id: itemId,
      customer_id: getCustomerId(),
      quantity,
      price,
      variation,
    });
    return data;
  },

  /** POST /update_quantity */
  updateQuantity: async (
    itemId: number | string,
    quantity: number
  ): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.CART.UPDATE, {
      item_id: itemId,
      customer_id: getCustomerId(),
      quantity: String(quantity),
    });
    return data;
  },

  /** POST /remove_cart */
  removeFromCart: async (itemId: number | string): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.CART.REMOVE, {
      item_id: itemId,
      customer_id: getCustomerId(),
    });
    return data;
  },
};
