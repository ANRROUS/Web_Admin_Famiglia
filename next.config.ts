import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error - turbopack types might not be up to date in the current version
    turbopack: {
      root: path.resolve(process.cwd(), '..'),
    },
  },
};

export default nextConfig;
