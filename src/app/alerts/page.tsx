'use client';

import { PlaceholderContent } from '@/components/common/placeholder-content';
import { SidebarInset } from '@/components/ui/sidebar';

export default function AlertsPage() {
  return (
    <SidebarInset className="flex flex-1 flex-col p-4 md:p-6">
      <PlaceholderContent
        title="Alerts"
        description="View and manage system alerts. This includes notifications for security breaches, unauthorized access attempts, critical stock levels, motion detection events, and system tampering."
      />
    </SidebarInset>
  );
}
