'use client';

import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/common/page-title';
import { placeholderInventoryItems } from '@/lib/placeholder-data';
import type { InventoryItem } from '@/types';
import { PackageSearchIcon, SearchIcon, Edit3Icon, Trash2Icon, PlusCircleIcon } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  useEffect(() => {
    // Simulate fetching data
    setInventoryItems(placeholderInventoryItems);
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return inventoryItems;
    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventoryItems, searchTerm]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <PageTitle title="Inventory Browser" description="Search and manage your inventory items.">
        <Link href="/inventory/add" passHref>
          <Button>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </Link>
      </PageTitle>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Items</CardTitle>
              <CardDescription>
                Displaying {filteredItems.length} of {inventoryItems.length} items.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, SKU, or category..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Image
                        src={item.imageUrl || `https://picsum.photos/seed/${item.id}/64/64`}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover aspect-square"
                        data-ai-hint="product photo"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2" aria-label="Edit item">
                        <Edit3Icon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Delete item">
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageSearchIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Items Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search term." : "There are no items in the inventory yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
