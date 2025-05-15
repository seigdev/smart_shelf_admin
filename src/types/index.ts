
import type { Timestamp, FieldValue } from 'firebase/firestore';

export interface InventoryItem {
  id: string; // Firestore document ID
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string; // Shelf name (could be Shelf ID for better relation later)
  lastUpdated: string | Timestamp | FieldValue; // Allow string for client, Timestamp for Firestore read, FieldValue for serverTimestamp write
  description?: string;
  weight?: number; // in kg
  dimensions?: { // in cm
    length?: number;
    width?: number;
    height?: number;
  };
}

// Type for writing to Firestore, lastUpdated will be a serverTimestamp
export type InventoryItemWrite = Omit<InventoryItem, 'id' | 'lastUpdated'> & {
  lastUpdated: FieldValue;
};


export interface Shelf {
  id: string;
  name: string; 
  locationDescription: string; 
  notes?: string; 
}

export interface ShelfLocationSuggestion {
  shelfLocationSuggestion: string;
  rationale: string;
}

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface RequestItem {
  id: string;
  itemName: string;
  itemId: string; 
  quantityRequested: number;
  requesterName: string;
  requesterId?: string; 
  requestDate: string; // ISO date string
  status: RequestStatus;
  approvedBy?: string; 
  approvalDate?: string; 
  notes?: string;
}
