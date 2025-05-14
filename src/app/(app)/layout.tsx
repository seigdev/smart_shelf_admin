
import type { Metadata } from 'next';
// Note: Fonts are loaded in the root layout (src/app/layout.tsx)
// Globals.css is also loaded in the root layout.
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';

// Metadata specific to the authenticated app part can be defined here
// or in individual page.tsx files within the (app) group.
export const metadata: Metadata = {
  title: 'ShelfPilot',
  description: 'Intelligent Inventory Management by ShelfPilot',
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
  );
}
