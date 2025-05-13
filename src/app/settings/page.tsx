'use client';

import { PlaceholderContent } from '@/components/common/placeholder-content';
import { SidebarInset } from '@/components/ui/sidebar';

export default function SystemConfigurationPage() {
  return (
    <SidebarInset className="flex flex-1 flex-col p-4 md:p-6">
      <PlaceholderContent
        title="System Configuration"
        description="Configure various system settings, such as motion detection sensitivity, weight thresholds for shelves, notification preferences, API integrations, and general application settings."
      />
    </SidebarInset>
  );
}
