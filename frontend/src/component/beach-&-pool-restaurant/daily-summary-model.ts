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
   serviceType: string;
   orderTokens: DailyOrderToken[];
}

export interface DailyOrderSummary {
  date: string;
  summary: {
    dineInCount: number;
    takeAwayCount: number;
    saveToRoomCount: number;
    totalOrders: number;
  }
  orders: DailyOrder[];
  selectedOrderId: string;
  fetchDailyOrderSummaryStatus: FetchDailyOrderSummaryStatus;
}
