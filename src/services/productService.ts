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
    const { data } = await apiClient.post(API_ENDPOINTS.HOME.GET_SECTION, {
      is_home_screen: isHomeScreen,
      type_id: typeId,
      page_no: pageNo,
      customer_id: getCustomerId(),
    });
    return data;
  },

  /** GET /item_details */
  getItemDetails: async (itemId: number | string): Promise<FlutterResponse<ProductItem>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTS.ITEM_DETAILS, {
      item_id: itemId,
      customer_id: getCustomerId(),
    });
    return data;
  },

  /** GET /get_similar_items */
  getSimilarItems: async (itemId: number | string): Promise<FlutterResponse<ProductItem>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTS.SIMILAR_ITEMS, {
      item_id: itemId,
      customer_id: getCustomerId(),
    });
    return data;
  },

  /** GET /get_top_rating_items */
  getTopRatingItems: async (pageNo = 1): Promise<FlutterPagedResponse<ProductItem>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTS.TOP_RATING, {
      page_no: pageNo,
      customer_id: getCustomerId(),
    });
    return data;
  },

  /** GET /search_items */
  searchItems: async (query: string, pageNo = 1): Promise<FlutterPagedResponse<ProductItem>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTS.SEARCH, {
      query,
      page_no: pageNo,
      customer_id: getCustomerId(),
      page_limit: 50
    });
    return data;
  },

  /** POST /track_intrest */
  trackInterest: async (itemId: number | string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.PRODUCTS.TRACK_INTEREST, {
      item_id: itemId,
      customer_id: getCustomerId(),
    });
  },

  /** GET /get_items_by_category */
  getItemsByCategory: async (
    categoryId: number | string,
    subCategoryId: number | string = 0,
    pageNo = 1
  ): Promise<FlutterPagedResponse<ProductItem>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.CATEGORIES.GET_ITEMS_BY_CAT, {
      category_id: categoryId,
      sub_category_id: subCategoryId,
      page_no: pageNo,
      customer_id: getCustomerId(),
      page_limit: 50
    });
    return data;
  },

  /** GET /get_section_details */
  getSectionDetails: async (sectionId: number | string, pageNo = 1): Promise<FlutterPagedResponse<ProductItem>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.HOME.GET_SECTION_DETAILS, {
      section_id: sectionId,
      page_no: pageNo,
      page_limit: 50,
      customer_id: getCustomerId(),
    });
    return data;
  },
};
