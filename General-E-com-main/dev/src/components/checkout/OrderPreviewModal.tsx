import React from 'react';
import type { Order } from '../../types/order';
import PaystackPayment from './PaystackPayment';
import { useFormatCurrency } from '../../utils/useFormatCurrency';

// Admin WhatsApp number (E.164 without plus is preferred for wa.me links).
// Replace the placeholder with the admin's real number, e.g. '2348012345678'
const ADMIN_WHATSAPP_NUMBER = '2347072074319';

interface Props {
  order: Order | null;
  visible: boolean;
  onConfirm: (o: Order | null) => void;
  onCancel: () => void;
  onPaymentSuccess?: (reference: string) => void;
}


const OrderPreviewModal: React.FC<Props> = ({ order, visible, onConfirm, onCancel, onPaymentSuccess }) => {
  const formatCurrency = useFormatCurrency();
  if (!visible || !order) return null;

  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 max-w-xl w-full shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Confirm Your Order</h3>
            <div className="text-xs text-gray-500">Order #{order.id ?? '—'} • {new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
        </div>

        <div className="max-h-56 overflow-y-auto mb-4 space-y-3">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {it.img && <img src={it.img} alt={it.name} className="w-12 h-12 object-cover rounded-md" />}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{it.productName}</div>
                  <div className="text-xs text-gray-500">{it.size ?? ''} {it.color ? `• ${it.color}` : ''}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">Qty: {it.quantity ?? 1}</div>
                <div className="font-semibold">{formatCurrency(it.price || 0)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 text-sm">
          <div className="text-gray-600 dark:text-gray-300">Shipping: <span className="font-medium">{order.shipping?.state}</span> — <span className="font-semibold">{formatCurrency(order.shipping?.fee || 0)}</span></div>
          <div className="text-lg font-bold mt-2">Total: {formatCurrency(order.total || order.subtotal || 0)}</div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg shadow">
            Cancel
          </button>
          {
            // Determine destination country (delivery preferred, fallback to shipping state/country)
            ((order.delivery && (order.delivery.countryName || '')) || (order.shipping && (order.shipping.country || '')))
          }
          {(() => {
            const dest = (order.delivery?.countryName || order.shippingAddress?.country || '').toLowerCase();
            const isInternational = dest && dest !== 'nigeria';

            
            if (isInternational) {
              const openWhatsApp = () => {
                const itemsText = (order.items || []).map((it: any) => `${it.name || 'Item'} x${it.quantity || 1} - ${formatCurrency(it.price || 0)}`).join('\n');
                const msg = `New international order:\nOrder: ${order.orderNumber || order.id || ''}\nTotal: ${formatCurrency(order.total || order.subtotal || 0)}\n\nItems:\n${itemsText}\n\nDelivery:\n${order.delivery?.fullName || order.guestInfo?.name || ''}\n${order.delivery?.email || order.guestInfo?.email || ''}\n${order.delivery?.phone || order.guestInfo?.phone || ''}\nCountry: ${order.delivery?.countryName || order.shipping?.country || ''}`;
                const phone = String(ADMIN_WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                window.open(url, '_blank');
                // proceed with confirmation so order is marked/handled server-side
                onConfirm(order);
              };

              return (
                <button onClick={openWhatsApp} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-lg shadow">
                  Contact Admin via WhatsApp
                </button>
              );
            }

            return (
              <PaystackPayment
                amount={order?.totalAmount || order?.subtotal || 0}
                email={order?.guestInfo?.email || ''}
                name={order?.guestInfo?.fullName || 'Customer'}
                phone={order?.guestInfo?.phone || ''}
                orderId={order?.orderNumber}
                items={order?.items || []}
                onSuccess={onPaymentSuccess || (() => onConfirm(order))}
                onClose={onCancel}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default OrderPreviewModal;
