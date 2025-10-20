// src/context/RateContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ExchangeRates, RateContextType} from '../types/currency';

const defaultRates: ExchangeRates = { 'LKR_LKR': 1.00 };

// Initializing Context with the defined type
const RateContext = createContext<RateContextType>({
  rates: defaultRates,
  loading: true,
});

// --- SIMULATED BACKEND FETCH (MOCK) ---
const mockFetchRates = (): Promise<ExchangeRates> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        "LKR_USD": 0.0033, 
        "LKR_EUR": 0.0031,
        "LKR_LKR": 1.00,
        "USD_LKR": 303.03, // (303.03 LKR = 1 USD)
      });
    }, 500);
  });
};
// ------------------------------------

export const RateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRates] = useState<ExchangeRates>(defaultRates);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    mockFetchRates().then(data => {
      setRates(data);
      setLoading(false);
    });
  }, []);

  return (
    <RateContext.Provider value={{ rates, loading }}>
      {children}
    </RateContext.Provider>
  );
};

// Custom hook to consume the context
export const useRates = () => useContext(RateContext);