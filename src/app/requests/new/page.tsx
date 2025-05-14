
'use client';

import { PlaceholderContent } from '@/components/common/placeholder-content';
import { SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CornerDownLeft } from 'lucide-react';
import { PageTitle } from '@/components/common/page-title';

export default function NewRequestPage() {
  return (
    <SidebarInset className="flex flex-1 flex-col p-4 md:p-6">
       <PageTitle title="Create New Item Request" description="Fill out the form below to request new items.">
         <Link href="/requests" passHref>
            <Button variant="outline">
              <CornerDownLeft className="mr-2 h-4 w-4" />
              Back to Requests
            </Button>
          </Link>
        </PageTitle>
      <PlaceholderContent
        title="New Request Form"
        description="This form will allow users to select items from the inventory and specify quantities to create a new request. This feature is under development."
      />
    </SidebarInset>
  );
}
