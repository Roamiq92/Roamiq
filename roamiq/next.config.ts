import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // disattivato per build stabile su Vercel
  experimental: {
    reactCompiler: false
  }
};

export default nextConfig;
