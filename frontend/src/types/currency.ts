// src/types/currency.ts

// The fixed currency where your base prices are stored
export type BaseCurrency = 'LKR'; 

// All currencies your app supports for display
export type SupportedCurrency = 'LKR' | 'USD'; 

// Structure for the rates object (e.g., { "LKR_USD": 0.0033 })
export interface ExchangeRates {
  [key: string]: number;
}

// Interface for the Rate Context state
export interface RateContextType {
  rates: ExchangeRates;
  loading: boolean;
}

// Interface for the Currency Context state and setter
export interface CurrencyContextType {
  displayCurrency: SupportedCurrency;
  setDisplayCurrency: React.Dispatch<React.SetStateAction<SupportedCurrency>>;
}

// Interface for PriceDisplay component props
export interface PriceDisplayProps {
  priceLKR: number; // Price must be the base currency number
}