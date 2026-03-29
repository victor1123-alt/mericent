import React, { useState } from "react";
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white text-black px-4 h-16 shadow-md">
      <div className="flex items-center justify-between h-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((p) => !p)}
            className="md:hidden p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring"
          >
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          <Link to="/admin" className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-primary">M</span><span className="text-black">ercient</span>
          </Link>

          <div className="hidden md:flex items-center gap-4 ml-6">
            <Link to="/admin" className="text-sm hover:underline">Dashboard</Link>
            <Link to="/admin/products" className="text-sm hover:underline">Products</Link>
            <Link to="/admin/orders" className="text-sm hover:underline">Orders</Link>
            <Link to="/admin/shipping" className="text-sm hover:underline">Shipping</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.email && <div className="text-sm opacity-90 hidden sm:block">{user.email}</div>}
          <button onClick={handleLogout} className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm font-medium">
            Logout
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-primary-dark">
          <div className="p-2 space-y-1">
            <Link to="/admin" className="block text-sm py-2 px-3 rounded hover:bg-white/10" onClick={() => setOpen(false)}>Dashboard</Link>
            <Link to="/admin/products" className="block text-sm py-2 px-3 rounded hover:bg-white/10" onClick={() => setOpen(false)}>Products</Link>
            <Link to="/admin/orders" className="block text-sm py-2 px-3 rounded hover:bg-white/10" onClick={() => setOpen(false)}>Orders</Link>
            <Link to="/admin/shipping" className="block text-sm py-2 px-3 rounded hover:bg-white/10" onClick={() => setOpen(false)}>Shipping</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
