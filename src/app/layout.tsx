
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; // Changed from GeistSans and GeistMono
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ 
  variable: '--font-inter', // Updated variable name to reflect actual font
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ 
  variable: '--font-roboto-mono', // Updated variable name to reflect actual font
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ShelfPilot',
  description: 'Intelligent Inventory Management by ShelfPilot',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}> {/* Updated variable names */}
        <SidebarProvider defaultOpen>
          <AppSidebar />
          {children}
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
