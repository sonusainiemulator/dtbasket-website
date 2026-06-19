import { QueryClient } from "@tanstack/react-query";
import { CONFIG } from "@/branding";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            CONFIG.queryStaleTime,
      gcTime:               10 * 60 * 1000, // 10 min
      retry:                1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});
