'use client';

import { PlaceholderContent } from '@/components/common/placeholder-content';
import { SidebarInset } from '@/components/ui/sidebar';


export default function AddInventoryItemPage() {
  return (
    <SidebarInset className="flex flex-1 flex-col p-4 md:p-6">
      <PlaceholderContent
        title="Add New Inventory Item"
        description="This section will allow administrators to add new items to the inventory, including details like name, SKU, category, quantity, location, and other relevant attributes."
      />
    </SidebarInset>
  );
}
