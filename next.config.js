/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages - no Node.js server needed
  output: "export",
  images: {
    unoptimized: true,
    loader: "imgix",
    path: "",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
