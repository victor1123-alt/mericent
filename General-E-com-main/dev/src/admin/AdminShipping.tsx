import React, { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from './AdminSidebar';
import ShippingPrices from "./ShippingPrices";

const AdminShipping: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shipping Management</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">Configure shipping prices and zones</span>
              </div>
              <ShippingPrices />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminShipping;