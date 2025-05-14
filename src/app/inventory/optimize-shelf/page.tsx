
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageTitle } from '@/components/common/page-title';
import { Loader2, LightbulbIcon, AlertTriangleIcon } from 'lucide-react';
// The type SuggestShelfLocationOutput might need to be adjusted if its definition is changed elsewhere.
// For now, assuming it's compatible or defined in a global types file.
import type { ShelfLocationSuggestion } from '@/types'; // Changed from SuggestShelfLocationOutput to ShelfLocationSuggestion
import { getShelfSuggestion } from './actions';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SidebarInset } from '@/components/ui/sidebar';


const formSchema = z.object({
  productName: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  productDescription: z.string().min(10, { message: 'Product description must be at least 10 characters.' }),
  currentInventory: z.string().min(10, { message: 'Current inventory details must be at least 10 characters.' }),
});

type ShelfOptimizationFormValues = z.infer<typeof formSchema>;

export default function OptimizeShelfPlacementPage() { // Renamed component
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<ShelfLocationSuggestion | null>(null); // Changed type
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ShelfOptimizationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      productDescription: '',
      currentInventory: '',
    },
  });

  const onSubmit: SubmitHandler<ShelfOptimizationFormValues> = async (data) => {
    setIsLoading(true);
    setSuggestion(null);
    setError(null);
    
    const result = await getShelfSuggestion(data);

    if ('error' in result) {
      setError(result.error);
    } else {
      setSuggestion(result);
    }
    setIsLoading(false);
  };

  return (
    <SidebarInset className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageTitle 
          title="Optimize Shelf Placement" // Updated title
          description="Get AI-powered suggestions for the best shelf location for new products."
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Enter information about the new product and current inventory.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Wireless Mouse XM300" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the product: dimensions, weight, special requirements, etc."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include details like size (e.g., 10cm x 5cm x 3cm), weight (e.g., 0.5kg), fragility, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentInventory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Inventory Summary</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe current inventory: e.g., Shelf A1: 50% full, small items; Shelf B2: Empty, for bulky items..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a summary of existing items, their locations, and available space on shelves.
                        </FormDescription>
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
                      <LightbulbIcon className="mr-2 h-4 w-4" />
                    )}
                    Get Suggestion
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <div className="space-y-6">
            {isLoading && (
              <Card className="flex flex-col items-center justify-center p-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Generating suggestion...</p>
                <p className="text-sm text-muted-foreground">The AI is thinking. This might take a moment.</p>
              </Card>
            )}

            {error && (
              <Card className="border-destructive bg-destructive/10">
                <CardHeader className="flex-row items-center gap-2">
                  <AlertTriangleIcon className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {suggestion && !isLoading && (
              <>
                <Card className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <LightbulbIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <CardTitle className="text-green-700 dark:text-green-300">Suggested Shelf Location</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-green-800 dark:text-green-200">
                      {suggestion.shelfLocationSuggestion}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Rationale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{suggestion.rationale}</p>
                  </CardContent>
                </Card>
              </>
            )}
            
            {!isLoading && !suggestion && !error && (
              <Card className="flex flex-col items-center justify-center p-10 text-center">
                <LightbulbIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Awaiting Input</p>
                <p className="text-sm text-muted-foreground">Fill out the form to get an AI-powered shelf suggestion.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </SidebarInset>
  );
}
