import React from "react";
import AdminNavbar from "./AdminNavbar";
import ShippingPrices from "./ShippingPrices";

const AdminShipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminNavbar />
      <div className="mt-16 p-4 max-w-7xl mx-auto">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6 lg:flex-row flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shipping Management</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">Configure shipping prices and zones</span>
              </div>
              <ShippingPrices />
            </div>
          </div>
        </div>
      
  );
};

export default AdminShipping;