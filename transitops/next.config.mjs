/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors or generated Prisma code warnings.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Prevents Windows .next/types file lock and concurrent dev/build race condition errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
