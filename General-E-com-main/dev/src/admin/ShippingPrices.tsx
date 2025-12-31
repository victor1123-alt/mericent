import React, { useEffect, useState } from "react";
import { useAlert } from "../context/AlertContext";

interface ShippingOption {
  _id: string;
  name: string;
  state: string;
  basePrice: number;
  pricePerItem: number;
  maxItemsForBase: number;
  discountPercentage: number;
  discountActive: boolean;
  isActive: boolean;
}

const ShippingPrices: React.FC = () => {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: '',
    state: '',
    basePrice: 0,
    pricePerItem: 0,
    maxItemsForBase: 1,
    discountPercentage: 0,
    discountActive: false
  });

  const nigerianStates = [
    "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
    "Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara",
    "Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT"
  ];

  useEffect(() => {
    checkAdminAuth();
    loadShippingOptions();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAdminAuthenticated(false);
        return;
      }

      const res = await fetch('https://mericent.onrender.com/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsAdminAuthenticated(res.ok);
    } catch (err) {
      setIsAdminAuthenticated(false);
    }
  };

  const loadShippingOptions = async () => {
    try {
      const res = await fetch('https://mericent.onrender.com/api/admin/shipping-prices');
      if (!res.ok) throw new Error('Failed to load shipping options');
      const data = await res.json();
      setOptions(data);
    } catch (err) {
      console.error(err);
      showAlert('Failed to load shipping options', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showAlert('You must be logged in as an admin to perform this action', 'error');
        return;
      }

      const url = editingId ? `https://mericent.onrender.com/api/admin/shipping-prices/${editingId}` : 'https://mericent.onrender.com/api/admin/shipping-prices';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to save shipping option (${res.status})`);
      }

      showAlert(`Shipping option ${editingId ? 'updated' : 'created'} successfully`, 'success');
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadShippingOptions();
    } catch (err) {
      console.error(err);
      showAlert(err instanceof Error ? err.message : 'Failed to save shipping option', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (option: ShippingOption) => {
    setFormData({
      name: option.name,
      state: option.state,
      basePrice: option.basePrice,
      pricePerItem: option.pricePerItem,
      maxItemsForBase: option.maxItemsForBase,
      discountPercentage: option.discountPercentage,
      discountActive: option.discountActive
    });
    setEditingId(option._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping option?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        showAlert('You must be logged in as an admin to perform this action', 'error');
        return;
      }

      const res = await fetch(`https://mericent.onrender.com/api/admin/shipping-prices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to delete shipping option (${res.status})`);
      }

      showAlert('Shipping option deleted successfully', 'success');
      loadShippingOptions();
    } catch (err) {
      console.error(err);
      showAlert(err instanceof Error ? err.message : 'Failed to delete shipping option', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      state: '',
      basePrice: 0,
      pricePerItem: 0,
      maxItemsForBase: 1,
      discountPercentage: 0,
      discountActive: false
    });
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  if (loading) return <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">Loading shipping options…</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Shipping Options Management</h3>
        <div className="flex items-center gap-4">
          {!isAdminAuthenticated && (
            <span className="text-red-500 text-sm">⚠️ Admin authentication required</span>
          )}
          <button
            onClick={() => setShowForm(true)}
            disabled={!isAdminAuthenticated}
            className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add New Option
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
          <h4 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Add'} Shipping Option</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded p-2 dark:bg-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="w-full border rounded p-2 dark:bg-gray-600"
                required
              >
                <option value="">Select State</option>
                {nigerianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Base Price (₦)</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({...formData, basePrice: Number(e.target.value)})}
                className="w-full border rounded p-2 dark:bg-gray-600"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price Per Additional Item (₦)</label>
              <input
                type="number"
                value={formData.pricePerItem}
                onChange={(e) => setFormData({...formData, pricePerItem: Number(e.target.value)})}
                className="w-full border rounded p-2 dark:bg-gray-600"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Items for Base Price</label>
              <input
                type="number"
                value={formData.maxItemsForBase}
                onChange={(e) => setFormData({...formData, maxItemsForBase: Number(e.target.value)})}
                className="w-full border rounded p-2 dark:bg-gray-600"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Percentage (%)</label>
              <input
                type="number"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({...formData, discountPercentage: Number(e.target.value)})}
                className="w-full border rounded p-2 dark:bg-gray-600"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.discountActive}
                onChange={(e) => setFormData({...formData, discountActive: e.target.checked})}
                className="mr-2"
              />
              Enable Discount
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving || !isAdminAuthenticated}
              className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:opacity-90"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Name</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">State</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Base Price</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Per Item</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Max Items</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Discount</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {options.map((option) => (
              <tr key={option._id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="border border-gray-300 dark:border-gray-600 p-2">{option.name}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">{option.state}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">₦{option.basePrice}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">₦{option.pricePerItem}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">{option.maxItemsForBase}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">
                  {option.discountActive ? `${option.discountPercentage}%` : 'None'}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">
                  <button
                    onClick={() => handleEdit(option)}
                    disabled={!isAdminAuthenticated}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(option._id)}
                    disabled={!isAdminAuthenticated}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {options.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No shipping options configured yet.</p>
      )}
    </div>
  );
};

export default ShippingPrices;
