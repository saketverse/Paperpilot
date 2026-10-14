import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "tesseract.js"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jgmriocozuxtnibexnuj.supabase.co",
      },
    ],
  },
};

export default nextConfig;
