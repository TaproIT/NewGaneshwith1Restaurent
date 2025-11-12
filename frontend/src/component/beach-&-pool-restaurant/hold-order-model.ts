export type HoldOrderServiceType = "Dine-In" | "Take-Away" | "Save-To-Room";

export interface HoldOrder {
    _id: string;
    orderNumber: string;
    serviceType: HoldOrderServiceType
    customerType: string;
    guestName: string;
    restaurantTable: {
        _id: string;
        tableNumber: number;
    }
};

export interface FetchHoldOrdersStatus {
     loading: boolean,
     error: string | null
}

export interface HoldOrders {
    holdOrders: HoldOrder[];
    selectedHoldOrderId: string | null;
    fetchHoldOrdersStatus: FetchHoldOrdersStatus
}

