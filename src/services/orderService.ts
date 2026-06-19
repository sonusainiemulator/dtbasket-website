import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterPagedResponse, FlutterResponse, Order } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export interface BuyOrderParams {
  item_details: string;       // JSON string of items
  customer_address_id: number;
  promo_code_id: number | string;
  item_total: number;
  total_payable_amount: number;
  handling_charges: number;
  donation_amount: number;
  discount_amount: number;
  delivery_charges: number;
  delivery_instructor_id: number | string;
  payment_method: number;     // 1=COD 2=Online 3=Wallet
  payment_status: number;     // 0=pending 1=paid
}
export interface InvoiceResponse {
  status: number;
  message: string;
  result: {
    pdf_url: string;
  };
}

export const orderService = {
  /** POST /buy_orders */
  buyOrders: async (params: BuyOrderParams): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.BUY, {
      customer_id: getCustomerId(),
      ...params,
    });
    return data;
  },

  /** POST /get_customer_orders */
  getCustomerOrders: async (
    orderStatus: number | string = 0,
    pageNo = 1
  ): Promise<FlutterPagedResponse<Order>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.LIST, {
      customer_id: getCustomerId(),
      order_status: orderStatus === "" ? 0 : Number(orderStatus),
      page_no: pageNo,
    });
    return data;
  },

  /** POST /get_orders_status */
  getOrderStatuses: async (): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.STATUSES);
    return data;
  },

  /** POST /download_invoice */
  downloadInvoice: async (groupOrderId: string): Promise<InvoiceResponse> => {
    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.INVOICE, {
      group_order_id: groupOrderId,
    });

    return data;
  },

  /** POST /search_orders */
  searchOrders: async (query: string, pageNo = 1): Promise<FlutterPagedResponse<Order>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.SEARCH, {
      customer_id: getCustomerId(),
      query,
      page_no: pageNo,
    });
    return data;
  },
};