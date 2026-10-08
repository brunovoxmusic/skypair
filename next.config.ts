import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" — removed for Vercel (Vercel handles output automatically)
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Ensure Prisma works in serverless environment
  serverExternalPackages: ["@prisma/client", ".prisma"],
  allowedDevOrigins: [
    "*.space-z.ai",
    "preview-chat-*.space-z.ai",
    "localhost",
    "127.0.0.1",
    "*.vercel.app",
  ],
};

export default nextConfig;
