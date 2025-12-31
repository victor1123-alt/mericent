export interface OrderItem {
  name?: string;
  price?: string | number;
  quantity?: number;
  size?: string;
  color?: string;
  img?: string;
}

export interface DeliveryInfo {
  fullName: string;
  email?: string;
  phoneCode?: string;
  phone?: string;
  countryIso?: string;
  countryName?: string;
  stateIso?: string;
  stateName?: string;
  cityName?: string;
}

export interface ShippingInfo {
  state: string;
  fee: number;
  originalFee?: number;
  discountApplied?: boolean;
  discountPercentage?: number;
  discountAmount?: number;
}

export interface Order {
  id?: string | number;
  orderNumber?: string;
  items: OrderItem[];
  subtotal?: number;
  shipping?: ShippingInfo;
  delivery?: DeliveryInfo;
  total?: number;
  createdAt: string;
}
