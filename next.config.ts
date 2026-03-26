import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  webpack: (config, { dev }) => {
    if (dev && process.platform === 'win32') {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
