import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from './AdminSidebar';
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import { productAPI } from "../utils/api";
import { useAlert } from "../context/AlertContext";

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const { showAlert } = useAlert();

  // Load data on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Sort by latest first (createdAt desc) and limit to 20 products
      const response = await productAPI.getProducts({
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 20
      });
      if (response?.status === 200) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleAddProduct = async (product: any) => {
    try {
      if (editingProduct !== null) {
        // Update existing product
        await productAPI.updateProduct(editingProduct._id || editingProduct.id, product);
        // Refresh products list
        await loadProducts();
        setEditingProduct(null);
      } else {
        // Create new product
        await productAPI.createProduct(product);
        // Refresh products list
        await loadProducts();
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      showAlert('Failed to save product. Please try again.', 'error');
    }
  };

  const handleEditProduct = (product: any) => {
    const index = products.findIndex((p) => p === product);
    setEditingProduct({ ...product, index });
  };

  const handleDeleteProduct = async (product: any) => {
    if (!product._id && !product.id) {
      console.error('Product ID not found');
      return;
    }

    try {
      await productAPI.deleteProduct(product._id || product.id);
      await loadProducts(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete product:', error);
      showAlert('Failed to delete product. Please try again.', 'error');
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">{products.length} products</span>
              </div>
              <ProductForm onSubmit={handleAddProduct} initialData={editingProduct} />
              <ProductList products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;