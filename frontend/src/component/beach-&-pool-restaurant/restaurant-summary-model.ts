export interface FetchRestaurantSummaryStatus {
     loading: boolean,
     error: string | null
}

export interface DailyRestaurantSummary{
   totalSubTotal: number;
   totalServiceCharge: number;
   totalBill: number;
   orderCount:number;
   customerType:string;
   date: string;
}

export interface RestaurantSummary {
  startDate: string;
  endDate: string;
  restaurantType: string;
  totalIncome: number;
  checkInIncome: number;
  walkInIncome: number;
  summaryList : DailyRestaurantSummary[];
  fetchRestaurantSummaryStatus: FetchRestaurantSummaryStatus;
}
