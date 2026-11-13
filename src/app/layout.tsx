import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { InstallPwaBanner } from '@/components/InstallPwaBanner';

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
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'স্মার্টবাজার',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <LanguageProvider>
            <CustomerAuthProvider>
              <CartProvider>
                {children}
                <InstallPwaBanner />
              </CartProvider>
            </CustomerAuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
