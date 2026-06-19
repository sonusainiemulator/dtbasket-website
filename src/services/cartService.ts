import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterPagedResponse, FlutterResponse, CartItem } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const cartService = {
  /** POST /get_cart_items */
  getCartItems: async (): Promise<FlutterPagedResponse<CartItem>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());

    const { data } = await apiClient.post(API_ENDPOINTS.CART.GET, formData);
    return data;
  },

  /** POST /add_to_cart */
  addToCart: async (
    itemId: number | string,
    quantity: number,
    price: number,
    variation: string = ""
  ): Promise<FlutterResponse<unknown>> => {
    const formData = new FormData();
    formData.append("item_id", itemId.toString());
    formData.append("customer_id", getCustomerId().toString());
    formData.append("quantity", quantity.toString());
    formData.append("price", price.toString());
    formData.append("variation", variation);

    const { data } = await apiClient.post(API_ENDPOINTS.CART.ADD, formData);
    return data;
  },

  /** POST /update_quantity */
  updateQuantity: async (
    itemId: number | string,
    quantity: number
  ): Promise<FlutterResponse<unknown>> => {
    const formData = new FormData();
    formData.append("item_id", itemId.toString());
    formData.append("customer_id", getCustomerId().toString());
    formData.append("quantity", quantity.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.CART.UPDATE, formData);
    return data;
  },

  /** POST /remove_cart */
  removeFromCart: async (itemId: number | string): Promise<FlutterResponse<unknown>> => {
    const formData = new FormData();
    formData.append("item_id", itemId.toString());
    formData.append("customer_id", getCustomerId().toString());

    const { data } = await apiClient.post(API_ENDPOINTS.CART.REMOVE, formData);
    return data;
  },
};
