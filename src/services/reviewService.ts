import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterResponse, Review } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const reviewService = {
  /** POST /get_items_review */
  getReviews: async (itemId: number | string): Promise<FlutterResponse<Review>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.REVIEWS.GET, {
      item_id: itemId,
    });
    return data;
  },

  /** POST /add_review */
  addReview: async (params: {
    item_id: number | string;
    rating: number;
    review: string;
    image?: string;
  }): Promise<FlutterResponse<unknown>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.REVIEWS.ADD, {
      type: "1",
      customer_id: getCustomerId(),
      content_id: params.item_id,
      rating: String(params.rating),
      review: params.review,
      image: params.image ?? "",
    });
    return data;
  },
};
