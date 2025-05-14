
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageTitle } from '@/components/common/page-title';
import type { RequestItem, RequestStatus } from '@/types';
import { placeholderRequests } from '@/lib/placeholder-data';
import { SidebarInset } from '@/components/ui/sidebar';
import { FileTextIcon, MoreHorizontal, SearchIcon, AlertTriangleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function InvoiceGenerationPage() {
  const [approvedRequests, setApprovedRequests] = useState<RequestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data and filter for approved requests
    const filtered = placeholderRequests.filter(req => req.status === 'Approved');
    setApprovedRequests(filtered);
  }, []);

  const handleGenerateInvoice = (request: RequestItem) => {
    console.log(`Generating invoice for request ${request.id}`);
    toast({
      title: 'Invoice Generation Started',
      description: `An invoice for request ID ${request.id} (${request.itemName}) is being generated.`,
      action: <FileTextIcon className="h-5 w-5 text-primary" />,
    });
    // In a real app, this would trigger an API call or a PDF generation process.
  };

  const filteredApprovedRequests = useMemo(() => {
    if (!searchTerm) return approvedRequests;
    const term = searchTerm.toLowerCase();
    return approvedRequests.filter(
      (request) =>
        request.id.toLowerCase().includes(term) ||
        request.itemName.toLowerCase().includes(term) ||
        request.requesterName.toLowerCase().includes(term)
    );
  }, [approvedRequests, searchTerm]);

  return (
    <SidebarInset className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageTitle
          title="Invoice Generation"
          description="Generate invoices for approved item requests."
        />

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Approved Requests</CardTitle>
                <CardDescription>
                  Displaying {filteredApprovedRequests.length} of {approvedRequests.length} requests ready for invoicing.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search ID, item, requester..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredApprovedRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Approval Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprovedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono">{request.id}</TableCell>
                      <TableCell className="font-medium">{request.itemName}</TableCell>
                      <TableCell className="text-right">{request.quantityRequested}</TableCell>
                      <TableCell>{request.requesterName}</TableCell>
                      <TableCell>
                        {request.approvalDate ? new Date(request.approvalDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                       <TableCell>
                        <Badge variant={'default'} 
                               className={'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 border-transparent'}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleGenerateInvoice(request)}
                          size="sm"
                        >
                          <FileTextIcon className="mr-2 h-4 w-4" />
                          Generate Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangleIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Approved Requests Found</h3>
                <p className="text-muted-foreground">
                  There are currently no approved requests available for invoice generation.
                </p>
                 <Link href="/requests" passHref>
                  <Button variant="link" className="mt-2">
                    View All Requests
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  );
}
