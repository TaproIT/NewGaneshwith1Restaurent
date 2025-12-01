export interface TotalGuests {
  ganeshGardenBeachCabana: number;
  marakolliyaBeachResort: number;
}

// Define the main data structure
export interface MonthlyReport {
  month: string;
  totalGuests: TotalGuests;
  totalAvailableRooms: number;
  totalInvoices: number;
}