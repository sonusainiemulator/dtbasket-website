/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  basePath: isProd ? process.env.NEXT_PUBLIC_BASE_PATH : "",
  assetPrefix: isProd ? process.env.NEXT_PUBLIC_BASE_PATH : "",

  images: {
    unoptimized: true,
  },

  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },

  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
};

module.exports = nextConfig;

