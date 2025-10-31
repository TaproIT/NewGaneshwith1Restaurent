export interface CustomerTypeCount {
  customerType: string;
  count: number;
}

export interface CustomerStats {
  totalCustomers: number;
  byCustomerType: CustomerTypeCount[];
}
