import React from 'react';
import { useFormatCurrency } from '../../utils/useFormatCurrency';

interface Opt { state: string; price: number }

interface Props {
  shippingOptions: Opt[];
  selectedShippingState: string;
  setSelectedShippingState: (s: string) => void;
  setShippingFee: (n: number) => void;
}

const ShippingSelector: React.FC<Props> = ({ shippingOptions, selectedShippingState, setSelectedShippingState, setShippingFee }) => {
  const formatCurrency = useFormatCurrency();
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium">Shipping Location & Price</label>
      <select aria-label="Shipping location" className="w-full border rounded-lg p-2 mb-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" value={selectedShippingState} onChange={(e) => { const s = e.target.value; setSelectedShippingState(s); const opt = shippingOptions.find(o => o.state === s); setShippingFee(opt?.price ?? 0); }}>
        <option value="">Select shipping location</option>
        {shippingOptions.map(opt => (
          <option key={opt.state} value={opt.state}>{opt.state} — {formatCurrency(opt.price)}</option>
        ))}
      </select>
    </div>
  );
}

export default ShippingSelector;
