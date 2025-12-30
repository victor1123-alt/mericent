import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from './AdminSidebar';
import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useCurrency } from "../context/CurrencyContext";
import { productAPI } from "../utils/api";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0
  });
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  const { currency, convertPrice } = useCurrency();
  const formatCurrency = useFormatCurrency();

  // Load dashboard stats on component mount
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load products count
      const productsResponse = await productAPI.getProducts({ limit: 1000 });
      const productsCount = productsResponse?.data?.data?.length || 0;

      // Load orders stats
      const ordersResponse = await fetch("http://localhost:4444/api/orders/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        }
      });

      let ordersCount = 0;
      let pendingOrdersCount = 0;
      let totalRevenue = 0;

      const data = await ordersResponse.json();

      console.log(data);
      

      if (ordersResponse.ok) {
        const ordersData = data.orders || data;
        const orders = Array.isArray(ordersData) ? ordersData : [];

        ordersCount = orders.length;
        pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
        totalRevenue = orders
          .filter(order => !['cancelled', 'refunded'].includes(order.status || ''))
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      }

      setStats({
        products: productsCount,
        orders: ordersCount,
        revenue: totalRevenue,
        pendingOrders: pendingOrdersCount
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  const fmt = (n?: number) => formatCurrency(n || 0);

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
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">Welcome back, Admin</span>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Products</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.products}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <Link to="/admin/products" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2 inline-block">
                    Manage Products →
                  </Link>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Orders</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.orders}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <Link to="/admin/orders" className="text-green-600 dark:text-green-400 text-sm hover:underline mt-2 inline-block">
                    Manage Orders →
                  </Link>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pending Orders</p>
                      <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pendingOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <Link to="/admin/orders" className="text-yellow-600 dark:text-yellow-400 text-sm hover:underline mt-2 inline-block">
                    View Pending →
                  </Link>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{fmt(stats.revenue)}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <Link to="/admin/orders" className="text-purple-600 dark:text-purple-400 text-sm hover:underline mt-2 inline-block">
                    View Details →
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/admin/products" className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Add Product</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create new products</p>
                      </div>
                    </div>
                  </Link>

                  <Link to="/admin/orders" className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Manage Orders</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Update order status</p>
                      </div>
                    </div>
                  </Link>

                  <Link to="/admin/shipping" className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Shipping Settings</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Configure shipping</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
