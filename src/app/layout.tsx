import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header'; // Import the new AppHeader
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ 
  variable: '--font-inter',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ 
  variable: '--font-roboto-mono',
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
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <div className="flex flex-col flex-1 min-h-0 min-w-0"> {/* Wrapper for header and main content */}
            <AppHeader />
            {/* children will typically be a Page component wrapping its content in SidebarInset */}
            <div className="flex-1 overflow-auto"> {/* Added wrapper for scrollable content area */}
              {children}
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
