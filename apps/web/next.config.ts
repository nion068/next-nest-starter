import type { NextConfig } from 'next';
const nextConfig: NextConfig = { output: 'standalone', transpilePackages: ['@starter/api-client'] };
export default nextConfig;
