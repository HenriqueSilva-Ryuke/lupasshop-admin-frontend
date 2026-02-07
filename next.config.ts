import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Compiler
  reactCompiler: true,

  // =============================================
  // MULTI-ZONE: This app is the admin zone
  // All routes are served under /admin basePath
  // =============================================
  basePath: "/admin",

  // Transpile the shared design system
  transpilePackages: ["@lupa/design-system"],

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
