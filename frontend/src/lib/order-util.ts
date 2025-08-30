import type { OrderTokenType } from "@/component/beach-&-pool-restaurant/order-model"

export const getTokenSubTotal = (token: OrderTokenType) => {
  // Destructure foodItems and beverageItems from the token
  const { foodItems, beverageItems } = token;

  // Calculate the total for foodItems
  const foodItemsTotal = foodItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Calculate the total for beverageItems
  const beverageItemsTotal = beverageItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Return the combined total
  return foodItemsTotal + beverageItemsTotal;
};


export const getAllTokenSubTotal = (tokens: OrderTokenType[]) => {
  return tokens.reduce((total, token: OrderTokenType) => {
    const tokenTotal = getTokenSubTotal(token); // Assuming getTokenTotal calculates the total for a token
    return total + tokenTotal;
  }, 0);
};



