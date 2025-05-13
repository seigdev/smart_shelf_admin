'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppHeader() {
  return (
    <header className="flex h-14 items-center shrink-0 border-b bg-background px-4 md:px-6">
      <SidebarTrigger />
      {/* Future elements like breadcrumbs or user menu can be added here */}
    </header>
  );
}
