import type { ExchangeRates, SupportedCurrency, BaseCurrency } from '../types/currency';

const BASE_CURRENCY: BaseCurrency = 'LKR'; 

export const convertAndFormatPrice = (
  amountLKR: number, 
  rates: ExchangeRates, 
  targetCurrency: SupportedCurrency
): string => {
  if (Object.keys(rates).length === 0) {
    return '...';
  }

  // 1. Determine the conversion rate
  let rate = 1;
  if (targetCurrency !== BASE_CURRENCY) {
    const rateKey = `${BASE_CURRENCY}_${targetCurrency}`;
    rate = rates[rateKey] || 1; 
  }
  
  // 2. Calculate the converted amount
  const convertedAmount = amountLKR * rate;

  // 3. Format the result using the Intl API
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
};