
'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageTitle } from '@/components/common/page-title';
import { SidebarInset } from '@/components/ui/sidebar';
import type { Shelf } from '@/types';
import { PlusCircleIcon, SearchIcon, Edit3Icon, Trash2Icon, ListOrderedIcon, AlertTriangleIcon, Loader2 } from 'lucide-react';
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

export default function ViewShelvesPage() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [shelfToDelete, setShelfToDelete] = useState<Shelf | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  async function fetchShelves() {
    setIsLoading(true);
    try {
      const shelvesCollectionRef = collection(db, 'shelves');
      const q = query(shelvesCollectionRef, orderBy('name'));
      const shelvesSnapshot = await getDocs(q);
      const shelvesList = shelvesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shelf));
      setShelves(shelvesList);
    } catch (error) {
      console.error("Error fetching shelves: ", error);
      toast({ title: "Error", description: "Could not fetch shelves from database.", variant: "destructive" });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchShelves();
  }, []);

  const filteredShelves = useMemo(() => {
    if (!searchTerm) return shelves;
    return shelves.filter(shelf =>
      shelf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelf.locationDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shelf.notes && shelf.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [shelves, searchTerm]);

  const openDeleteDialog = (shelf: Shelf) => {
    setShelfToDelete(shelf);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteShelf = async () => {
    if (shelfToDelete) {
      setIsDeleting(true);
      try {
        await deleteDoc(doc(db, 'shelves', shelfToDelete.id));
        toast({
          title: 'Shelf Deleted',
          description: `Shelf "${shelfToDelete.name}" has been successfully deleted.`,
        });
        fetchShelves(); // Refetch shelves to update the list
      } catch (error) {
        console.error("Error deleting shelf: ", error);
        toast({ title: "Error deleting shelf", description: "Could not delete the shelf from database.", variant: "destructive" });
      }
      setShelfToDelete(null);
      setIsDeleting(false);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <SidebarInset className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageTitle title="View Shelves" description="Browse and manage all registered shelves.">
          <Link href="/inventory/shelves/add" passHref>
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Register New Shelf
            </Button>
          </Link>
        </PageTitle>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Registered Shelves</CardTitle>
                <CardDescription>
                  Displaying {filteredShelves.length} of {shelves.length} shelves.
                </CardDescription>
              </div>
              <div className="relative w-full max-w-sm">
                <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, location, or notes..."
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
            ) : filteredShelves.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location Description</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShelves.map((shelf) => (
                    <TableRow key={shelf.id}>
                      <TableCell className="font-medium">{shelf.name}</TableCell>
                      <TableCell>{shelf.locationDescription}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{shelf.notes || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/inventory/shelves/edit/${shelf.id}`} passHref>
                          <Button variant="ghost" size="icon" className="mr-2" aria-label="Edit shelf">
                            <Edit3Icon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Delete shelf" onClick={() => openDeleteDialog(shelf)} disabled={isDeleting && shelfToDelete?.id === shelf.id}>
                          {isDeleting && shelfToDelete?.id === shelf.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2Icon className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ListOrderedIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Shelves Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search term." : "There are no shelves registered in the database yet."}
                </p>
                {!searchTerm && shelves.length === 0 && (
                   <Link href="/inventory/shelves/add" passHref>
                    <Button className="mt-4">
                      <PlusCircleIcon className="mr-2 h-4 w-4" />
                      Register Your First Shelf
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
            Are you sure you want to delete shelf "{shelfToDelete?.name}"? This action cannot be undone and will permanently remove it from the database.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShelfToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteShelf}
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
