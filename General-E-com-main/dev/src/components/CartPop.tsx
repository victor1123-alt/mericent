import React from "react";
import { useCart } from "../context/CardContext";
import { motion, AnimatePresence } from "framer-motion";
import { useFormatCurrency } from "../utils/useFormatCurrency";

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cartItems, increaseQty, decreaseQty, totalPrice } = useCart();
  const formatCurrency = useFormatCurrency();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Slide-in Cart Panel */}
          <motion.div
            className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white shadow-2xl z-50 p-5 overflow-y-auto flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Your Cart</h2>

            {cartItems.length === 0 ? (
              <p className="text-gray-600 text-center mt-20">Your cart is empty.</p>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 ml-3">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-gray-500">{formatCurrency(item.priceNumber || 0)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            className="px-2 py-1 bg-gray-200 rounded"
                            onClick={() => decreaseQty(item.name)}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            className="px-2 py-1 bg-gray-200 rounded"
                            onClick={() => increaseQty(item.name)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <button
                    onClick={onCheckout}
                    className="w-full bg-green-600 text-white py-2 mt-4 rounded hover:bg-green-700 transition-all"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartPopup;
