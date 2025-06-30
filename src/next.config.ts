
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'async_hooks': false,
        'dns': false,
        'fs': false,
        'fs/promises': false,
        'http2': false,
        'net': false,
        'tls': false,
        'perf_hooks': false,
      };
    }

    if (!config.externals) {
      config.externals = [];
    }
    config.externals.push({
      ejs: "commonjs ejs",
    });

    return config;
  },
};

export default nextConfig;
