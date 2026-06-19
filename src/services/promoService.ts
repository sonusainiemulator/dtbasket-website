import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterPagedResponse, FlutterResponse, PromoCode } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const promoService = {
  /** POST /get_promocode */
  getPromoCodes: async (pageNo = 1): Promise<FlutterPagedResponse<PromoCode>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PROMO.GET, {
      customer_id: getCustomerId(),
      page_no: pageNo,
    });
    return data;
  },

  /** POST /apply_promo_code */
  applyPromoCode: async (
    promoCodeId: number | string,
    totalPrice: number
  ): Promise<FlutterResponse<{ discount_amount: number }>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PROMO.APPLY, {
      promo_code_id: promoCodeId,
      total_price: totalPrice,
    });
    return data;
  },
};
