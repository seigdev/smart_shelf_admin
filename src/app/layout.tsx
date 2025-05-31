
'use client';

import { Inter, Roboto_Mono } from 'next/font/google';
import { usePathname } from 'next/navigation';
import './globals.css'; // Global styles
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';

const inter = Inter({ 
  variable: '--font-inter',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ 
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

// Note: Metadata cannot be dynamically set in a 'use client' component this way.
// For dynamic titles based on route, individual page.tsx files should export metadata,
// or a more complex server-side metadata generation approach is needed if the layout is client-side.
// We'll set a generic title here. The login page can have its own specific metadata.
// export const metadata: Metadata = {
//   title: 'ShelfPilot',
//   description: 'Intelligent Inventory Management',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  // Dynamic metadata (example for title, won't fully work in client component for initial load)
  // if (typeof document !== 'undefined') {
  //   document.title = isLoginPage ? 'ShelfPilot - Authentication' : 'ShelfPilot';
  // }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Generic metadata can be placed here if needed, or rely on page-specific metadata */}
        <title>{isLoginPage ? 'ShelfPilot - Authentication' : 'ShelfPilot'}</title>
        <meta name="description" content={isLoginPage ? 'Login to ShelfPilot' : 'Intelligent Inventory Management by ShelfPilot'} />
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} antialiased bg-background text-foreground`}>
        {isLoginPage ? (
          <main className="flex min-h-screen flex-col items-center justify-center p-4">
            {children}
          </main>
        ) : (
          <SidebarProvider defaultOpen>
            <AppSidebar />
            <div className="flex flex-col flex-1 min-h-0 min-w-0">
              <AppHeader />
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </div>
          </SidebarProvider>
        )}
        <Toaster />
      </body>
    </html>
  );
}
