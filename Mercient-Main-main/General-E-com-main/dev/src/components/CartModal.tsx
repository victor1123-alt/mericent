import React from "react";
import { useCart } from "../context/CardContext";
import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useCurrency } from "../context/CurrencyContext";

interface CartModalProps {
  onClose: () => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ onClose, onCheckout }) => {
  const { cartItems, increaseQty, decreaseQty, totalPrice } = useCart();
  const formatCurrency = useFormatCurrency();
      const { currency } = useCurrency();
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-[100]">
      <div className="bg-white dark:bg-gray-900 w-[90%] max-w-md rounded-xl shadow-2xl p-5 relative animate-slideDown">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-primary text-lg"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Your Cart
        </h2>

        {cartItems.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Your cart is empty.</p>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-2"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-14 h-14 rounded-md object-cover"
                />
                <div className="flex-1 px-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-sm text-primary font-semibold">
                    {formatCurrency(item.priceNumber || 0)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => decreaseQty(item.name)}
                      className="px-2 bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => increaseQty(item.name)}
                      className="px-2 bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total + Checkout */}
        {cartItems.length > 0 && (
          <div className="mt-5 border-t pt-3">
            <p className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
              Total: {currency == "USD" ? "$" + Math.round(totalPrice * 1000)/1000 : currency == "EUR" ? "€" +  Math.round(totalPrice * 1000)/1000 : currency == "GBP" ? "£" +  Math.round(totalPrice * 1000)/1000 : currency == "NGN" ? "₦" +  Math.round(totalPrice * 1000)/1000 : totalPrice}
            </p>
            <button
              onClick={onCheckout}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-green-600 transition"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
