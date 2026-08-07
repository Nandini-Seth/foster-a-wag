/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Tell Next.js App Router not to bundle these server-only native packages
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'bcryptjs'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'better-sqlite3'];
    }
    return config;
  },
};
module.exports = nextConfig;
