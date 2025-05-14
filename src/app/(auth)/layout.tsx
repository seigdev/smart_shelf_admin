
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css'; // Assuming you want to keep global styles
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ 
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ShelfPilot - Authentication',
  description: 'Login or Sign Up for ShelfPilot',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background`}>
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
