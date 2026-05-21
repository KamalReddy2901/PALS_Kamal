/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages — no Node.js server required
  output: "export",
  // Cloudflare Pages expects /path/ not /path.html
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
