'use client';

import { PlaceholderContent } from '@/components/common/placeholder-content';
import { SidebarInset } from '@/components/ui/sidebar';

export default function UserManagementPage() {
  return (
    <SidebarInset className="flex flex-1 flex-col p-4 md:p-6">
      <PlaceholderContent
        title="User Access Management"
        description="Manage user accounts, assign roles and permissions, issue QR codes for access, and revoke access as needed. View user activity logs and manage user groups."
      />
    </SidebarInset>
  );
}
