"use client";
import { useEffect, useState, useCallback } from "react";

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  area?: string;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  county?: string;
}
interface NominatimResponse { address?: NominatimAddress; }

interface GoogleGeocodeComponent { types: string[]; long_name: string; }
interface GoogleGeocodeResponse {
  status: string;
  results: { address_components: GoogleGeocodeComponent[] }[];
}

const STORAGE_KEY = "user_location";

async function reverseGeocode(lat: number, lng: number, apiKey?: string): Promise<Partial<UserLocation>> {
  /* Use Google Maps when an API key is available */
  if (apiKey) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data: GoogleGeocodeResponse = await res.json();
    if (data.status === "OK") {
      const components = data.results?.[0]?.address_components ?? [];
      return {
        city: components.find(c => c.types.includes("locality"))?.long_name ?? "",
        area: components.find(c => c.types.includes("sublocality"))?.long_name ?? "",
      };
    }
  }
  /* Fallback: free Nominatim (no key required) */
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { "Accept-Language": "en" } }
  );
  const data: NominatimResponse = await res.json();
  const addr = data.address ?? {};
  return {
    city: addr.city ?? addr.town ?? addr.village ?? addr.county ?? "",
    area: addr.suburb ?? addr.neighbourhood ?? "",
  };
}

export function useLocation() {
  const [location, setLocationState] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);

  /* Load from localStorage on mount */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setLocationState(JSON.parse(saved) as UserLocation); } catch { /* ignore */ }
    }
  }, []);

  /* Detect via browser geolocation + reverse geocoding (Google Maps if key provided, else Nominatim) */
  const detectLocation = useCallback(async (apiKey?: string): Promise<{ ok: boolean; errorCode?: number }> => {
    if (!navigator.geolocation) return { ok: false, errorCode: 0 };
    setLoading(true);
    return new Promise((resolve) => {
      let resolved = false;
      // Timer used to delay error resolution — some Android/Chrome builds fire the
      // error callback (code 1) before the success callback due to a stale
      // permission cache. A 300 ms window lets success cancel the error.
      let errorTimer: ReturnType<typeof setTimeout> | null = null;

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          // Cancel any pending error resolution
          if (errorTimer) { clearTimeout(errorTimer); errorTimer = null; }
          if (resolved) return;
          resolved = true;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          // Resolve immediately — coords confirmed; geocoding continues in background
          resolve({ ok: true });
          try {
            const geo = await reverseGeocode(lat, lng, apiKey);
            const loc: UserLocation = { lat, lng, ...geo };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
            setLocationState(loc);
          } catch {
            const loc: UserLocation = { lat, lng };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
            setLocationState(loc);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          // Delay resolution so the success callback can cancel this if it arrives first
          errorTimer = setTimeout(() => {
            if (resolved) return;
            resolved = true;
            setLoading(false);
            resolve({ ok: false, errorCode: err.code });
          }, 300);
        }
      );
    });
  }, []);

  /* Manually set city/area */
  const setManualLocation = useCallback((city: string, area: string) => {
    const loc: UserLocation = { lat: 0, lng: 0, city, area };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    setLocationState(loc);
  }, []);

  /* Clear */
  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLocationState(null);
  }, []);

  return { location, loading, detectLocation, setManualLocation, clearLocation };
}
