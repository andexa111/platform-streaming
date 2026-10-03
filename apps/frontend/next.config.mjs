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
        port: "3001",
      },
      {
        protocol: "https",
        hostname: "sinea.id",
      },
      {
        protocol: "https",
        hostname: "api.sinea.id",
      },

      //code development (bisa dihapus saat production)
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      //end code development
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
