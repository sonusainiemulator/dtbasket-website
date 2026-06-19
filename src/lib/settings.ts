/**
 * settings.ts
 * Parses the flat key/value array from /general_setting API
 * into a strongly-typed object used across the web app.
 */

import { GeneralSettingItem } from "@/types";

export interface AppSettings {
    appName: string;
    appVersion: string;
    email: string;
    contact: string;
    website: string;
    appDescription: string;
    appLogo: string;
    currency: string;
    currencyCode: string;        // e.g. ₹
    companyName: string;
    companyLogo: string;
    deliveryCharges: number;
    handlingCharges: number;
    isDeliveryCharges: boolean;
    isHandlingCharges: boolean;
    googleMapApiKey: string;
    pageBgColor: string;
    pageTitleColor: string;
}

/** Converts flat [{key, value}] array → typed AppSettings object */
export function parseSettings(items: GeneralSettingItem[]): AppSettings {
    const map: Record<string, string> = {};
    items.forEach(i => { map[i.key] = i.value; });

    return {
        appName: map.app_name ?? "DTBasket",
        appVersion: map.app_version ?? "1.0.0",
        email: map.email ?? "",
        contact: map.contact ?? "",
        website: map.website ?? "",
        appDescription: map.app_description ?? "",
        appLogo: map.app_logo ?? "",
        currency: map.currency ?? "INR",
        currencyCode: map.currency_code ?? "₹",
        companyName: map.company_name ?? "",
        companyLogo: map.company_logo ?? "",
        deliveryCharges: Number(map.delivery_charges ?? 0),
        handlingCharges: Number(map.handling_charges ?? 0),
        isDeliveryCharges: map.is_delivery_charges === "on",
        isHandlingCharges: map.is_handling_charges === "on",
        googleMapApiKey: map.google_map_api_key ?? "",
        pageBgColor: map.page_background_color ?? "",
        pageTitleColor: map.page_title_color ?? "",
    };
}

/** Default settings (used before API loads) */
export const DEFAULT_SETTINGS: AppSettings = {
    appName: "DTBasket",
    appVersion: "1.0.0",
    email: "support@dtbasket.com",
    contact: "",
    website: "",
    appDescription: "",
    appLogo: "",
    currency: "INR",
    currencyCode: "₹",
    companyName: "DTBasket",
    companyLogo: "",
    deliveryCharges: 50,
    handlingCharges: 0,
    isDeliveryCharges: true,
    isHandlingCharges: false,
    googleMapApiKey: "",
    pageBgColor: "",
    pageTitleColor: "",
};