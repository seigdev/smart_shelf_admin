
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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
import { Loader2, CheckCircle, CornerDownLeft, AlertTriangle, SaveIcon } from 'lucide-react';
import type { InventoryItem, InventoryItemWrite, Shelf } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';

const dimensionSchema = z.object({
  length: z.coerce.number().positive({ message: 'Length must be positive.' }).optional().nullable(),
  width: z.coerce.number().positive({ message: 'Width must be positive.' }).optional().nullable(),
  height: z.coerce.number().positive({ message: 'Height must be positive.' }).optional().nullable(),
});

const formSchema = z.object({
  name: z.string().min(3, { message: 'Item name must be at least 3 characters.' }).max(100),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters.' }).max(50)
    .regex(/^[a-zA-Z0-9-]+$/, { message: 'SKU can only contain letters, numbers, and hyphens.' }),
  category: z.string().min(2, { message: 'Category must be at least 2 characters.' }).max(50),
  quantity: z.coerce.number().int({ message: 'Quantity must be a whole number.' }).min(0, { message: 'Quantity cannot be negative.' }),
  location: z.string().min(1, { message: 'Please select a shelf location.' }),
  description: z.string().max(500, { message: 'Description must be 500 characters or less.' }).optional().nullable(),
  weight: z.coerce.number().positive({ message: 'Weight must be a positive number.' }).optional().nullable(),
  dimensions: dimensionSchema.optional().nullable(),
});

type EditInventoryItemFormValues = z.infer<typeof formSchema>;

