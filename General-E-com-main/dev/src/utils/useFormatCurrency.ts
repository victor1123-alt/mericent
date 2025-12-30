import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from './checkout';

export const useFormatCurrency = () => {
  const { currency, convertPrice } = useCurrency();

  console.log("currency",currency);
  
  const format = (amount: number | string) => {
    return formatCurrency(amount, currency, convertPrice);
  };

  return format;
};