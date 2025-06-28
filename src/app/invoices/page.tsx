
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
import type { ItemRequestDisplay, RequestStatus } from '@/types';
import { SidebarInset } from '@/components/ui/sidebar';
import { FileTextIcon, SearchIcon, AlertTriangleIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';


export default function InvoiceGenerationPage() {
  const [approvedRequests, setApprovedRequests] = useState<ItemRequestDisplay[]>([]);
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
          orderBy('approvalDate', 'desc')
        );
        const requestsSnapshot = await getDocs(q);
        const fetchedRequests = requestsSnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          const item: ItemRequestDisplay = {
            id: docSnap.id,
            requesterName: (data.requesterName || "Unknown Requester") as string,
            status: data.status as RequestStatus,
            requests: data.requests || [],

            requestDate: data.requestDate instanceof Timestamp
                            ? data.requestDate.toDate().toISOString()
                            : String(data.requestDate || ''),

            approvedBy: data.approvedBy as string | undefined,
            approvalDate: data.approvalDate instanceof Timestamp
                            ? data.approvalDate.toDate().toISOString()
                            : (data.approvalDate ? String(data.approvalDate) : undefined),
            notes: data.notes as string | undefined,
            lastUpdated: data.lastUpdated instanceof Timestamp
                            ? data.lastUpdated.toDate().toISOString()
                            : (data.lastUpdated ? String(data.lastUpdated) : undefined),
            invoiceUrl: data.invoiceUrl as string | undefined,
          };
          return item;
        });
        setApprovedRequests(fetchedRequests);
      } catch (error) {
        console.error("Error fetching approved requests: ", error);
        if (error instanceof Error && error.message.includes("requires an index")) {
            toast({
                title: "Firestore Index Required",
                description: "A Firestore index is needed for this query. Please check the browser console for a link to create it.",
                variant: "destructive",
                duration: 10000,
            });
            console.error("Firestore Index Creation Link (from error object):", error);
        } else {
            toast({ title: "Error", description: "Could not fetch approved requests from database.", variant: "destructive" });
        }
      }
      setIsLoading(false);
    }
    fetchApprovedRequests();
  }, [toast]);

  const filteredApprovedRequests = useMemo(() => {
    if (!searchTerm) return approvedRequests;
    const term = searchTerm.toLowerCase();
    return approvedRequests.filter(
      (request) =>
        request.id.toLowerCase().includes(term) ||
        (request.requests[0]?.itemName.toLowerCase() || '').includes(term) ||
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
                  Displaying {filteredApprovedRequests.length} of {approvedRequests.length} approved requests.
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
                    <TableHead>Item(s)</TableHead>
                    <TableHead className="text-right">Quantity (First Item)</TableHead>
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
                      <TableCell className="font-medium">
                        {request.requests[0]?.itemName || 'N/A'} 
                        {request.requests.length > 1 && ` (+${request.requests.length - 1} more)`}
                      </TableCell>
                      <TableCell className="text-right">{request.requests[0]?.quantityRequested || 'N/A'}</TableCell>
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
                        {request.invoiceUrl ? (
                          <a href={request.invoiceUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm">
                              <FileTextIcon className="mr-2 h-4 w-4" />
                              View Invoice
                            </Button>
                          </a>
                        ) : (
                          <Button size="sm" disabled variant="secondary">
                            Invoice Not Ready
                          </Button>
                        )}
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
