"use client";
/**
 * settingsContext.tsx
 * Global React context that provides parsed AppSettings + pages
 * fetched from /general_setting and /get_pages APIs.
 * Wrap your app with <SettingsProvider> once in providers.tsx.
 */

import { createContext, useContext, useMemo } from "react";
import { useGeneralSettings, usePages, useGetSocialLinks } from "@/hooks/useApi";
import { parseSettings, DEFAULT_SETTINGS, AppSettings } from "@/lib/settings";
import type { GeneralSettingItem } from "@/types";

/* ─── Page link type ─────────────────────────────────────────────────────────── */
export interface AppPage {
    title: string;
    url: string;
    icon?: string;
}
export interface SocialLink {
    id: number;
    name: string;
    image: string;
    url: string;
    status: number;
    created_at: string;
    updated_at: string;
}

/* ─── Context shape ──────────────────────────────────────────────────────────── */
interface SettingsContextValue {
    settings: AppSettings;
    pages: AppPage[];
    socialLinks: SocialLink[],
    isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
    settings: DEFAULT_SETTINGS,
    pages: [],
    socialLinks: [],
    isLoading: true,
});

/* ─── Provider ───────────────────────────────────────────────────────────────── */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { data: settingsData, isLoading: loadingSettings } = useGeneralSettings();
    const { data: pagesData, isLoading: loadingPages } = usePages();
    const { data: socialLinksData } = useGetSocialLinks();

    const settings = useMemo(() => {
        const items = settingsData?.result ?? [];
        return items.length ? parseSettings(items as GeneralSettingItem[]) : DEFAULT_SETTINGS;
    }, [settingsData]);

    const pages: AppPage[] = useMemo(() => {
        return (pagesData?.result as AppPage[] | undefined) ?? [];
    }, [pagesData]);

    const socialLinks: SocialLink[] = useMemo(() => {
        return (socialLinksData?.result as SocialLink[] | undefined) ?? [];
    }, [pagesData]);


    return (
        <SettingsContext.Provider value={{
            settings,
            pages,
            socialLinks,
            isLoading: loadingSettings || loadingPages,
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

/* ─── Hook ───────────────────────────────────────────────────────────────────── */
export function useAppSettings() {
    return useContext(SettingsContext);
}