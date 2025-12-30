import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from './AdminSidebar';
import OrdersList from "./OrderLIst";

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();

    
    if(query === '') return orders; // If no query, show all
    // Search by order ID
    if (order._id?.toString().toLowerCase().includes(query)) return orders;
    // Search by product names
    if (order.items?.some((item: any) => item.productName?.toLowerCase().includes(query))) return orders;
    // Search by price (total)
    if (order.totalAmount?.toString().includes(query)) return orders;

    if (order.transactionId?.toString().includes(query)) return orders;

    if (order.userId?.email?.toString().includes(query)) return orders;


    return false;
  });

  // Load data on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch("https://mericent.onrender.com/api/orders/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both response formats: direct array or { success: true, orders: [] }
        const ordersData = data.orders || data;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } else {
        console.error('Failed to load orders:', response.status, response.statusText);
        console.log(orders);
        
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    }
  };

  console.log("myorders",orders);
  

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminNavbar onToggleSidebar={() => setShowSidebar((s) => !s)} />
      <div className="mt-16 p-4">
        <div className="max-w-7xl mx-auto flex gap-6">
          {/* Sidebar area */}
          <div className="relative">
            {showSidebar && (
              <div className="fixed inset-0 z-50 md:static md:inset-auto md:z-auto">
                {/* Backdrop for small screens */}
                <div className="md:hidden absolute inset-0 bg-black/40" onClick={() => setShowSidebar(false)} />
                <div className="relative">
                  <AdminSidebar />
                </div>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className={`flex-1 ${showSidebar ? '' : ''}`}>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">Track and update order status</span>
              </div>
              
              {/* Search Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search orders by ID, product name, or price..."
                  value={searchQuery}
                  onChange={(e) =>{console.log(filteredOrders);
                   return setSearchQuery(e.target.value)}}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <OrdersList orders={filteredOrders} onOrderUpdate={loadOrders} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;