import React from 'react';
import type { OrderItem } from '../../types/order';
import { useFormatCurrency } from '../../utils/useFormatCurrency';

interface Props {
  items: OrderItem[];
}

const OrdersTable: React.FC<Props> = ({ items }) => {
  const formatCurrency = useFormatCurrency();

  console.log(items)
  return (
    <div className="overflow-x-auto mb-4">
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No items in cart.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide">
                <th className="pb-3">Item</th>
                <th className="pb-3">Details</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Unit</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const unitPrice = parseFloat(String(item.price).replace(/[^0-9.-]+/g, '')) || 0;
                const qty = Number(item.quantity || 1);
                const lineTotal = unitPrice * qty;
                return (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="py-3 flex items-center gap-3 w-1/3">
                      {item.img && <img src={item.img} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-300">
                      {item.size && <div>Size: <span className="font-medium">{item.size}</span></div>}
                      {item.color && <div>Color: <span className="font-medium">{item.color}</span></div>}
                    </td>
                    <td className="py-3 text-center text-gray-700 dark:text-gray-200">{qty}</td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-200">{formatCurrency(unitPrice)}</td>
                    <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
