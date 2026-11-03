import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://relaxed-pixie-4fc612.netlify.app/api/:path*", // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
