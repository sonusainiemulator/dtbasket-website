import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterResponse, FlutterPagedResponse, Profile, Address, Transaction, Notification } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const profileService = {
  /** POST /get_profile */
  getProfile: async (): Promise<FlutterResponse<Profile>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.ME, {
      customer_id: getCustomerId(),
    });
    return data;
  },

  /** POST /update_profile */
  updateProfile: async (params: {
    full_name: string;
    email: string;
    mobile_number: string;
    country_code: string;
    country_name: string;
  }): Promise<FlutterResponse<Profile>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PROFILE.UPDATE, {
      customer_id: getCustomerId(),
      ...params,
    });
    return data;
  },

  /** POST /get_customer_address */
  getAddresses: async (): Promise<FlutterResponse<Address>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PROFILE.GET_ADDRESS, {
      customer_id: getCustomerId(),
    });
    return data;
  },

  /** POST /add_new_address */
  addAddress: async (params: {
    mode: string;
    type: number;
    address: string;
    latitude: string;
    longitude: string;
    area: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  }): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PROFILE.ADD_ADDRESS, {
      customer_id: getCustomerId(),
      ...params,
    });
    return data;
  },

  /** POST /edit_address */
  editAddress: async (
    addressId: number | string,
    params: Partial<{
      address: string;
      type: number;
      latitude: string;
      longitude: string;
      area: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    }>
  ): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PROFILE.EDIT_ADDRESS, {
      customer_id: getCustomerId(),
      address_id: addressId,
      ...params,
    });
    return data;
  },

  /** POST /delete_address */
  deleteAddress: async (addressId: number | string): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PROFILE.DEL_ADDRESS, {
      customer_id: getCustomerId(),
      address_id: addressId,
    });
    return data;
  },

  /** POST /add_remove_gst_number */
  updateGst: async (gstNumber: string, gstFirmName: string): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post("/add_remove_gst_number", {
      customer_id: getCustomerId(),
      gst_number: gstNumber,
      gst_firm_name: gstFirmName,
    });
    return data;
  },

  /** POST /get_transaction_list */
  getTransactions: async (pageNo = 1): Promise<FlutterPagedResponse<Transaction>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.WALLET.HISTORY, {
      customer_id: getCustomerId(),
      page_no: pageNo,
    });
    return data;
  },

  /** POST /add_wallet_amount */
  addWalletAmount: async (amount: number, transactionId: string): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.WALLET.ADD, {
      customer_id: getCustomerId(),
      amount,
      transaction_id: transactionId,
    });
    return data;
  },

  /** POST /get_notification */
  getNotifications: async (pageNo = 1): Promise<FlutterPagedResponse<Notification>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.GET, {
      customer_id: getCustomerId(),
      page_no: pageNo,
    });
    return data;
  },

  /** POST /read_notification */
  readNotification: async (notificationId: number | string): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.READ, {
      customer_id: getCustomerId(),
      notification_id: notificationId,
    });
    return data;
  },
};
