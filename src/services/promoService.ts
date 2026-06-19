import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterPagedResponse, FlutterResponse, PromoCode } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const promoService = {
  /** POST /get_promocode */
  getPromoCodes: async (pageNo = 1): Promise<FlutterPagedResponse<PromoCode>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("page_no", pageNo.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.PROMO.GET, formData);
    return data;
  },

  /** POST /apply_promo_code */
  applyPromoCode: async (
    promoCodeId: number | string,
    totalPrice: number
  ): Promise<FlutterResponse<{ discount_amount: number }>> => {
    const formData = new FormData();
    formData.append("promo_code_id", promoCodeId.toString());
    formData.append("total_price", totalPrice.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.PROMO.APPLY, formData);
    return data;
  },
};
