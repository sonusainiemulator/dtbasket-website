import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { FlutterResponse, Banner } from "@/types";
import Cookies from "js-cookie";

const getCustomerId = () => Cookies.get("customer_id") ?? 0;

/** Maps raw API banner to internal display shape */
export interface DisplayBanner {
  id: number;
  title: string;
  description?: string;
  image: string;        // banner_image — full hero
  thumbnail: string;    // image — small offer
  discount_amount: number;
  item_id: number;
  button_text?: string;
  button_link?: string;
}

function normalize(raw: Banner): DisplayBanner {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || undefined,
    image: raw.banner_image,
    thumbnail: raw.image,
    discount_amount: raw.discount_amount,
    item_id: raw.item_id,
    button_text: "Shop Now",
    button_link: `/products/${raw.item_id}`,
  };
}

export const bannerService = {
  /** POST /get_banner { is_home_screen:1, type_id:0 } — hero banners */
  getHeroBanners: async (
    isHomeScreen: string,
    typeId: string
  ): Promise<DisplayBanner[]> => {
    const { data } = await apiClient.post<FlutterResponse<Banner>>(
      API_ENDPOINTS.BANNERS.GET,
      { is_home_screen: isHomeScreen, type_id: typeId, customer_id: getCustomerId() }
    );
    if (data.status !== 200 || !data.result) return [];
    return data.result.filter((b) => b.status === 1).map(normalize);
  },

  /** POST /get_banner { is_home_screen:1, type_id:1 } — promo cards */
  getPromoBanners: async (): Promise<DisplayBanner[]> => {
    const { data } = await apiClient.post<FlutterResponse<Banner>>(
      API_ENDPOINTS.BANNERS.GET,
      { is_home_screen: 1, type_id: 1, customer_id: getCustomerId() }
    );
    if (data.status !== 200 || !data.result) return [];
    return data.result.filter((b) => b.status === 1).map(normalize);
  },
};
