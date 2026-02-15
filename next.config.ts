/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Completely removed the eslint block to stop the 'Unrecognized key' error
};

export default nextConfig;
