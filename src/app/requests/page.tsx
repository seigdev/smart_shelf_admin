
'use client';

import { useState, useMemo, useEffect, type ChangeEvent } from 'react';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTitle } from '@/components/common/page-title';
import type { RequestItem, RequestStatus } from '@/types';
import { SidebarInset } from '@/components/ui/sidebar';
import {
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  SearchIcon,
  PlusCircleIcon,
  ListFilter,
  Inbox,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';

const statusOptions: { value: RequestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // Stores ID of item being updated
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const { toast } = useToast();

  async function fetchRequests() {
    setIsLoading(true);
    try {
      const requestsCollectionRef = collection(db, 'itemRequests');
      // Consider adding more complex ordering later, e.g., by status then date
      const q = query(requestsCollectionRef, orderBy('requestDate', 'desc')); 
      const requestsSnapshot = await getDocs(q);
      const fetchedRequests = requestsSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data,
          requestDate: data.requestDate instanceof Timestamp ? data.requestDate.toDate().toISOString() : String(data.requestDate),
          approvalDate: data.approvalDate instanceof Timestamp ? data.approvalDate.toDate().toISOString() : undefined,
          lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate().toISOString() : undefined,
        } as RequestItem;
      });
      setRequests(fetchedRequests);
    } catch (error) {
      console.error("Error fetching requests: ", error);
      toast({ title: "Error", description: "Could not fetch requests from database.", variant: "destructive" });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateRequestStatus = async (requestId: string, newStatus: 'Approved' | 'Rejected') => {
    setIsUpdating(requestId);
    try {
      const requestDocRef = doc(db, 'itemRequests', requestId);
      const updateData: { status: RequestStatus; approvedBy?: string; approvalDate?: any; lastUpdated: any } = {
        status: newStatus,
        lastUpdated: serverTimestamp(),
      };

      if (newStatus === 'Approved') {
        updateData.approvedBy = 'Admin'; // Replace with actual user later
        updateData.approvalDate = serverTimestamp();
      }

      await updateDoc(requestDocRef, updateData);
      
      toast({
        title: `Request ${newStatus}`,
        description: `Request ID ${requestId} has been ${newStatus.toLowerCase()}.`,
      });
      fetchRequests(); // Refetch to show updated status
    } catch (error) {
      console.error(`Error updating request ${requestId} to ${newStatus}: `, error);
      toast({ title: "Error", description: `Could not update request status.`, variant: "destructive" });
    } finally {
      setIsUpdating(null);
    }
  };
  

  const filteredRequests = useMemo(() => {
    return requests
      .filter((request) => {
        if (statusFilter === 'all') return true;
        return request.status === statusFilter;
      })
      .filter((request) => {
        const term = searchTerm.toLowerCase();
        return (
          request.id.toLowerCase().includes(term) ||
          request.itemName.toLowerCase().includes(term) ||
          request.requesterName.toLowerCase().includes(term)
        );
      });
  }, [requests, searchTerm, statusFilter]);

  const getStatusBadgeVariant = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'Approved':
        return 'default'; 
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const getStatusBadgeClassName = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 border-yellow-500 dark:text-yellow-400 dark:border-yellow-600';
      case 'Approved':
         return 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 border-transparent';
      default:
        return '';
    }
  };


  return (
    <SidebarInset className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageTitle title="Request Management" description="View, approve, or reject item requests.">
          <Link href="/requests/new" passHref>
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create New Request
            </Button>
          </Link>
        </PageTitle>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>All Requests</CardTitle>
                <CardDescription>
                  Displaying {filteredRequests.length} of {requests.length} requests from the database.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search ID, item, requester..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as RequestStatus | 'all')}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <ListFilter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            ) : filteredRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-xs">{request.id}</TableCell>
                      <TableCell className="font-medium">{request.itemName}</TableCell>
                      <TableCell className="text-right">{request.quantityRequested}</TableCell>
                      <TableCell>{request.requesterName}</TableCell>
                      <TableCell>{request.requestDate ? new Date(request.requestDate as string).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(request.status)} className={getStatusBadgeClassName(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isUpdating === request.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isUpdating !== null}>
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => alert(`Viewing details for ${request.id} (Not implemented yet)`)}>
                                View Details
                              </DropdownMenuItem>
                              {request.status === 'Pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleUpdateRequestStatus(request.id, 'Approved')} className="text-green-600 hover:!text-green-700 dark:text-green-400 dark:hover:!text-green-500">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateRequestStatus(request.id, 'Rejected')} className="text-red-600 hover:!text-red-700 dark:text-red-400 dark:hover:!text-red-500">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Requests Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? "Try adjusting your search or filter criteria." : "There are no requests in the database matching the current criteria."}
                </p>
                {!(searchTerm || statusFilter !== 'all') && requests.length === 0 && (
                   <Link href="/requests/new" passHref>
                     <Button className="mt-4">
                       <PlusCircleIcon className="mr-2 h-4 w-4" />
                       Create Your First Request
                     </Button>
                   </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  );
}
