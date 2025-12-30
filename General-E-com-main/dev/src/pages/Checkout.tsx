// CheckoutPage.tsx
import React, { useEffect, useState } from "react";
import type { Order, DeliveryInfo } from "../types/order";
import { useCart } from "../context/CardContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
// country-state-city is used inside DeliveryModal; no direct import needed here
import DeliveryDetails from "../components/checkout/DeliveryDetails";
import ShippingSelector from "../components/checkout/ShippingSelector";
import OrdersTable from "../components/checkout/OrdersTable";
import RecentOrders from "../components/checkout/RecentOrders";
import OrderPreviewModal from "../components/checkout/OrderPreviewModal";
import DeliveryModal from "../components/checkout/DeliveryModal";

import {
  fetchShippingOptions,
  fetchOrders,
  persistOrderLocal,
  createOrderOnServer,
  createPayment,
} from "../utils/checkout";
import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useCurrency } from "../context/CurrencyContext";
import { useUnmountEffect } from "framer-motion";
import { useAlert } from "../context/AlertContext";
import { API_BASE_URL } from "../utils/api";

/**
 * NOTE:
 * - Install: npm i country-state-city
 * - This component expects an API:
 *    GET  /api/shipping-prices       -> returns [{ state: "Lagos", price: 2500 }, ...]
 *    POST /api/create-payment        -> create payment (you already had this)
 */

