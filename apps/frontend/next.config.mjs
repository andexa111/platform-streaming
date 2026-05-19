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
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "sinea.id",
      },
      {
        protocol: "https",
        hostname: "api.sinea.id",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/superadmin",
        destination: "/admin",
      },
      {
        source: "/superadmin/:path*",
        destination: "/admin/:path*",
      },
    ];
  },
};

export default nextConfig;
