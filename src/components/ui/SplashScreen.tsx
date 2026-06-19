"use client";
import { useEffect, useState } from "react";
import { CONFIG, COLORS, TEXT, IMAGES } from "@/branding";
import SafeImage from "./SafeImage";

export default function SplashScreen() {
  // Initialize synchronously so sessionStorage is checked exactly once,
  // avoiding the React 18 Strict Mode double-effect cancel bug.
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const key = "dtbasket_splash_shown";
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  });

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), CONFIG.splashDurationMs);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.splash }}
    >
      <div className="text-center animate-bounce-in">
        <SafeImage
          src={IMAGES.appLogo}
          alt="DTBasket logo"
          width={724}
          height={188}
          className="w-48 h-auto object-contain"
          priority
        />
        <p className="text-gray-700 font-semibold text-lg">{TEXT.tagline}</p>
      </div>
      {/* Loading bar */}
      <div className="absolute bottom-12 w-48 h-1.5 bg-black/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-700 rounded-full"
          style={{ animation: `loadBar ${CONFIG.splashDurationMs}ms linear forwards` }}
        />
      </div>
      <style>{`@keyframes loadBar { from { width: 0%; } to { width: 100%; } }`}</style>
    </div>
  );
}
