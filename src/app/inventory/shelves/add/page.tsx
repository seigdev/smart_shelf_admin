
'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { LayoutPanelLeftIcon, Loader2, CheckCircle, CornerDownLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Shelf name must be at least 2 characters.' }).max(50, { message: 'Shelf name must be 50 characters or less.' }),
  locationDescription: z.string().min(5, { message: 'Location description must be at least 5 characters.' }).max(100, { message: 'Location description must be 100 characters or less.' }),
  notes: z.string().max(200, { message: 'Notes must be 200 characters or less.' }).optional(),
});

type RegisterShelfFormValues = z.infer<typeof formSchema>;

export default function RegisterShelfPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RegisterShelfFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      locationDescription: '',
      notes: '',
    },
  });

  const onSubmit: SubmitHandler<RegisterShelfFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const shelvesCollectionRef = collection(db, 'shelves');
      await addDoc(shelvesCollectionRef, data);
      
      toast({
        title: 'Shelf Registered!',
        description: `Shelf "${data.name}" has been successfully registered in the database.`,
        variant: 'default',
        action: (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ),
      });
      
      form.reset(); 
      router.push('/inventory/shelves'); // Navigate to shelves list after successful registration
    } catch (error) {
      console.error("Error registering shelf: ", error);
      toast({ title: "Error", description: "Could not register shelf in the database.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarInset className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageTitle 
          title="Register New Shelf"
          description="Add a new shelf to your inventory system by providing its details."
        >
          <Link href="/inventory/shelves" passHref>
            <Button variant="outline">
              <CornerDownLeft className="mr-2 h-4 w-4" />
              Back to Shelves
            </Button>
          </Link>
        </PageTitle>

        <Card className="max-w-2xl mx-auto w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Shelf Information</CardTitle>
                <CardDescription>Fill in the details for the new shelf to save it to the database.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shelf Name / ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A1-Top, Receiving Bin 03" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique name or identifier for the shelf.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Warehouse Section A, Row 1, Upper level" {...field} />
                      </FormControl>
                      <FormDescription>
                        Describe where this shelf is physically located.
                      </FormDescription>
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
                          placeholder="Any additional notes, e.g., capacity, type of items, fragility warnings."
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
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LayoutPanelLeftIcon className="mr-2 h-4 w-4" />
                  )}
                  Register Shelf
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </main>
    </SidebarInset>
  );
}
