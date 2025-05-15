
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageTitle } from '@/components/common/page-title';
import type { RequestItem } from '@/types';
import { SidebarInset } from '@/components/ui/sidebar';
import { FileTextIcon, SearchIcon, AlertTriangleIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

export default function InvoiceGenerationPage() {
  const [approvedRequests, setApprovedRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchApprovedRequests() {
      setIsLoading(true);
      try {
        const requestsCollectionRef = collection(db, 'itemRequests');
        const q = query(
          requestsCollectionRef, 
          where('status', '==', 'Approved'),
          orderBy('approvalDate', 'desc') // Order by when they were approved
        );
        const requestsSnapshot = await getDocs(q);
        const fetchedRequests = requestsSnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return { 
            id: docSnap.id, 
            ...data,
            requestDate: data.requestDate instanceof Timestamp ? data.requestDate.toDate().toISOString() : String(data.requestDate),
            approvalDate: data.approvalDate instanceof Timestamp ? data.approvalDate.toDate().toISOString() : String(data.approvalDate),
            lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate().toISOString() : undefined,
          } as RequestItem;
        });
        setApprovedRequests(fetchedRequests);
      } catch (error) {
        console.error("Error fetching approved requests: ", error);
        toast({ title: "Error", description: "Could not fetch approved requests from database.", variant: "destructive" });
      }
      setIsLoading(false);
    }
    fetchApprovedRequests();
  }, [toast]);

  const handleGenerateInvoice = (request: RequestItem) => {
    console.log(`Simulating invoice generation for request ${request.id}`);
    toast({
      title: 'Invoice Generation Simulated',
      description: `Invoice for request ID ${request.id} (${request.itemName}) would be generated here.`,
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
                <CardTitle>Approved Requests for Invoicing</CardTitle>
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
            {isLoading ? (
               <div className="flex justify-center items-center py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            ) : filteredApprovedRequests.length > 0 ? (
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
                      <TableCell className="font-mono text-xs">{request.id}</TableCell>
                      <TableCell className="font-medium">{request.itemName}</TableCell>
                      <TableCell className="text-right">{request.quantityRequested}</TableCell>
                      <TableCell>{request.requesterName}</TableCell>
                      <TableCell>
                        {request.approvalDate ? new Date(request.approvalDate as string).toLocaleDateString() : 'N/A'}
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
                  There are currently no approved requests available for invoice generation from the database.
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
