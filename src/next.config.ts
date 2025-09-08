require('dotenv').config();
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
      config.watchOptions = {
        ...config.watchOptions,
        poll: 300,
      };
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
};

export default nextConfig;
