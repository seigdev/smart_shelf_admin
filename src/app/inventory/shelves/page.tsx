
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
import { placeholderShelves } from '@/lib/placeholder-data';
import { PlusCircleIcon, SearchIcon, Edit3Icon, Trash2Icon, ListOrderedIcon } from 'lucide-react';

export default function ViewShelvesPage() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate fetching data
    setShelves(placeholderShelves);
  }, []);

  const filteredShelves = useMemo(() => {
    if (!searchTerm) return shelves;
    return shelves.filter(shelf =>
      shelf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelf.locationDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shelf.notes && shelf.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [shelves, searchTerm]);

  const handleDeleteShelf = (shelfId: string) => {
    // Placeholder for delete functionality
    console.log('Attempting to delete shelf:', shelfId);
    alert(`Delete functionality for shelf ${shelfId} is not yet implemented.`);
    // setShelves(prevShelves => prevShelves.filter(shelf => shelf.id !== shelfId));
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
            {filteredShelves.length > 0 ? (
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
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Delete shelf" onClick={() => handleDeleteShelf(shelf.id)}>
                          <Trash2Icon className="h-4 w-4" />
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
                  {searchTerm ? "Try adjusting your search term." : "There are no shelves registered yet."}
                </p>
                {!searchTerm && (
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
    </SidebarInset>
  );
}
