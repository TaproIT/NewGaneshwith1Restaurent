export interface OrganizedRoom {
  roomNo: string | number;
  nights: number;
  perDayPrice: number;
  currency: string;
  finalPrice: number;
  displayPrice: string;
  lkrRate: number | null;
}

 export interface OrganizedOrder {
  date: string;
  type: string;
  total: number;
  displayTotal: string;
}
