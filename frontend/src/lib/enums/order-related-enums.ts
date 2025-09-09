export const CustomerTypes = Object.freeze({
  CHECKED_IN: { value: "Checked-In",label: "Checked-in"},
  WALK_IN: { value: "Walk-In",label: "Walk-in"},
});

export const ServiceTypes = Object.freeze({
  DINE_IN: { value: "Dine-In", label: "Dine-in" },
  SAVE_TO_ROOM: { value: "Save-To-Room", label: "Save to room" },
  TAKE_AWAY: { value: "Take-Away", label: "Take away" },
});

// export const OrderStatuses = Object.freeze({
//   PROCESSING: { value: "Processing", label: "Processing" },
//   COMPLETED: { value: "Completed", label: "Completed" },
// });

export const PaymentMethods = Object.freeze({
  CASH: { value: "Cash", label: "Cash" },
  CARD: { value: "Card", label: "Card" },
  CASH_AND_CARD: { value: "Cash-And-Card", label: "Cash And Card" },
});

export const OrderStatuses = Object.freeze({
  SET_INITIAL_ORDER_DATA: { value: 1, label: "Set Initial Order Data" },
  PREPARING: { value: 2, label: "Processing" },
  READY: { value: 3, label: "Ready to Serve" },
  SERVED: { value: 4, label: "Served" },
  CLOSED: { value: 5, label: "Closed" },
});

export const BeverageCategories = Object.freeze({
  HARD_LIQUOR: { value: "hard liquor", label: "Hard Liquor"},
  SOFT_DRINKS: { value: "soft drinks", label: "Soft Drinks"},
});
