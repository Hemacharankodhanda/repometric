import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RepoMetric: GitHub Repository Health Score & Visualizer',
    short_name: 'RepoMetric',
    description:
      'Deterministic 0-100 health score, zoomable repo map, and dependency visualizer for GitHub repositories.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  };
}
