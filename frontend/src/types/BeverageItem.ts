// types/BeverageItem.ts
export interface BeverageItem {
  _id: string;
  beverageName: string;
  category: "soft drinks" | "cola" | "hard liquor";
  currentMonthAvailable: number;
  currentMonthStock: number;
  price: number;
  status: "active" | "inactive";
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  lastUpdateAt: string;
  runningStock: number;
  history: any[]; // can type later if needed
}
