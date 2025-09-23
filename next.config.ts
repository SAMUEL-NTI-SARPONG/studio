
import type {NextConfig} from 'next';
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
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
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  dynamicStartUrl: false,
  workboxOptions: {
    additionalManifestEntries: [
      { url: '/notification.mp3', revision: '1' }
    ]
  },
  manifest: {
    name: 'ScheduleMe',
    short_name: 'ScheduleMe',
    description: 'A real-time collaborative timetable application.',
    background_color: '#ffffff',
    theme_color: '#3F7D58',
    display: 'standalone',
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  },
})(nextConfig);
