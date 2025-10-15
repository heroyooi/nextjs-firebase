import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🚀 ESLint 무시하고 빌드 통과
  },
};

export default nextConfig;
