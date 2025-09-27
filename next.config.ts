
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
webpack: (config: {
    resolve: { alias: { canvas: boolean; encoding: boolean } };
  }) => {
    // Handle PDF renderer
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    return config;
  },
  transpilePackages: ["@react-pdf/renderer"],
};

export default nextConfig;
