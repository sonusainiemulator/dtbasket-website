import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterResponse, GeneralSettingItem, PaymentOptionResponse, DeliveryInstruction } from "@/types";

export const generalService = {
  /** POST /general_setting — app config (currency, charges, etc.) */
  getGeneralSettings: async (): Promise<FlutterResponse<GeneralSettingItem>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.HOME.GENERAL_SETTING);
    return data;
  },

  /** POST /get_payment_option */
  getPaymentOptions: async (): Promise<PaymentOptionResponse> => {
    const { data } = await apiClient.post(API_ENDPOINTS.MISC.PAYMENT_OPT);
    return data;
  },

  /** POST /get_delivery_instructor */
  getDeliveryInstructions: async (): Promise<FlutterResponse<DeliveryInstruction>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.MISC.DELIVERY_INST);
    return data;
  },

  /** POST /get_offers */
  getOffers: async (): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.HOME.GET_OFFERS);
    return data;
  },

  /** POST /get_pages */
  getPages: async (): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.MISC.PAGES);
    return data;
  },

  /** POST /get_social_link */
  getSocialLinks: async (): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.MISC.SOCIAL_LINKS);
    return data;
  },
};
