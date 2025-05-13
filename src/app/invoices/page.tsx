'use client';

import { PlaceholderContent } from '@/components/common/placeholder-content';
import { SidebarInset } from '@/components/ui/sidebar';

export default function InvoiceGenerationPage() {
  return (
    <SidebarInset className="flex flex-1 flex-col p-4 md:p-6">
      <PlaceholderContent
        title="Invoice Generation"
        description="Generate and export invoices for services or items. Manage invoice templates, track payment statuses, and view invoice history. PDF export functionality will be available."
      />
    </SidebarInset>
  );
}
