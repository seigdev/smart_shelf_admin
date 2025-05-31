
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageTitle } from '@/components/common/page-title';
import { SidebarInset } from '@/components/ui/sidebar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusSquareIcon, Loader2, CheckCircle, CornerDownLeft, Trash2Icon, PlusCircleIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import type { InventoryItem, ItemRequestWrite, RequestedItemLine } from '@/types';

const requestedItemSchema = z.object({
  selectedItemId: z.string().min(1, { message: 'Please select an item.' }),
  quantityRequested: z.coerce.number().int().positive({ message: 'Quantity must be positive.' }),
});

const formSchema = z.object({
  requesterName: z.string().min(2, { message: 'Requester name must be at least 2 characters.' }).max(100),
  notes: z.string().max(500, { message: 'Notes must be 500 characters or less.' }).optional(),
  requestedItemsArray: z.array(requestedItemSchema).min(1, { message: 'Please add at least one item to the request.' }),
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
      requesterName: '',
      notes: '',
      requestedItemsArray: [{ selectedItemId: '', quantityRequested: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "requestedItemsArray"
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

    const finalRequestedItems: RequestedItemLine[] = [];
    for (const item of data.requestedItemsArray) {
      const selectedInventoryItem = inventoryList.find(invItem => invItem.id === item.selectedItemId);
      if (!selectedInventoryItem) {
        toast({ title: "Error", description: `Selected item with ID ${item.selectedItemId} not found in inventory list.`, variant: "destructive" });
        setIsSaving(false);
        return;
      }
      finalRequestedItems.push({
        itemId: selectedInventoryItem.id,
        itemName: selectedInventoryItem.name,
        quantityRequested: item.quantityRequested,
      });
    }

    if (finalRequestedItems.length === 0) {
        toast({ title: "Error", description: "No valid items were added to the request.", variant: "destructive" });
        setIsSaving(false);
        return;
    }

    const requestDataForFirestore: ItemRequestWrite = {
      requesterName: data.requesterName,
      status: 'Pending',
      requests: finalRequestedItems,
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
        description: `Your request for ${finalRequestedItems.length} item(s) has been successfully submitted.`,
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

        <Card className="max-w-3xl mx-auto w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>Enter requester information and the items needed.</CardDescription>
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

                <div className="space-y-4">
                  <Label>Requested Items*</Label>
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 space-y-3 bg-secondary/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`requestedItemsArray.${index}.selectedItemId`}
                          render={({ field: itemField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Item {index + 1}</FormLabel>
                              <Select onValueChange={itemField.onChange} defaultValue={itemField.value} disabled={isLoadingInventory || isSaving}>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`requestedItemsArray.${index}.quantityRequested`}
                          render={({ field: qtyField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Quantity {index + 1}</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g., 5" {...qtyField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={isSaving}
                          className="w-full sm:w-auto"
                        >
                          <Trash2Icon className="mr-2 h-4 w-4" />
                          Remove Item {index + 1}
                        </Button>
                      )}
                    </Card>
                  ))}
                  {/* Display array-level errors (e.g., "Please add at least one item") */}
                  <FormMessage>{form.formState.errors.requestedItemsArray?.root?.message || form.formState.errors.requestedItemsArray?.message}</FormMessage>


                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ selectedItemId: '', quantityRequested: 1 })}
                    disabled={isSaving || isLoadingInventory}
                    className="w-full sm:w-auto"
                  >
                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                    Add Another Item
                  </Button>
                </div>

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
