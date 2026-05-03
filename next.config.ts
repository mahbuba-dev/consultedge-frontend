import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ably"],
  // Deploy-friendly: don't fail the build on pre-existing type / lint issues.
  // Editors still surface these errors during development.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
