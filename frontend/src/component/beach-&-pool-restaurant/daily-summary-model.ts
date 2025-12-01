export interface FetchDailyOrderSummaryStatus {
     loading: boolean,
     error: string | null
}


export interface DailyOrderToken {
    tokenNumber: string;
    orderedTime: string;
    orderItems: string[];
}

export interface DailyOrder{
   _id: string;
   orderNumber: string;
   paymentMethod: string;
   roomNumber?: string;
   serviceType: string;
   customerType: string;
   orderTokens: DailyOrderToken[];
}

export interface DailyOrderSummary {
  date: string;
  startDate: Date | undefined,
  endDate: Date | undefined,
  summary: {
    dineInCount: number;
    takeAwayCount: number;
    saveToRoomCount: number;
    totalOrders: number;
    totalTokens: number;
  }
  orders: DailyOrder[];
  selectedOrderId: string;
  fetchDailyOrderSummaryStatus: FetchDailyOrderSummaryStatus;
}
