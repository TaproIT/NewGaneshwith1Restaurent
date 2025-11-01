// src/context/RateContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ExchangeRates, RateContextType } from '../types/currency';
import { api } from '@/api/axios'; // your axios instance

const defaultRates: ExchangeRates = { 'LKR_LKR': 1.0 };

const RateContext = createContext<RateContextType>({
  rates: defaultRates,
  loading: true,
});

export const RateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRates] = useState<ExchangeRates>(defaultRates);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await api.get('/currency-values'); // GET backend
        if (response.data.data.length > 0) {
          const rateObj = response.data.data[0]; // assuming array with single object
          const exchangeRates: ExchangeRates = {
            'LKR_LKR': 1,
            'USD_LKR': rateObj.lkr / rateObj.usd, // convert USD → LKR
            'LKR_USD': rateObj.usd / rateObj.lkr, // convert LKR → USD
          };
          setRates(exchangeRates);
        }
      } catch (error) {
        console.error('Failed to fetch rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  return (
    <RateContext.Provider value={{ rates, loading }}>
      {children}
    </RateContext.Provider>
  );
};

// Hook
export const useRates = () => useContext(RateContext);
