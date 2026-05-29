import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://backend-skripsi.netlify.app/api/:path*", // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
