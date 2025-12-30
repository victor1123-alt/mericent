import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import { API_BASE_URL } from '../../utils/api';

interface OrderItem {
  name?: string;
  price?: string | number;
  quantity?: number;
  size?: string;
  color?: string;
  img?: string;
}

interface PaystackPaymentProps {
  amount: number; // Amount in Naira
  email: string;
  name: string;
  phone?: string;
  orderId?: string;
  items?: OrderItem[];
  onSuccess: (reference: string) => void;
  onClose: () => void;
  publicKey?: string;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  amount,
  email,
  name,
  phone,
  orderId,
  items = [],
  onSuccess,
  onClose,
  publicKey = 'pk_test_c6227ba70af916ad513d3c41f5a7f494ee536b48'
}) => {
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const { showAlert } = useAlert();

  console.log(orderId)
  useEffect(() => {
    // Load Paystack script dynamically
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        setPaystackLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Paystack script');
      };
      document.head.appendChild(script);
    } else {
      setPaystackLoaded(true);
    }
  }, []);

  const initializePayment = async () => {
    if (!paystackLoaded || !window.PaystackPop) {
      showAlert('Paystack is still loading. Please try again.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // First, initialize payment with backend to get proper reference
      const initResponse = await fetch(`${API_BASE_URL}/api/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          email,
          name,
          phone,
          orderId,
          items, // Pass the actual items from props
          shipping: {},
          delivery: { email, fullName: name, phone }
        })
      });

      console.log({amount,email,name,phone,orderId,items});

      const initData = await initResponse.json();

      if (!initData.success || !initData.reference) {
        showAlert('Failed to initialize payment. Please try again.', 'error');
        return;
      }

      // Now use the reference from backend for Paystack modal
      const paystack = window.PaystackPop.setup({
        key: publicKey,
        email: email,
        amount: amount * 100, // Convert to kobo
        currency: 'NGN',
        ref: initData.reference, // Use the reference from backend
        callback: (response: any) => {
          // Payment successful - use the reference from Paystack response
          onSuccess(response.reference);
        },
        onClose: () => {
          onClose();
        }
      });

      paystack.openIframe();
    } catch (error) {
      console.error('Payment initialization error:', error);
      showAlert('Failed to initialize payment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={initializePayment}
      disabled={loading || !paystackLoaded}
      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
    >
      {loading ? 'Initializing Payment...' : !paystackLoaded ? 'Loading Payment...' : 'Pay with Paystack'}
    </button>
  );
};

export default PaystackPayment;