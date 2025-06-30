
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
        ...(config.resolve.fallback || {}),
        'async_hooks': false,
        'buffer': false,
        'dns': false,
        'fs': false,
        'fs/promises': false,
        'http': false,
        'https': false,
        'http2': false,
        'net': false,
        'perf_hooks': false,
        'tls': false,
        // Add fallbacks for `node:` prefixed modules
        'node:async_hooks': false,
        'node:buffer': false,
        'node:dns': false,
        'node:fs': false,
        'node:fs/promises': false,
        'node:http': false,
        'node:https': false,
        'node:http2': false,
        'node:net': false,
        'node:perf_hooks': false,
        'node:tls': false,
      };
    }

    if (!config.externals) {
      config.externals = [];
    }
    config.externals.push({
      ejs: "commonjs ejs",
      handlebars: "commonjs handlebars",
    });

    return config;
  },
};

export default nextConfig;
