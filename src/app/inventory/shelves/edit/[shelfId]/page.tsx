
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
import { Textarea } from '@/components/ui/textarea';
import { PageTitle } from '@/components/common/page-title';
import { SidebarInset } from '@/components/ui/sidebar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, CornerDownLeft, AlertTriangle, SaveIcon } from 'lucide-react';
import type { Shelf } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Shelf name must be at least 2 characters.' }).max(50, { message: 'Shelf name must be 50 characters or less.' }),
  locationDescription: z.string().min(5, { message: 'Location description must be at least 5 characters.' }).max(100, { message: 'Location description must be 100 characters or less.' }),
  notes: z.string().max(200, { message: 'Notes must be 200 characters or less.' }).optional().nullable(),
});

type EditShelfFormValues = z.infer<typeof formSchema>;

export default function EditShelfPage() {
  const [isSaving, setIsSaving] = useState(false); // Changed from isLoading to isSaving for clarity
  const [isFetching, setIsFetching] = useState(true);
  const [shelf, setShelf] = useState<Shelf | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const shelfId = params.shelfId as string;

  const form = useForm<EditShelfFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      locationDescription: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (shelfId) {
      const fetchShelfData = async () => {
        setIsFetching(true);
        setNotFound(false);
        try {
          const shelfDocRef = doc(db, 'shelves', shelfId);
          const shelfSnap = await getDoc(shelfDocRef);

          if (shelfSnap.exists()) {
            const shelfData = shelfSnap.data() as Omit<Shelf, 'id'>;
            setShelf({ id: shelfSnap.id, ...shelfData });
            form.reset({
              name: shelfData.name,
              locationDescription: shelfData.locationDescription,
              notes: shelfData.notes || '',
            });
          } else {
            setNotFound(true);
            setShelf(null);
            toast({ title: "Not Found", description: "Shelf data could not be found.", variant: "destructive" });
          }
        } catch (error) {
          console.error("Error fetching shelf: ", error);
          toast({ title: "Error", description: "Could not fetch shelf details from database.", variant: "destructive" });
          setNotFound(true);
        }
        setIsFetching(false);
      };
      fetchShelfData();
    }
  }, [shelfId, form, toast]);

  const onSubmit: SubmitHandler<EditShelfFormValues> = async (data) => {
    if (!shelf) return;
    setIsSaving(true);
    try {
      const shelfDocRef = doc(db, 'shelves', shelf.id);
      await updateDoc(shelfDocRef, data); 
      
      toast({
        title: 'Shelf Updated!',
        description: `Shelf "${data.name}" has been successfully updated in the database.`,
        action: (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ),
      });
      router.push('/inventory/shelves'); // Navigate back to shelves list
    } catch (error) {
      console.error("Error updating shelf: ", error);
      toast({ title: "Error", description: "Could not update shelf in the database.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
     return (
      <SidebarInset className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-6">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading shelf details...</p>
        </main>
      </SidebarInset>
    );
  }
  
  if (notFound) {
    return (
      <SidebarInset className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-6">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h2 className="text-2xl font-semibold">Shelf Not Found</h2>
          <p className="text-muted-foreground">The shelf you are looking for does not exist in the database.</p>
          <Link href="/inventory/shelves" passHref>
            <Button variant="outline">
              <CornerDownLeft className="mr-2 h-4 w-4" />
              Back to Shelves
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
          title="Edit Shelf"
          description={`Editing details for: ${shelf?.name || 'shelf'}`}
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
                <CardDescription>Update the details for this shelf.</CardDescription>
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
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SaveIcon className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </main>
    </SidebarInset>
  );
}
