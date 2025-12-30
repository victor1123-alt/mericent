import axios from 'axios';

interface ExchangeRates {
  [key: string]: number;
}

interface ExchangeRateResponse {
  result: string;
  rates: ExchangeRates;
  base: string;
  updated: string;
}

class CurrencyService {
  private static instance: CurrencyService;
  private rates: ExchangeRates = {};
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

  private constructor() {}

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  async getExchangeRates(): Promise<ExchangeRates> {
    const now = Date.now();

    // Return cached rates if still valid
    if (this.rates && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.rates;
    }

    try {
      // Using exchangerate-api.com (free tier)
      const response = await axios.get<ExchangeRateResponse>(
        'https://api.exchangerate-api.com/v4/latest/NGN'
      );

      if (response.data.result === 'success') {
        this.rates = response.data.rates;
        this.lastFetch = now;
        return this.rates;
      } else {
        throw new Error('Failed to fetch exchange rates');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Fallback rates (approximate as of Dec 2025)
      this.rates = {
        NGN: 1,
        USD: 0.000625, // 1 NGN = ~0.000625 USD (1 USD ≈ 1600 NGN)
        EUR: 0.000575, // 1 NGN = ~0.000575 EUR (1 EUR ≈ 1740 NGN)
        GBP: 0.000485  // 1 NGN = ~0.000485 GBP (1 GBP ≈ 2060 NGN)
      };
      this.lastFetch = now;
      return this.rates;
    }
  }

  convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;

    // For now, assuming all prices are stored in NGN
    if (fromCurrency !== 'NGN') {
      console.warn('Conversion from non-NGN currencies not implemented');
      return amount;
    }

    if (!this.rates[toCurrency]) {
      console.warn(`Exchange rate for ${toCurrency} not available`);
      return amount;
    }

    return amount * this.rates[toCurrency];
  }

  getLastUpdate(): Date {
    return new Date(this.lastFetch);
  }
}

export const currencyService = CurrencyService.getInstance();