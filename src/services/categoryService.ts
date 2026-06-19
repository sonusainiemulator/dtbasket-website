import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterPagedResponse, Category } from "@/types";

export const categoryService = {
  /** POST /get_cat_with_subcat */
  getCategoriesWithSubcat: async (
    categoryId: number | string = 0,
    pageNo = 1
  ): Promise<FlutterPagedResponse<Category>> => {
    const formData = new FormData();
    formData.append("category_id", categoryId.toString());
    formData.append("page_no", pageNo.toString());
    formData.append("page_limit", "50");

    const { data } = await apiClient.post(API_ENDPOINTS.CATEGORIES.GET_WITH_SUBCAT, formData);
    return data;
  },
};
