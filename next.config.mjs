/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: "/images/:path*", destination: "/api/media/file/:path*" },
    ];
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/portfolio.html", destination: "/portfolio", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/admin.html", destination: "/admin", permanent: true },
      { source: "/portfolio/case-study.html", destination: "/portfolio", permanent: false },
      { source: "/portfolio/:slug.html", destination: "/portfolio/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
