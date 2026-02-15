/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This allows the production build to successfully complete 
    // even if your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // ESLINT block removed because it's no longer supported here
  //output: 'standalone',
};

export default nextConfig;