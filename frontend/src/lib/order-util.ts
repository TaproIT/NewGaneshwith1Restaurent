import type { OrderTokenType } from "@/component/beach-&-pool-restaurant/order-model"

export const getTokenSubTotal = (token: OrderTokenType) => {
  // Destructure foodItems and beverageItems from the token
  const { foodOrders, beverageOrders } = token;

  // Calculate the total for foodItems
  const foodItemsTotal = foodOrders.reduce((total, item) => total + item.price * item.quantity, 0);

  // Calculate the total for beverageItems
  const beverageItemsTotal = beverageOrders.reduce((total, item) => total + item.price * item.quantity, 0);

  // Return the combined total
  return foodItemsTotal + beverageItemsTotal;
};


export const getAllTokenSubTotal = (tokens: OrderTokenType[]) => {
  return tokens.reduce((total, token: OrderTokenType) => {
    const tokenTotal = getTokenSubTotal(token); // Assuming getTokenTotal calculates the total for a token
    return total + tokenTotal;
  }, 0);
};

export const  formatDate = (date: Date) => {
  if (!date) return ""
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export const formatToYMD = (input: Date | string | null | undefined) => {
  const date = input instanceof Date ? input : new Date(input ?? new Date());

  const year = date.getFullYear();
  const day = String(date.getDate()).padStart(2, "0");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const monthName = months[date.getMonth()];

  return `${year} ${monthName} ${day}`;
};





