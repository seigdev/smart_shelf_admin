'use client';

import { PlaceholderContent } from '@/components/common/placeholder-content';
import { SidebarInset } from '@/components/ui/sidebar';

export default function NotificationsPage() {
  return (
    <SidebarInset className="flex flex-1 flex-col p-4 md:p-6">
      <PlaceholderContent
        title="Notification Management"
        description="Configure notification preferences, clear notification logs, set up reminders for tasks, and manage channels for receiving notifications (e.g., email, SMS, in-app)."
      />
    </SidebarInset>
  );
}
