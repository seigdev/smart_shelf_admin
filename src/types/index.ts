
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
