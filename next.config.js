/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits a self-contained server bundle with only the modules actually reached,
  // which is what the Docker runtime stage copies.
  output: 'standalone',

  // next/image is only used for local assets (the logo). Uploaded pet and foster
  // photos render through plain <img>, so no remote host needs to be allowed —
  // a wildcard here would turn /_next/image into an open image proxy.
  images: {
    remotePatterns: [],
  },

  // bcryptjs is pure JS but ships a lazy require that the bundler mishandles.
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'pg', '@google-cloud/storage'],
  },
};

module.exports = nextConfig;
