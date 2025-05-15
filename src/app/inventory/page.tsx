
'use client';

import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/common/page-title';
import type { InventoryItem } from '@/types';
import { PackageSearchIcon, SearchIcon, Edit3Icon, Trash2Icon, PlusCircleIcon, AlertTriangleIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SidebarInset } from '@/components/ui/sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  async function fetchInventoryItems() {
    setIsLoading(true);
    try {
      const itemsCollectionRef = collection(db, 'inventoryItems');
      const q = query(itemsCollectionRef, orderBy('name')); // Example: order by name
      const itemsSnapshot = await getDocs(q);
      const fetchedItems = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setInventoryItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching inventory items: ", error);
      toast({ title: "Error", description: "Could not fetch inventory items from database.", variant: "destructive" });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return inventoryItems;
    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [inventoryItems, searchTerm]);

  const openDeleteDialog = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      setIsDeleting(true);
      try {
        await deleteDoc(doc(db, 'inventoryItems', itemToDelete.id));
        toast({
          title: 'Item Deleted',
          description: `Item "${itemToDelete.name}" has been successfully deleted from the database.`,
        });
        fetchInventoryItems(); // Refetch items to update the list
      } catch (error) {
        console.error("Error deleting item: ", error);
        toast({ title: "Error deleting item", description: "Could not delete the item from the database.", variant: "destructive" });
      }
      setItemToDelete(null);
      setIsDeleting(false);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <SidebarInset className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageTitle title="Browse Inventory" description="Search and manage your inventory items.">
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
                  Displaying {filteredItems.length} of {inventoryItems.length} items from the database.
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
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            ) : filteredItems.length > 0 ? (
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
                          src={item.imageUrl || `https://placehold.co/64x64.png`}
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
                      <TableCell>{item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/inventory/edit/${item.id}`} passHref>
                          <Button variant="ghost" size="icon" className="mr-2" aria-label="Edit item">
                            <Edit3Icon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" 
                                aria-label="Delete item" onClick={() => openDeleteDialog(item)}
                                disabled={isDeleting && itemToDelete?.id === item.id}
                        >
                          {isDeleting && itemToDelete?.id === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2Icon className="h-4 w-4" />}
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
                  {searchTerm ? "Try adjusting your search term." : "There are no items in the inventory database yet."}
                </p>
                 {!searchTerm && inventoryItems.length === 0 && (
                   <Link href="/inventory/add" passHref>
                    <Button className="mt-4">
                      <PlusCircleIcon className="mr-2 h-4 w-4" />
                      Add Your First Item
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="h-6 w-6 text-destructive" />
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete item "{itemToDelete?.name}"? This action cannot be undone and will remove it from the database.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </SidebarInset>
  );
}
