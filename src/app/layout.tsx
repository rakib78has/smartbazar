import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'স্মার্টবাজার - সেরা পণ্য সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন',
  description:
    'পছন্দের পণ্য কিনুন ক্যাশ অন ডেলিভারিতে। কোনো রেজিস্ট্রেশন ছাড়াই ১ ক্লিকে সরাসরি হোয়াটসঅ্যাপে অর্ডার কনফার্ম করুন।',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
