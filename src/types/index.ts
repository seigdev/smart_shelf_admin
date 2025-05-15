
import type { Timestamp, FieldValue } from 'firebase/firestore';

export interface InventoryItem {
  id: string; // Firestore document ID
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string; // Shelf name
  lastUpdated: string | Timestamp | FieldValue;
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

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface RequestItem {
  id: string; // Firestore document ID
  itemName: string;
  itemId: string; // ID of the item in the inventoryItems collection
  quantityRequested: number;
  requesterName: string;
  requestDate: Timestamp | FieldValue; // Stored as Timestamp, written with serverTimestamp()
  status: RequestStatus;
  approvedBy?: string; 
  approvalDate?: Timestamp | FieldValue; // Stored as Timestamp, written with serverTimestamp()
  notes?: string;
  lastUpdated?: Timestamp | FieldValue;
}

// Type for writing new requests to Firestore
export type RequestItemWrite = Omit<RequestItem, 'id' | 'requestDate' | 'approvalDate' | 'lastUpdated'> & {
  requestDate: FieldValue;
  approvalDate?: FieldValue;
  lastUpdated?: FieldValue;
};