export default function EditInventoryItemPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingItem, setIsFetchingItem] = useState(true);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [shelvesList, setShelvesList] = useState<Shelf[]>([]);
  const [isLoadingShelves, setIsLoadingShelves] = useState(true);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const itemId = params.itemId as string;

  const form = useForm<EditInventoryItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      location: '',
      description: '',
      weight: undefined,
      dimensions: { length: undefined, width: undefined, height: undefined },
    },
  });

  useEffect(() => {
    async function fetchShelvesForDropdown() {
      setIsLoadingShelves(true);
      try {
        const shelvesCollectionRef = collection(db, 'shelves');
        const q = query(shelvesCollectionRef, orderBy('name'));
        const shelvesSnapshot = await getDocs(q);
        const fetchedShelves = shelvesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shelf));
        setShelvesList(fetchedShelves);
      } catch (error) {
        console.error("Error fetching shelves for dropdown: ", error);
        toast({ title: "Error", description: "Could not fetch shelves.", variant: "destructive" });
      }
      setIsLoadingShelves(false);
    }
    fetchShelvesForDropdown();
  }, [toast]);

  useEffect(() => {
    if (itemId) {
      const fetchItemData = async () => {
        setIsFetchingItem(true);
        setNotFound(false);
        try {
          const itemDocRef = doc(db, 'inventoryItems', itemId);
          const itemSnap = await getDoc(itemDocRef);

          if (itemSnap.exists()) {
            const itemData = { id: itemSnap.id, ...itemSnap.data() } as InventoryItem;
            setItem(itemData);
            form.reset({
              ...itemData,
              description: itemData.description || '',
              weight: itemData.weight || undefined,
              dimensions: {
                length: itemData.dimensions?.length || undefined,
                width: itemData.dimensions?.width || undefined,
                height: itemData.dimensions?.height || undefined,
              }
            });
          } else {
            setNotFound(true);
            setItem(null);
            toast({ title: "Not Found", description: "Inventory item could not be found.", variant: "destructive" });
          }
        } catch (error) {
          console.error("Error fetching item: ", error);
          toast({ title: "Error", description: "Could not fetch item details.", variant: "destructive" });
          setNotFound(true); 
        }
        setIsFetchingItem(false);
      };
      fetchItemData();
    }
  }, [itemId, form, toast]);

  const onSubmit: SubmitHandler<EditInventoryItemFormValues> = async (data) => {
    if (!item) return;
    setIsSaving(true);
    
    const itemDataToUpdate: { [key: string]: any } = {
      name: data.name,
      sku: data.sku,
      category: data.category,
      quantity: data.quantity,
      location: data.location,
      lastUpdated: serverTimestamp(),
    };

    if (data.description && data.description.trim() !== '') {
      itemDataToUpdate.description = data.description;
    } else {
      // If description is empty or undefined, explicitly set to null or delete
      // For update, often you want to remove the field or set to null
      // To remove: delete itemDataToUpdate.description; (but updateDoc won't remove fields not present unless using FieldValue.delete())
      // For now, setting to null if empty, assuming type allows null or it's handled by Firestore rules/converters
      itemDataToUpdate.description = null; 
    }

    if (data.weight !== undefined) {
      itemDataToUpdate.weight = data.weight;
    } else {
      itemDataToUpdate.weight = null; // or FieldValue.delete()
    }

    if (data.dimensions) {
      const dims: { [key: string]: number } = {};
      if (data.dimensions.length !== undefined) {
        dims.length = data.dimensions.length;
      }
      if (data.dimensions.width !== undefined) {
        dims.width = data.dimensions.width;
      }
      if (data.dimensions.height !== undefined) {
        dims.height = data.dimensions.height;
      }
      if (Object.keys(dims).length > 0) {
        itemDataToUpdate.dimensions = dims;
      } else {
        itemDataToUpdate.dimensions = null; // or FieldValue.delete()
      }
    } else {
       itemDataToUpdate.dimensions = null; // or FieldValue.delete()
    }


    try {
      const itemDocRef = doc(db, 'inventoryItems', item.id);
      // Firestore's updateDoc merges data. To remove a field, you'd use FieldValue.delete().
      // For simplicity here, we're setting to null if empty/undefined.
      // Alternatively, build the object with only defined fields for a merge-update.
      // This current approach might store nulls.
      await updateDoc(itemDocRef, itemDataToUpdate); 
      
      toast({
        title: 'Inventory Item Updated!',
        description: `Item "${data.name}" has been successfully updated in the database.`,
        action: (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ),
      });
      router.push('/inventory'); 
    } catch (error) {
      console.error("Error updating inventory item: ", error);
      toast({ title: "Error", description: "Could not update item in the database.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetchingItem) {
     return (
      <SidebarInset className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-6">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading item details...</p>
        </main>
      </SidebarInset>
    );
  }
  
  if (notFound) {
    return (
      <SidebarInset className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-6">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h2 className="text-2xl font-semibold">Item Not Found</h2>
          <p className="text-muted-foreground">The inventory item you are looking for does not exist in the database.</p>
          <Link href="/inventory" passHref>
            <Button variant="outline">
              <CornerDownLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Button>
          </Link>
        </main>
      </SidebarInset>
    );
  }


  return (
    <SidebarInset className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageTitle 
          title="Edit Inventory Item"
          description={`Editing details for: ${item?.name || 'item'}`}
        >
          <Link href="/inventory" passHref>
            <Button variant="outline">
              <CornerDownLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Button>
          </Link>
        </PageTitle>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="max-w-3xl mx-auto w-full">
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>Update the information for this inventory item.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Premium Coffee Beans" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU* (Stock Keeping Unit)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., COF-PREM-500G" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Groceries" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity*</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location* (Shelf)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingShelves || isSaving}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingShelves ? "Loading shelves..." : "Select a shelf"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingShelves ? (
                              <SelectItem value="loading" disabled>Loading shelves...</SelectItem>
                            ) : shelvesList.length === 0 ? (
                              <SelectItem value="no-shelves" disabled>No shelves available. Register a shelf first.</SelectItem>
                            ) : (
                              shelvesList.map((shelf) => (
                                <SelectItem key={shelf.id} value={shelf.name}>
                                  {shelf.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>Select the shelf where the item is stored.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the item..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Physical Attributes (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="e.g., 0.5" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <Label>Dimensions (cm)</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="dimensions.length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">Length</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" placeholder="L" {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dimensions.width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">Width</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" placeholder="W" {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dimensions.height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">Height</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" placeholder="H" {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving || isLoadingShelves || isFetchingItem} className="w-full sm:w-auto">
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SaveIcon className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </main>
    </SidebarInset>
  );
}
