
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
    // This is to fix the HMR websocket connection issue with local subdomains
    if (!isServer) {
      config.watchOptions.poll = 300;
      if (config.devServer) {
        config.devServer.hot = true;
        config.devServer.webSocketURL = 'ws://localhost:9002/ws';
      }
    }
    return config;
  },
  devIndicators: {
    allowedDevOrigins: [
      'http://brainqy.localhost:9002',
      'http://cpp.localhost:9002',
    ],
  },
};

export default nextConfig;
