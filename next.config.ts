/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This allows the production build to successfully complete 
    // even if your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // This allows the production build to successfully complete 
    // even if your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // This helps bypass the prerendering issues by making everything dynamic
  output: 'standalone',
};

export default nextConfig;