/** @type {import('next').NextConfig} */
const nextConfig = {
  // NEXT_PUBLIC_ vars are automatically available to the client — no env block needed.
  // Adding one here can cause Vercel to write undefined over the real values at build time.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
