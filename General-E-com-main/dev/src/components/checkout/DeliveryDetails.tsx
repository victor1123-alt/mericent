import React from 'react';
import type { DeliveryInfo } from '../../types/order';

interface Props {
  deliveryInfo: DeliveryInfo;
  onOpenDelivery: () => void;
}

const DeliveryDetails: React.FC<Props> = ({ deliveryInfo, onOpenDelivery }) => {
  return (
    <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-4">Delivery Details</h2>

      <button onClick={onOpenDelivery} className="inline-flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg mb-4 hover:bg-green-600 shadow">
        <span className="text-sm">Add/Edit Delivery Details</span>
      </button>

      {deliveryInfo.fullName || deliveryInfo.email || deliveryInfo.phone ? (
        <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md border-l-4 border-green-500">
          <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">✓ Delivery details saved</p>
          <p className="font-semibold text-gray-900 dark:text-white">{deliveryInfo.fullName || 'Not provided'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{deliveryInfo.email || 'No email'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{deliveryInfo.phoneCode || ''} {deliveryInfo.phone || 'No phone'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{deliveryInfo.countryName || 'No country'}{deliveryInfo.stateName ? `, ${deliveryInfo.stateName}` : ''}{deliveryInfo.cityName ? `, ${deliveryInfo.cityName}` : ''}</p>
        </div>
      ) : (
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">No delivery details saved yet.</p>
      )}

      {/* <h3 className="text-lg font-semibold mb-2">Shipping Method</h3>

      <p className="text-sm text-gray-600 mb-2">Select your shipping location and price on the right panel.</p> */}
      {/* <textarea placeholder="Any note to the merchant..." className="w-full border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-4 resize-none dark:bg-gray-800 dark:text-white" rows={4} /> */}
    </div>
  );
}

export default DeliveryDetails;
