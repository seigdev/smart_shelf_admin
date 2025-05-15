
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

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
import { PackagePlusIcon, Loader2, CheckCircle, CornerDownLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Shelf } from '@/types';

const dimensionSchema = z.object({
  length: z.coerce.number().positive({ message: 'Length must be positive.' }).optional(),
  width: z.coerce.number().positive({ message: 'Width must be positive.' }).optional(),
  height: z.coerce.number().positive({ message: 'Height must be positive.' }).optional(),
});

const formSchema = z.object({
  name: z.string().min(3, { message: 'Item name must be at least 3 characters.' }).max(100),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters.' }).max(50)
    .regex(/^[a-zA-Z0-9-]+$/, { message: 'SKU can only contain letters, numbers, and hyphens.' }),
  category: z.string().min(2, { message: 'Category must be at least 2 characters.' }).max(50),
  quantity: z.coerce.number().int({ message: 'Quantity must be a whole number.' }).min(0, { message: 'Quantity cannot be negative.' }),
  location: z.string().min(1, { message: 'Please select a shelf location.' }), // Updated for dropdown
  description: z.string().max(500, { message: 'Description must be 500 characters or less.' }).optional(),
  tags: z.string().max(100, { message: 'Tags must be 100 characters or less.' }).optional()
    .transform(val => val ? val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []),
  weight: z.coerce.number().positive({ message: 'Weight must be a positive number.' }).optional(),
  dimensions: dimensionSchema.optional(),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }).optional().or(z.literal('')),
});

type AddInventoryItemFormValues = z.infer<typeof formSchema>;

export default function AddInventoryItemPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [shelvesList, setShelvesList] = useState<Shelf[]>([]);
  const [isLoadingShelves, setIsLoadingShelves] = useState(true);
  const { toast } = useToast();

  const form = useForm<AddInventoryItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      location: '', // Will be set by Select
      description: '',
      tags: [],
      weight: undefined,
      dimensions: { length: undefined, width: undefined, height: undefined },
      imageUrl: '',
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

  const onSubmit: SubmitHandler<AddInventoryItemFormValues> = async (data) => {
    setIsLoading(true);
    console.log('Adding new inventory item with data:', data);
    // Simulate API call (in a real app, you'd save to Firestore here)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Inventory Item Added!',
      description: `Item "${data.name}" has been successfully added to the inventory.`,
      variant: 'default',
      action: (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ),
    });
    
    form.reset(); 
    setIsLoading(false);
    // Potentially navigate to the inventory list page: router.push('/inventory');
  };

  return (
    <SidebarInset className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageTitle 
          title="Add New Inventory Item"
          description="Enter the details of the new item to add it to your inventory."
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
                <CardDescription>Fill in all required information for the new inventory item.</CardDescription>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingShelves}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingShelves ? "Loading shelves..." : "Select a shelf"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingShelves ? (
                              <SelectItem value="loading" disabled>Loading shelves...</SelectItem>
                            ) : shelvesList.length === 0 ? (
                              <SelectItem value="no-shelves" disabled>No shelves available. Please register a shelf first.</SelectItem>
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., organic, coffee, beans" {...field} onChange={e => field.onChange(e.target.value)} value={Array.isArray(field.value) ? field.value.join(', ') : ''} />
                        </FormControl>
                        <FormDescription>Comma-separated tags.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://example.com/image.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                            <Input type="number" step="0.01" placeholder="e.g., 0.5" {...field} />
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
                                <Input type="number" step="0.1" placeholder="L" {...field} />
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
                                <Input type="number" step="0.1" placeholder="W" {...field} />
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
                                <Input type="number" step="0.1" placeholder="H" {...field} />
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
                <Button type="submit" disabled={isLoading || isLoadingShelves} className="w-full sm:w-auto">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PackagePlusIcon className="mr-2 h-4 w-4" />
                  )}
                  Add Item to Inventory
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </main>
    </SidebarInset>
  );
}


    