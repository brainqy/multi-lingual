
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
    
    // This is to suppress the 'require.extensions' warning from handlebars
    config.module.rules.push({
      test: /handlebars/,
      loader: 'null-loader',
    });
    config.resolve.alias = {
      ...config.resolve.alias,
      handlebars: 'handlebars/dist/handlebars.js',
    };
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
