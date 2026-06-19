import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterResponse, FlutterPagedResponse, Profile, Address, Transaction, Notification } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const profileService = {
  /** POST /get_profile */
  getProfile: async (): Promise<FlutterResponse<Profile>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());

    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.ME, formData);
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
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("full_name", params.full_name);
    formData.append("email", params.email);
    formData.append("mobile_number", params.mobile_number);
    formData.append("country_code", params.country_code);
    formData.append("country_name", params.country_name);

    const { data } = await apiClient.post(API_ENDPOINTS.PROFILE.UPDATE, formData);
    return data;
  },

  /** POST /get_customer_address */
  getAddresses: async (): Promise<FlutterResponse<Address>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());

    const { data } = await apiClient.post(API_ENDPOINTS.PROFILE.GET_ADDRESS, formData);
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
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("mode", params.mode);
    formData.append("type", params.type.toString());
    formData.append("address", params.address);
    formData.append("latitude", params.latitude);
    formData.append("longitude", params.longitude);
    formData.append("area", params.area);
    formData.append("city", params.city);
    formData.append("state", params.state);
    formData.append("country", params.country);
    formData.append("pincode", params.pincode);

    const { data } = await apiClient.post(API_ENDPOINTS.PROFILE.ADD_ADDRESS, formData);
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
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("address_id", addressId.toString());
    if (params.address) formData.append("address", params.address);
    if (params.type) formData.append("type", params.type.toString());
    if (params.latitude) formData.append("latitude", params.latitude);
    if (params.longitude) formData.append("longitude", params.longitude);
    if (params.area) formData.append("area", params.area);
    if (params.city) formData.append("city", params.city);
    if (params.state) formData.append("state", params.state);
    if (params.country) formData.append("country", params.country);
    if (params.pincode) formData.append("pincode", params.pincode);

    const { data } = await apiClient.post(API_ENDPOINTS.PROFILE.EDIT_ADDRESS, formData);
    return data;
  },

  /** POST /delete_address */
  deleteAddress: async (addressId: number | string): Promise<FlutterResponse<unknown>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("address_id", addressId.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.PROFILE.DEL_ADDRESS, formData);
    return data;
  },

  /** POST /add_remove_gst_number */
  updateGst: async (gstNumber: string, gstFirmName: string): Promise<FlutterResponse<unknown>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("gst_number", gstNumber);
    formData.append("gst_firm_name", gstFirmName);

    const { data } = await apiClient.post("/add_remove_gst_number", formData);
    return data;
  },

  /** POST /get_transaction_list */
  getTransactions: async (pageNo = 1): Promise<FlutterPagedResponse<Transaction>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("page_no", pageNo.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.WALLET.HISTORY, formData);
    return data;
  },

  /** POST /add_wallet_amount */
  addWalletAmount: async (amount: number, transactionId: string): Promise<FlutterResponse<unknown>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("amount", amount.toString());
    formData.append("transaction_id", transactionId);

    const { data } = await apiClient.post(API_ENDPOINTS.WALLET.ADD, formData);
    return data;
  },

  /** POST /get_notification */
  getNotifications: async (pageNo = 1): Promise<FlutterPagedResponse<Notification>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("page_no", pageNo.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.GET, formData);
    return data;
  },

  /** POST /read_notification */
  readNotification: async (notificationId: number | string): Promise<FlutterResponse<unknown>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("notification_id", notificationId.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.READ, formData);
    return data;
  },
};
