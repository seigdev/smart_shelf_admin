
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string; // Shelf location (can be a reference to a Shelf ID later)
  lastUpdated: string; // Date string
  imageUrl?: string;
  description?: string;
  tags?: string[];
  weight?: number; // in kg
  dimensions?: { // in cm
    length: number;
    width: number;
    height: number;
  };
}

export interface Shelf {
  id: string;
  name: string; // e.g., "A1-Top", "Receiving Area - Bin 3"
  locationDescription: string; // e.g., "Warehouse Section A, Row 1, Upper level"
  notes?: string; // e.g., "For fragile items, max weight 20kg"
}

export interface ShelfLocationSuggestion {
  shelfLocationSuggestion: string;
  rationale: string;
}

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface RequestItem {
  id: string;
  itemName: string;
  itemId: string; // Should ideally link to InventoryItem.id
  quantityRequested: number;
  requesterName: string;
  requesterId?: string; // Optional: Link to a User.id
  requestDate: string; // ISO date string
  status: RequestStatus;
  approvedBy?: string; // Optional: User ID of approver
  approvalDate?: string; // Optional: ISO date string
  notes?: string;
}

