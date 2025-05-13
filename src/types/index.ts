export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string; // Shelf location
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

export interface ShelfLocationSuggestion {
  shelfLocationSuggestion: string;
  rationale: string;
}
