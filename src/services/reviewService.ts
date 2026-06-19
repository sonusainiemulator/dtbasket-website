import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterResponse, Review } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const reviewService = {
  /** POST /get_items_review */
  getReviews: async (itemId: number | string): Promise<FlutterResponse<Review>> => {
    const formData = new FormData();
    formData.append("item_id", itemId.toString());

    const { data } = await apiClient.post(API_ENDPOINTS.REVIEWS.GET, formData);
    return data;
  },

  /** POST /add_review */
  addReview: async (params: {
    item_id: number | string;
    rating: number;
    review: string;
    image?: string;
  }): Promise<FlutterResponse<unknown>> => {
    const formData = new FormData();
    formData.append("type", "1");
    formData.append("customer_id", getCustomerId().toString());
    formData.append("content_id", params.item_id.toString());
    formData.append("rating", params.rating.toString());
    formData.append("review", params.review);
    formData.append("image", params.image ?? "");

    const { data } = await apiClient.post(API_ENDPOINTS.REVIEWS.ADD, formData);
    return data;
  },
};
