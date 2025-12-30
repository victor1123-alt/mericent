import React, { useEffect, useState } from "react";

interface ShipOption { state: string; price: number }

const ShippingPrices: React.FC = () => {
  const [options, setOptions] = useState<ShipOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch('/api/admin/shipping-prices', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setOptions(data);
      } catch (err) {
        // fallback to sensible defaults (36 states)
        const defaultStates = [
          "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
          "Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara",
          "Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT"
        ];
        setOptions(defaultStates.map(s => ({ state: s, price: 2500 })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updatePrice = (index: number, price: number) => {
    setOptions(prev => prev.map((o, i) => i === index ? { ...o, price } : o));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/shipping-prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(options),
      });
      if (!res.ok) throw new Error('save failed');
      showAlert('Shipping prices updated', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Failed to save shipping prices', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">Loading shipping prices…</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mt-4">
      <h3 className="text-xl font-semibold mb-3">Shipping Prices (admin)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {options.map((o, i) => (
          <div key={o.state} className="flex items-center gap-3">
            <div className="w-1/2">{o.state}</div>
            <input type="number" className="border rounded p-2 w-1/2" value={o.price} onChange={(e) => updatePrice(i, Number(e.target.value))} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={handleSave} disabled={saving} className="bg-primary text-white px-4 py-2 rounded">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  );
};

export default ShippingPrices;
