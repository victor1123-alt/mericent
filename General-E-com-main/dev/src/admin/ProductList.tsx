import React from "react";

interface ProductListProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Products ({products.length})</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Latest first</span>
      </div>
      <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No products found. Create your first product above.</p>
          </div>
        ) : (
          products.map((product, index) => (
            <div key={product._id || product.id || index} className="flex justify-between items-center border-b border-gray-300 dark:border-gray-600 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.productName}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.productName || product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">₦{product.price} • {product.category} • {product.productType}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Stock: {product.quantity} • {product.isAvailable ? 'Available' : 'Unavailable'}
                      {product.createdAt && (
                        <span className="ml-2">
                          • Created: {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onEdit(product)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
