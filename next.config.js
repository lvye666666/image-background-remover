/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages prefers Pages Router API routes
  // Keep app dir but pages/api takes precedence for API routes
  experimental: {
    taint: false,
  },
  // Ensure proper routing on Cloudflare Pages
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
