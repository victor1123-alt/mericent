import React from "react";
import { useCart } from "../context/CardContext";
import { useNavigate } from "react-router-dom";
import { useFormatCurrency } from "../utils/useFormatCurrency";

const CartPage: React.FC = () => {
  const { cartItems, increaseQty, decreaseQty, totalAmount } = useCart();
  const navigate = useNavigate();
  const formatCurrency = useFormatCurrency();

  if (cartItems.length === 0)
    return (
      
      <div className="bg-milk dark:bg-darkblack min-h-screen text-slate-900 dark:text-white transition-colors duration-300">
        Your cart is empty.
      </div>
    );

  return (
    <div className="bg-milk dark:bg-darkblack min-h-screen text-slate-900 dark:text-white transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Your Cart
      </h1>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.name}
            className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
          >
            <div className="flex items-center gap-4">
              <img src={item.img} alt={item.name} className="w-24 h-24 object-cover rounded" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-primary font-bold">{Math.floor(formatCurrency(item.priceNumber || 0))}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <button
                onClick={() => decreaseQty(item.name)}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                –
              </button>
              <span className="font-medium">{item.quantity}</span>
              <button
                onClick={() => increaseQty(item.name)}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="mt-6 flex justify-between items-center gap-4">
        <div />
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">Total: {Math.floor(totalAmount)}</div>
          <button
            onClick={() => navigate("/checkout")} 
            className="bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90"
          >
            Checkout
          </button>
        </div>
      </div> */}
    </div>
    </div>
  );
};

export default CartPage;
