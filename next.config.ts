import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dtbasket.bhadra.live",
        pathname: "/**",
      },
    ],
  },
  turbo: false,
};

export default nextConfig;