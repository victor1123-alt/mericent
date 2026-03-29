import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useCurrency } from "../context/CurrencyContext";
import { productAPI } from "../utils/api";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
  });

  const { currency, convertPrice } = useCurrency();
  const formatCurrency = useFormatCurrency();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const productsResponse = await productAPI.getProducts({ limit: 1000 });
      const productsCount = productsResponse?.data?.data?.length || 0;

      const ordersResponse = await fetch("http://localhost:4444/api/orders/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      let ordersCount = 0;
      let pendingOrdersCount = 0;
      let totalRevenue = 0;

      const data = await ordersResponse.json();
      if (ordersResponse.ok) {
        const ordersData = data.orders || data;
        const orders = Array.isArray(ordersData) ? ordersData : [];

        ordersCount = orders.length;
        pendingOrdersCount = orders.filter((order) => order.status === "pending").length;
        totalRevenue = orders
          .filter((order) => !["cancelled", "refunded"].includes(order.status || ""))
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      }

      setStats({
        products: productsCount,
        orders: ordersCount,
        revenue: totalRevenue,
        pendingOrders: pendingOrdersCount,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
  };

  const fmt = (n?: number) => formatCurrency(n || 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminNavbar />
      <div className="mt-16 p-4 max-w-7xl mx-auto">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm space-y-6">
              <div className="flex items-center justify-between lg:flex-row flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">Welcome back, Admin</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Products</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.products}</p>
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
                  </div>
                  <Link to="/admin/orders" className="text-purple-600 dark:text-purple-400 text-sm hover:underline mt-2 inline-block">
                    View Details →
                  </Link>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/admin/products" className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400">+</span>
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
                        <span className="text-green-600 dark:text-green-400">O</span>
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
                        <span className="text-purple-600 dark:text-purple-400">S</span>
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
    
  );
};

export default AdminDashboard;
