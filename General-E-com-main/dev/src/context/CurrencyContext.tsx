import React, { createContext, useContext, useState, useEffect } from 'react';
import { currencyService } from '../utils/currencyService';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  currencies: Record<string, { symbol: string; name: string }>;
  convertPrice: (price: number) => number;
  isLoadingRates: boolean;
  ratesLastUpdate: Date | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState('NGN');
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [ratesLastUpdate, setRatesLastUpdate] = useState<Date | null>(null);

  const currencies = {
    NGN: { symbol: '₦', name: 'Nigerian Naira' },
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' }
  };

  useEffect(() => {
    const saved = localStorage.getItem('selectedCurrency');
    if (saved && currencies[saved as keyof typeof currencies]) {
      setCurrencyState(saved);
    }
  }, []);

  useEffect(() => {
    // Fetch exchange rates on mount and when currency changes
    const fetchRates = async () => {
      setIsLoadingRates(true);
      try {
        await currencyService.getExchangeRates();
        setRatesLastUpdate(currencyService.getLastUpdate());
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchRates();
  }, [currency]);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
  };

  const convertPrice = (price: number): number => {
    if (currency === 'NGN') return price;
    return currencyService.convertAmount(price, 'NGN', currency);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      currencies,
      convertPrice,
      isLoadingRates,
      ratesLastUpdate
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};