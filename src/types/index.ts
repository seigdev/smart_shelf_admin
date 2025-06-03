
import type { Timestamp, FieldValue } from 'firebase/firestore';

export interface InventoryItem {
  id: string; // Firestore document ID
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string; // Shelf name
  lastUpdated: string | Timestamp | FieldValue; // string for display, Timestamp from Firestore
  description?: string;
  weight?: number; // in kg
  dimensions?: { // in cm
    length?: number;
    width?: number;
    height?: number;
  };
}

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

// Represents a single line item within a larger request
export interface RequestedItemLine {
  itemId: string; // ID of the item in the inventoryItems collection
  itemName: string; // Name of the item (denormalized for easier display)
  quantityRequested: number;
}

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

// Represents the overall request document stored in Firestore
export interface ItemRequest {
  id: string; // Firestore document ID
  requesterName: string;
  requestDate: Timestamp | FieldValue | string; // Stored as Timestamp, written with serverTimestamp(), string for display
  status: RequestStatus;
  requests: RequestedItemLine[];

  approvedBy?: string;
  approvalDate?: Timestamp | FieldValue | string; // Stored as Timestamp, string for display
  notes?: string;
  lastUpdated?: Timestamp | FieldValue | string; // string for display
}

// Type for writing new ItemRequest documents to Firestore
export type ItemRequestWrite = Omit<ItemRequest, 'id' | 'requestDate' | 'approvalDate' | 'lastUpdated'> & {
  requestDate: FieldValue;
  approvalDate?: FieldValue;
  lastUpdated?: FieldValue;
};


// Type for display purposes in components (e.g., dates as strings)
// This will be the primary type used in component state after fetching and processing.
export interface ItemRequestDisplay extends Omit<ItemRequest, 'requestDate' | 'approvalDate' | 'lastUpdated'> {
  id: string;
  requesterName: string;
  requestDate: string; // Converted to string for display
  status: RequestStatus;
  requests: RequestedItemLine[];
  approvedBy?: string;
  approvalDate?: string; // Converted to string for display
  notes?: string;
  lastUpdated?: string; // Converted to string for display
}

