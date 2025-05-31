
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageTitle } from '@/components/common/page-title';
import { SidebarInset } from '@/components/ui/sidebar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusSquareIcon, Loader2, CheckCircle, CornerDownLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import type { InventoryItem, ItemRequestWrite, RequestedItemLine } from '@/types';

const formSchema = z.object({
  selectedItemId: z.string().min(1, { message: 'Please select an item.' }),
  quantityRequested: z.coerce.number().int().positive({ message: 'Quantity must be a positive whole number.' }),
  requesterName: z.string().min(2, { message: 'Requester name must be at least 2 characters.' }).max(100),
  notes: z.string().max(500, { message: 'Notes must be 500 characters or less.' }).optional(),
});

type NewRequestFormValues = z.infer<typeof formSchema>;

export default function NewRequestPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<NewRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedItemId: '',
      quantityRequested: 1,
      requesterName: '',
      notes: '',
    },
  });

  useEffect(() => {
    async function fetchInventoryForDropdown() {
      setIsLoadingInventory(true);
      try {
        const itemsCollectionRef = collection(db, 'inventoryItems');
        const q = query(itemsCollectionRef, orderBy('name'));
        const itemsSnapshot = await getDocs(q);
        const fetchedItems = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
        setInventoryList(fetchedItems);
      } catch (error) {
        console.error("Error fetching inventory for dropdown: ", error);
        toast({ title: "Error", description: "Could not fetch inventory items.", variant: "destructive" });
      }
      setIsLoadingInventory(false);
    }
    fetchInventoryForDropdown();
  }, [toast]);

  const onSubmit: SubmitHandler<NewRequestFormValues> = async (data) => {
    setIsSaving(true);

    const selectedItem = inventoryList.find(item => item.id === data.selectedItemId);
    if (!selectedItem) {
      toast({ title: "Error", description: "Selected item not found.", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const requestedItemLine: RequestedItemLine = {
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantityRequested: data.quantityRequested,
    };

    const requestDataForFirestore: ItemRequestWrite = {
      requesterName: data.requesterName,
      status: 'Pending',
      requests: [requestedItemLine], // Changed 'items' to 'requests'
      requestDate: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    };

    if (data.notes && data.notes.trim() !== '') {
      requestDataForFirestore.notes = data.notes;
    }

    try {
      const requestsCollectionRef = collection(db, 'itemRequests');
      await addDoc(requestsCollectionRef, requestDataForFirestore);

      toast({
        title: 'Request Submitted!',
        description: `Request for "${selectedItem.name}" has been successfully submitted.`,
        variant: 'default',
        action: (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ),
      });

      form.reset();
      router.push('/requests');
    } catch (error) {
      console.error("Error submitting new request: ", error);
      toast({ title: "Error", description: "Could not submit new request to the database.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SidebarInset className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageTitle
          title="Create New Item Request"
          description="Fill out the form below to request items from the inventory."
        >
          <Link href="/requests" passHref>
            <Button variant="outline">
              <CornerDownLeft className="mr-2 h-4 w-4" />
              Back to Requests
            </Button>
          </Link>
        </PageTitle>

        <Card className="max-w-2xl mx-auto w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>Enter requester information and the item needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="requesterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requester Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="selectedItemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item to Request*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingInventory || isSaving}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingInventory ? "Loading inventory..." : "Select an item"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingInventory ? (
                            <SelectItem value="loading" disabled>Loading inventory...</SelectItem>
                          ) : inventoryList.length === 0 ? (
                            <SelectItem value="no-items" disabled>No inventory items available.</SelectItem>
                          ) : (
                            inventoryList.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} (SKU: {item.sku}, Stock: {item.quantity})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose the item you want to request.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantityRequested"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Requested*</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific details or reasons for this request..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving || isLoadingInventory} className="w-full sm:w-auto">
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusSquareIcon className="mr-2 h-4 w-4" />
                  )}
                  Submit Request
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </main>
    </SidebarInset>
  );
}
