/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lalakon/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: 'sinea-cdn.b-cdn.net',
      },
    ],
  },
};

export default nextConfig;