const CheckoutPage: React.FC = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const formatCurrency = useFormatCurrency();
  const { convertPrice } = useCurrency();
  const { showAlert } = useAlert();
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderPreview, setOrderPreview] = useState<Order | null>(null);

  // Shipping options from admin/backend
  const [shippingOptions, setShippingOptions] = useState<{ state: string; price: number }[]>([]);
  const [selectedShippingState, setSelectedShippingState] = useState<string>(localStorage.getItem('checkout_shipping_state_v1') || "");
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [processing, setProcessing] = useState(false);

  // Delivery modal
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>(() => {
    try {
      const raw = localStorage.getItem('checkout_delivery_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Validate that required fields exist
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading delivery info from localStorage:', err);
    }
    return {
      fullName: "",
      email: "",
      phoneCode: "",
      phone: "",
      countryIso: "",
      countryName: "",
      stateIso: "",
      stateName: "",
      cityName: "",
    };
  });

  // Final total includes shipping fee
  const finalTotal = totalAmount + shippingFee;
  
  // Calculate NGN versions for backend storage
  const ngnSubtotal = cartItems.reduce((sum, item) => sum + (item.priceNumber || 0) * item.quantity, 0);
  const ngnTotal = ngnSubtotal + (shippingFee || 0);

  // Fetch shipping options from backend (admin-controlled)
  useEffect(() => {
    fetchShippingOptions().then(setShippingOptions).catch(() => {});
  }, []);

  // Load recent orders (backend or localStorage)
  useEffect(() => {
    fetchOrders().then(setOrders).catch(() => {});
  }, []);

  // Payment handler (sends cart + delivery + shipping to backend)
  const handleCheckout = async () => {
    // Enhanced validation with better error messages
    const missingFields = [];
    if (!deliveryInfo.fullName?.trim()) missingFields.push("Full Name");
    if (!deliveryInfo.phone?.trim()) missingFields.push("Phone Number");
    if (!deliveryInfo.countryName?.trim()) missingFields.push("Country");

    if (missingFields.length > 0) {
      showAlert(`Please provide the following delivery information: ${missingFields.join(", ")}`, "error");
      return;
    }

    if (!selectedShippingState) {
      showAlert("Please select a shipping location.", "warning");
      return;
    }

    setProcessing(true);
    try {
      // save delivery info and shipping state to localStorage so users don't lose data
      localStorage.setItem('checkout_delivery_v1', JSON.stringify(deliveryInfo));
      localStorage.setItem('checkout_shipping_state_v1', selectedShippingState);

      const isNigeria = (deliveryInfo.countryName || '').toLowerCase() === 'nigeria';

      const payload: Partial<Order> = {
        items: cartItems.map((c) => ({ productId: c.id, quantity: c.quantity } as any)),
        subtotal: ngnSubtotal,
        shipping: { state: selectedShippingState, fee: shippingFee },
        shippingAddress: {
          city: deliveryInfo.cityName || '',
          state: deliveryInfo.stateName || selectedShippingState || '',
          country: deliveryInfo.countryName || '',
          street: '',
          postalCode: ''
        },
        delivery: deliveryInfo,
        total: ngnTotal,
        paymentMethod: isNigeria ? 'paystack' : 'whatsapp',
        guestInfo: { name: deliveryInfo.fullName, email: deliveryInfo.email, phone: `${deliveryInfo.phoneCode || ''} ${deliveryInfo.phone || ''}` },
        createdAt: new Date().toISOString(),
      };

      console.log("before",payload)
      let createdOrder = await createOrderOnServer(payload);
      if (!createdOrder) {
        console.error('Failed to create order on server, aborting checkout');
        showAlert("Failed to create order. Please check your connection and try again.", "error");
        return;
      }

            console.log("after")


      // Order successfully created on server
      setOrders(prev => [createdOrder, ...prev]); // Add to local state
      setOrderPreview(createdOrder as Order);
      setShowOrderModal(true);
    } catch (error) {
      console.error(error);
      showAlert("Something went wrong. Try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Called after user confirms order in the preview modal — starts payment flow
  const proceedToPayment = async (order: Order | null) => {
    if (!order) return;
    setShowOrderModal(false);
    setProcessing(true);
    try {
      // Since Paystack payment is handled inline, we just need to verify the payment
      // The PaystackPayment component will call this function with the reference on success
      console.log('Payment initiated for order:', order.id);
      // Payment verification will be handled by the PaystackPayment component callback
    } catch (err) {
      console.error(err);
      showAlert("Payment processing failed. Try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Handle successful Paystack payment
  const handlePaymentSuccess = async (reference: string) => {
    try {
      setProcessing(true);

      // Verify payment with backend
      const res = await fetch(`${API_BASE_URL}/api/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      console.log(data);
      
      if (data.success) {
        // Payment successful - show success message, clear cart, and refresh
        showAlert("Payment successful! Your order has been confirmed.", "success");
        await clearCart();
        // Refresh the page
        window.location.reload();
      } else {
        showAlert("Payment verification failed. Please contact support if you were charged.", "error");
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      showAlert("Payment verification failed. Please contact support.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Save delivery data from modal
  const onSaveDelivery = (data: DeliveryInfo) => {
    setDeliveryInfo(data);
    setShowDeliveryModal(false);
  };



    const { currency } = useCurrency();


  return (
    <>
      <Navbar />
      <Hero
        title="Finalize Your Order"
        subtitle="Please review your cart, add delivery details, and complete your purchase securely."
      />

      <section className="py-10 bg-milk dark:bg-darkblack transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Delivery Details */}
          <div className="flex-1">
            <DeliveryDetails deliveryInfo={deliveryInfo} onOpenDelivery={() => setShowDeliveryModal(true)} />

            <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2">Shipping Method</h3>
              <ShippingSelector
                shippingOptions={shippingOptions}
                selectedShippingState={selectedShippingState}
                setSelectedShippingState={setSelectedShippingState}
                setShippingFee={setShippingFee}
              />

              {selectedShippingState ? (
                <p className="font-semibold mb-2">Selected: {selectedShippingState} — {formatCurrency(shippingFee)}</p>
              ) : (
                <p className="text-sm text-gray-600 mb-2">No shipping location selected.</p>
              )}

              <textarea
                placeholder="Specify your location if complicated...."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-4 resize-none dark:bg-gray-700 dark:text-white"
                rows={4}
              />
            </div>
          </div>

          {/* RIGHT: Orders */}
          <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>

            <OrdersTable items={cartItems} />

            <div className="mb-4">
              <p className="text-lg font-semibold">Subtotal: {currency == "USD" ? "$" + Math.round(totalAmount * 1000)/1000 : currency == "EUR" ? "€" + Math.round(totalAmount * 1000)/1000 : currency == "GBP" ? "£" + Math.round(totalAmount * 1000)/1000 : currency == "NGN" ? "₦" + Math.round(totalAmount * 1000)/1000 : totalAmount}</p>
              <p className="text-lg font-semibold">Shipping: {formatCurrency(shippingFee)}</p>
              <p className="text-xl font-bold mt-2">Total: {currency == "USD" ? "$" + Math.round(finalTotal * 1000)/1000 : currency == "EUR" ? "€" + Math.round(finalTotal * 1000)/1000 : currency == "GBP" ? "£" + Math.round(finalTotal * 1000)/1000 : currency == "NGN" ? "₦" + Math.round(finalTotal * 1000)/1000 : finalTotal}</p>
            </div>

            <RecentOrders orders={orders.slice(-5)} />

            <button
              onClick={handleCheckout}
              disabled={processing || cartItems.length === 0}
              className={`w-full py-3 rounded-lg ${processing || cartItems.length === 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-600 text-white hover:opacity-90'}`}
            >
              {processing ? 'Processing…' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
        </div>
      </section>

      <OrderPreviewModal
        order={orderPreview}
        visible={showOrderModal}
        onConfirm={proceedToPayment}
        onCancel={() => setShowOrderModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Shipping selection is handled inline via ShippingSelector component */}

      {
        showDeliveryModal &&       <DeliveryModal value={deliveryInfo} onChange={setDeliveryInfo} onSave={onSaveDelivery} onClose={() => setShowDeliveryModal(false)} />

      }
    </>
  );
};

export default CheckoutPage;
