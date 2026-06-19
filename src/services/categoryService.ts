import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterPagedResponse, Category } from "@/types";

export const categoryService = {
  /** POST /get_cat_with_subcat */
  getCategoriesWithSubcat: async (
    categoryId: number | string = 0,
    pageNo = 1
  ): Promise<FlutterPagedResponse<Category>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.CATEGORIES.GET_WITH_SUBCAT, {
      category_id: categoryId,
      page_no: pageNo,
      page_limit: 50
    });
    return data;
  },
};
