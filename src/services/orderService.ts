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
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("item_details", params.item_details);
    formData.append("customer_address_id", params.customer_address_id.toString());
    formData.append("promo_code_id", params.promo_code_id.toString());
    formData.append("item_total", params.item_total.toString());
    formData.append("total_payable_amount", params.total_payable_amount.toString());
    formData.append("handling_charges", params.handling_charges.toString());
    formData.append("donation_amount", params.donation_amount.toString());
    formData.append("discount_amount", params.discount_amount.toString());
    formData.append("delivery_charges", params.delivery_charges.toString());
    formData.append("delivery_instructor_id", params.delivery_instructor_id.toString());
    formData.append("payment_method", params.payment_method.toString());
    formData.append("payment_status", params.payment_status.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.BUY, formData);
    return data;
  },

  /** POST /get_customer_orders */
  getCustomerOrders: async (
    orderStatus: number | string = 0,
    pageNo = 1
  ): Promise<FlutterPagedResponse<Order>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("order_status", (orderStatus === "" ? 0 : Number(orderStatus)).toString());
    formData.append("page_no", pageNo.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.LIST, formData);
    return data;
  },

  /** POST /get_orders_status */
  getOrderStatuses: async (): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.STATUSES);
    return data;
  },

  /** POST /download_invoice */
  downloadInvoice: async (groupOrderId: string): Promise<InvoiceResponse> => {
    const formData = new FormData();
    formData.append("group_order_id", groupOrderId);

    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.INVOICE, formData);
    return data;
  },

  /** POST /search_orders */
  searchOrders: async (query: string, pageNo = 1): Promise<FlutterPagedResponse<Order>> => {
    const formData = new FormData();
    formData.append("customer_id", getCustomerId().toString());
    formData.append("query", query);
    formData.append("page_no", pageNo.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.SEARCH, formData);
    return data;
  },
};