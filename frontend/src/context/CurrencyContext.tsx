// src/context/CurrencyContext.tsx
import React, { createContext, useState, useContext } from 'react';
import type { SupportedCurrency, CurrencyContextType } from '../types/currency';

// Helper for initial state to satisfy TypeScript
const initialContext: CurrencyContextType = {
  displayCurrency: 'LKR',
  setDisplayCurrency: () => {}, // empty function for initial context
};

const CurrencyContext = createContext<CurrencyContextType>(initialContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [displayCurrency, setDisplayCurrency] = useState<SupportedCurrency>('LKR'); 

  return (
    <CurrencyContext.Provider value={{ displayCurrency, setDisplayCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);