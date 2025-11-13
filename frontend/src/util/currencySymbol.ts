export const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "LKR":
      return "Rs"; // or "රු" if you prefer
    default:
      return "";
  }
};
