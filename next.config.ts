import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // allowedDevOrigins should be at the top level in this version of Next.js
  allowedDevOrigins: ['192.168.0.183']
};

export default nextConfig;
