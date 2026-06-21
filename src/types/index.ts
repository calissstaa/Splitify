// src/types/index.ts

export interface Person {
  id: string;
  name: string;
  avatar: string; // Emoji avatar
  color: string;  // Accent color hex
}

export interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo: string[]; // Array of Person IDs
}

export type SplitMode = "quick" | "itemized";

export type DiscountType = "flat" | "percentage";

export interface ToastMessage {
  id: string;
  message: string;
  type?: "info" | "success" | "warning";
}

export interface PersonBreakdown {
  personId: string;
  subtotal: number;
  taxShare: number;
  tipShare: number;
  discountShare: number;
  total: number;
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    assignedCount: number;
    shareOfCost: number;
  }[];
}
