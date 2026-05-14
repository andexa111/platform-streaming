/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@lalakon/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "sinea-cdn.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "commondatastorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
