import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterResponse, FlutterPagedResponse, ProductItem, SectionResult, CategoryType } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

export const productService = {

  /** GET /getType — home get Type */
  getType: async (): Promise<FlutterResponse<CategoryType>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.HOME.GET_TYPE);
    return data;
  },

  /** GET /get_section — home sections with products */
  getSections: async (pageNo = 1, isHomeScreen = 1, typeId = 0): Promise<FlutterPagedResponse<SectionResult>> => {
    const formData = new FormData();
    formData.append("is_home_screen", isHomeScreen.toString());
    formData.append("type_id", typeId.toString());
    formData.append("page_no", pageNo.toString());
    formData.append("customer_id", getCustomerId().toString());

    const { data } = await apiClient.post(API_ENDPOINTS.HOME.GET_SECTION, formData);
    return data;
  },

  /** GET /item_details */
  getItemDetails: async (itemId: number | string): Promise<FlutterResponse<ProductItem>> => {
    const formData = new FormData();
    formData.append("item_id", itemId.toString());
    formData.append("customer_id", getCustomerId().toString());

    const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTS.ITEM_DETAILS, formData);
    return data;
  },

  /** GET /get_similar_items */
  getSimilarItems: async (itemId: number | string): Promise<FlutterResponse<ProductItem>> => {
    const formData = new FormData();
    formData.append("item_id", itemId.toString());
    formData.append("customer_id", getCustomerId().toString());

    const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTS.SIMILAR_ITEMS, formData);
    return data;
  },

  /** GET /get_top_rating_items */
  getTopRatingItems: async (pageNo = 1): Promise<FlutterPagedResponse<ProductItem>> => {
    const formData = new FormData();
    formData.append("page_no", pageNo.toString());
    formData.append("customer_id", getCustomerId().toString());

    const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTS.TOP_RATING, formData);
    return data;
  },

  /** GET /search_items */
  searchItems: async (query: string, pageNo = 1): Promise<FlutterPagedResponse<ProductItem>> => {
    const formData = new FormData();
    formData.append("query", query);
    formData.append("page_no", pageNo.toString());
    formData.append("customer_id", getCustomerId().toString());
    formData.append("page_limit", "50");

    const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTS.SEARCH, formData);
    return data;
  },

  /** POST /track_intrest */
  trackInterest: async (itemId: number | string): Promise<void> => {
    const formData = new FormData();
    formData.append("item_id", itemId.toString());
    formData.append("customer_id", getCustomerId().toString());

    await apiClient.post(API_ENDPOINTS.PRODUCTS.TRACK_INTEREST, formData);
  },

  /** GET /get_items_by_category */
  getItemsByCategory: async (
    categoryId: number | string,
    subCategoryId: number | string = 0,
    pageNo = 1
  ): Promise<FlutterPagedResponse<ProductItem>> => {
    const formData = new FormData();
    formData.append("category_id", categoryId.toString());
    formData.append("sub_category_id", subCategoryId.toString());
    formData.append("page_no", pageNo.toString());
    formData.append("customer_id", getCustomerId().toString());
    formData.append("page_limit", "50");

    const { data } = await apiClient.post(API_ENDPOINTS.CATEGORIES.GET_ITEMS_BY_CAT, formData);
    return data;
  },

  /** GET /get_section_details */
  getSectionDetails: async (sectionId: number | string, pageNo = 1): Promise<FlutterPagedResponse<ProductItem>> => {
    const formData = new FormData();
    formData.append("section_id", sectionId.toString());
    formData.append("page_no", pageNo.toString());
    formData.append("page_limit", "50");
    formData.append("customer_id", getCustomerId().toString());

    const { data } = await apiClient.post(API_ENDPOINTS.HOME.GET_SECTION_DETAILS, formData);
    return data;
  },
};
