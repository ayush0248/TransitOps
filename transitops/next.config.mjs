/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors or generated Prisma code warnings.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We already verified TypeScript compiles cleanly (✓ Compiled successfully)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
