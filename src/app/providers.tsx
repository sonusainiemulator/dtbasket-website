"use client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "@/lib/queryClient";
import SplashScreen from "@/components/ui/SplashScreen";
import { SettingsProvider } from "@/lib/settingsContext";
import { DarkModeProvider } from "@/lib/darkModeContext";
import { COLORS } from "@/branding";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <DarkModeProvider>
            <SplashScreen />
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#1F2937",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "12px 18px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                },
                success: { iconTheme: { primary: COLORS.primary[700], secondary: "#fff" } },
                error: { iconTheme: { primary: COLORS.red, secondary: "#fff" } },
              }}
            />
            </DarkModeProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
