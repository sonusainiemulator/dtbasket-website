import type { Metadata, Viewport } from "next";
import { Nunito, Poppins } from "next/font/google";
import Providers from "./providers";
import { TEXT, CONFIG } from "@/branding";
import LocationProvider from "./LocationProvider";
import './globals.css'


const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: CONFIG.themeColor,
};
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: { default: TEXT.meta.titleDefault, template: TEXT.meta.titleTemplate },
  description: TEXT.meta.description,
  icons: {
    icon: [
      { url: `${BASE_PATH}/favicon.ico`, sizes: "any" },
      { url: `${BASE_PATH}/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
      { url: `${BASE_PATH}/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
    ],

    apple: [{ url: `${BASE_PATH}/apple-touch-icon.png`, sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon", url: `${BASE_PATH}/safari-pinned-tab.svg`, color: CONFIG.themeColor
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: TEXT.meta.titleDefault,
    description: TEXT.meta.description,
    type: "website",
    siteName: TEXT.appName,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${poppins.variable}`}>
      <body className="font-sans" suppressHydrationWarning>

        <Providers>
          <LocationProvider>
            {children}
          </LocationProvider>
        </Providers>

      </body>
    </html>
  );
}