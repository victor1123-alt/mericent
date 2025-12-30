import React from "react";
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { logout, user } = useUser();

  const handleLogout = async () => {
    // Call shared logout to clear both user and admin sessions
    try {
      await logout();
    } catch (err) {
      // ignore
    }
    // ensure admin local state removed and redirect to home
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3 h-full">
        <button
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          className="p-2 rounded hover:bg-white/10 focus:outline-none focus:ring"
        >
          <FiMenu size={20} />
        </button>

        <Link to="/admin" className="text-lg font-semibold tracking-tight">
          Mercient Admin
        </Link>

        <div className="hidden md:flex items-center gap-4 ml-6">
          <Link to="/admin" className="text-sm hover:underline">Dashboard</Link>
          <Link to="/admin/products" className="text-sm hover:underline">Products</Link>
          <Link to="/admin/orders" className="text-sm hover:underline">Orders</Link>
          <Link to="/admin/shipping" className="text-sm hover:underline">Shipping</Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && user.email && <div className="text-sm opacity-80 hidden sm:block">{user.email}</div>}
        <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
