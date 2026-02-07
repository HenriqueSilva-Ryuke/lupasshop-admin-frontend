import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Compiler
  reactCompiler: true,

  // Transpile the shared design system
  transpilePackages: ["@lupa/design-system", "@lupa/api-client", "@lupa/types"],

  // Images
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
