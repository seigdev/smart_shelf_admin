'use client';

import { PlaceholderContent } from '@/components/common/placeholder-content';
import { SidebarInset } from '@/components/ui/sidebar';

export default function SecurityControlPage() {
  return (
    <SidebarInset className="flex flex-1 flex-col p-4 md:p-6">
      <PlaceholderContent
        title="Security Control"
        description="Manage system security settings. Enable or disable alarms, switch between different security modes (e.g., armed, disarmed, night mode), view security event logs, and configure access control policies."
      />
    </SidebarInset>
  );
}
