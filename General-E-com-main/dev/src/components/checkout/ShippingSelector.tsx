import React from 'react';
import { useFormatCurrency } from '../../utils/useFormatCurrency';

interface Opt { state: string; price: number }

interface Props {
  shippingOptions: Opt[];
  selectedShippingState: string;
  setSelectedShippingState: (s: string) => void;
  loading?: boolean;
}

const ShippingSelector: React.FC<Props> = ({ shippingOptions, selectedShippingState, setSelectedShippingState, loading = false }) => {
  const formatCurrency = useFormatCurrency();
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium">Shipping Location</label>
      {loading ? (
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading shipping options...</span>
        </div>
      ) : (
        <select aria-label="Shipping location" className="w-full border rounded-lg p-2 mb-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" value={selectedShippingState} onChange={(e) => { const s = e.target.value; setSelectedShippingState(s); }}>
          <option value="">Select shipping location</option>
          {shippingOptions.map(opt => (
            <option key={opt.state} value={opt.state}>{opt.state}</option>
          ))}
        </select>
      )}
    </div>
  );
}

export default ShippingSelector;
