import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'স্মার্টবাজার - অনলাইন শপিং',
    short_name: 'স্মার্টবাজার',
    description: 'পছন্দের পণ্য সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন ক্যাশ অন ডেলিভারিতে।',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#059669',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
