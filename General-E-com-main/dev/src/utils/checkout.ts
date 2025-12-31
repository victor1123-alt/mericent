import type { Order, DeliveryInfo } from "../types/order";

// Currency configuration
export const CURRENCY_CONFIG = {
  default: 'NGN',
  symbol: '₦',
  name: 'Nigerian Naira',
  locale: 'en-NG'
};

export const formatCurrency = (
  amount: number | string,
  currency: string = CURRENCY_CONFIG.default,
  convertPrice?: (price: number) => number
): string => {
  let num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${CURRENCY_CONFIG.symbol}0.00`;

  // Apply conversion if convertPrice function is provided and currency is not NGN
  if (convertPrice && currency !== 'NGN') {
    num = convertPrice(num);
  }

  const currencies = {
    NGN: { symbol: '₦', locale: 'en-NG' },
    USD: { symbol: '$', locale: 'en-US' },
    EUR: { symbol: '€', locale: 'en-EU' },
    GBP: { symbol: '£', locale: 'en-GB' }
  };

  const curr = currencies[currency as keyof typeof currencies] || currencies.NGN;
  return `${curr.symbol}${num.toLocaleString(curr.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const defaultShippingStates = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
  "Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara",
  "Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT"
];

export async function fetchShippingOptions(): Promise<{ state: string; price: number }[]> {
  try {
    const res = await fetch("/api/shipping-prices");
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    // Transform to the expected format for backward compatibility
    // Group by state and take the first option per state
    const stateMap = new Map();
    data.forEach((option: any) => {
      if (!stateMap.has(option.state)) {
        stateMap.set(option.state, {
          state: option.state,
          price: option.basePrice, // Use base price as fallback
          shippingOption: option
        });
      }
    });
    return Array.from(stateMap.values());
  } catch (err) {
    // Return fallback with default pricing
    return defaultShippingStates.map((s) => ({ state: s, price: 2500 }));
  }
}

export async function calculateShippingFee(state: string, itemCount: number): Promise<{
  originalFee: number;
  discountApplied: boolean;
  discountPercentage: number;
  discountAmount: number;
  finalFee: number;
  shippingOption: any;
} | null> {
  try {
    const res = await fetch("https://mericent.onrender.com/api/calculate-shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, itemCount }),
    });
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    console.log("success");
    
    return data.shipping;
  } catch (err) {
    // Fallback calculation
    return {
      originalFee: 2500,
      discountApplied: false,
      discountPercentage: 0,
      discountAmount: 0,
      finalFee: 2500,
      shippingOption: null
    };
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    // Get orders from server
    const res = await orderAPI.getOrders();
    if (res?.status === 200) {
      const data = res.data;
      if (Array.isArray(data.orders)) return data.orders.reverse();
      if (Array.isArray(data)) return data.reverse();
    }
  } catch (err) {
    console.error('Failed to fetch orders from server:', err);
  }

  // No fallback to localStorage - orders should always be in database
  return [];
}

export function persistOrderLocal(order: Order) {
  // DEPRECATED: Orders are now always saved to database
  // This function is kept for backward compatibility but should not be used
  console.warn('persistOrderLocal is deprecated. Orders should be saved to database only.');
  return [order];
}

import { orderAPI } from './api';

export async function createOrderOnServer(payload: Partial<Order>): Promise<Order | null> {
  try {
    const res = await orderAPI.createOrder(payload);
    console.log("i am trying")
    if (res?.status === 201 || res?.status === 200) {
      return res.data?.order ?? res.data ?? null;
    }
    return null;
  } catch (err) {
    console.error("createOrderOnServer error:", err);
    return null;
  }
}

export async function createPayment(order: Order) {
  try {
    const res = await fetch("/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: order.total || order.subtotal || 0,
        items: order.items,
        shipping: order.shipping,
        delivery: order.delivery,
        orderId: order.id,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}
