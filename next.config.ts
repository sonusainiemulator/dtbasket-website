import type { NextConfig } from "next";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: isProd ? process.env.NEXT_PUBLIC_BASE_PATH : "",
  assetPrefix: isProd ? process.env.NEXT_PUBLIC_BASE_PATH : "",

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
  },

  experimental: {
    optimizePackageImports: ["react-icons", "swiper"],
  },

  logging: {
    fetches: { fullUrl: true },
  },

  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
};

export default nextConfig;