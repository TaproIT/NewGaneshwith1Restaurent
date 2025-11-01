export interface OrderTypeCount {
  serviceType: string;
  count: number;
}

export interface OrderStats {
  totalOrders: number;
  byServiceType: OrderTypeCount[];
}
