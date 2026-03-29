import React from 'react';
import type { Order } from '../../types/order';
import { useFormatCurrency } from '../../utils/useFormatCurrency';

interface Props { 
  orders: Order[];
  loading?: boolean;
}

const RecentOrders: React.FC<Props> = ({ orders, loading = false }) => {
  const formatCurrency = useFormatCurrency();

  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-transparent dark:border-gray-700">
      <h3 className="font-bold text-lg mb-4">Recent Orders</h3>
      {loading ? (
        <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading recent orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">No recent orders.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o, i) => (
            <li key={o.id ?? i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
              
              <div className="flex items-center justify-between">
                
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Order: {o.orderNumber ?? '—'}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Items: {o.items?.length ?? 0}</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(o.totalAmount || o.subtotal || 0)}</div>
                </div>
              </div>
              {o.shipping && <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">Shipping: {o.shipping.state} — {formatCurrency(o.shipping.fee || 0)}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentOrders;
