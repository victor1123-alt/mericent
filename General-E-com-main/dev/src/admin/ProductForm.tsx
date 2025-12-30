import React, { useState, useRef, useEffect } from "react";
import { useAlert } from "../context/AlertContext";

interface ProductFormProps {
  onSubmit: (product: any) => void;
  initialData?: any;
}

const categories = ["Menswear", "Femalewear", "Unisex", "Caps", "Shoes", "Heels", "Bags"];
const clothingSizes = ["S", "M", "L", "XL", "XXL"];
const footwearSizes = ["6", "7", "8", "9", "10", "11", "12"];
const availableColors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Purple", "Pink", "Gray", "Brown"];

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    productName: initialData?.productName || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    quantity: initialData?.quantity || "",
    category: initialData?.category || categories[0],
    productType: initialData?.productType || "clothing", // "clothing" or "footwear"
    isAvailable: initialData?.isAvailable !== undefined ? initialData.isAvailable : true,
    sizes: initialData?.sizes || [],
    colors: initialData?.colors || [],
    img: initialData?.img || "",
    images: initialData?.images || []
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { showAlert } = useAlert();

  // Auto-close success modal after 3 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        productName: initialData.productName || "",
        sku: initialData.sku || "",
        description: initialData.description || "",
        price: initialData.price || "",
        quantity: initialData.quantity || "",
        category: initialData.category || categories[0],
        productType: initialData.productType || "clothing",
        isAvailable: initialData.isAvailable !== undefined ? initialData.isAvailable : true,
        sizes: initialData.sizes || [],
        colors: initialData.colors || [],
        img: initialData.img || "",
        images: initialData.images || []
      });
    } else {
      // Reset to default when not editing
      setFormData({
        productName: "",
        sku: "",
        description: "",
        price: "",
        quantity: "",
        category: categories[0],
        productType: "clothing",
        isAvailable: true,
        sizes: [],
        colors: [],
        img: "",
        images: []
      });
    }
  }, [initialData]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloudinary configuration - Direct API upload (no SDK needed for browser)
  const CLOUDINARY_CLOUD_NAME = 'dr23mifej';
  const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'productType') {
      // Clear sizes when switching product type
      setFormData(prev => ({
        ...prev,
        [name]: value,
        sizes: []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (field: 'sizes' | 'colors', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item: string) => item !== value)
    }));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    console.log('Uploading to Cloudinary:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      preset: CLOUDINARY_UPLOAD_PRESET,
      fileName: file.name,
      fileSize: file.size
    });

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        // Provide helpful error messages
        if (response.status === 400) {
          throw new Error('Upload failed: Invalid request. Please check that the upload preset exists and is configured correctly in your Cloudinary dashboard.');
        } else if (response.status === 401) {
          throw new Error('Upload failed: Authentication error. Please check your Cloudinary credentials.');
        } else if (response.status === 403) {
          throw new Error('Upload failed: Forbidden. The upload preset may not be configured for unsigned uploads.');
        } else {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Upload successful:', data.secure_url);
      return data.secure_url;

    } catch (error) {
      console.error('Upload error:', error);

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to Cloudinary. Please check your internet connection and that the cloud name is correct.');
      }

      throw error;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const url = await uploadToCloudinary(file);
        setUploadProgress(((index + 1) / files.length) * 100);
        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
        // Set first image as main image if not set
        img: prev.img || uploadedUrls[0]
      }));

    } catch (error) {
      console.error('Upload error:', error);
      showAlert('Failed to upload images. Please try again.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      // If removing main image, set next image as main or clear it
      img: prev.img === prev.images[index] ? (prev.images.filter((_, i) => i !== index)[0] || "") : prev.img
    }));
  };

  const setAsMainImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      img: url
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.productName.trim()) {
      showAlert('Product name is required', 'warning');
      return;
    }

    if (!formData.price || isNaN(Number(formData.price))) {
      showAlert('Valid price is required', 'warning');
      return;
    }

    if (!formData.quantity || isNaN(Number(formData.quantity))) {
      showAlert('Valid quantity is required', 'warning');
      return;
    }

    // Prepare data for submission (match backend model)
    const productData = {
      productName: formData.productName.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      category: formData.category,
      productType: formData.productType,
      isAvailable: formData.isAvailable,
      sizes: formData.sizes,
      colors: formData.colors,
      img: formData.img,
      images: formData.images
    };

    onSubmit(productData);

    // Show success modal with appropriate message
    const isEditing = !!initialData;
    setSuccessMessage(isEditing ? "Product has been updated successfully!" : "Product has been created successfully!");
    setShowSuccessModal(true);

    // Reset form
    setFormData({
      productName: "",
      sku: "",
      description: "",
      price: "",
      quantity: "",
      category: categories[0],
      productType: "clothing",
      isAvailable: true,
      sizes: [],
      colors: [],
      img: "",
      images: []
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col gap-4 max-w-2xl">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {initialData ? 'Edit Product' : 'Add New Product'}
      </h3>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Product Name *
        </label>
        <input
          type="text"
          name="productName"
          placeholder="Product Name"
          value={formData.productName}
          onChange={handleInputChange}
          className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />
      </div>

      {/* SKU */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          SKU (Stock Keeping Unit)
        </label>
        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={formData.sku}
          onChange={handleInputChange}
          className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          name="description"
          placeholder="Product description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      {/* Price and Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price (₦) *
          </label>
          <input
            type="number"
            name="price"
            placeholder="0"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantity *
          </label>
          <input
            type="number"
            name="quantity"
            placeholder="0"
            value={formData.quantity}
            onChange={handleInputChange}
            min="0"
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            required
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Product Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Product Type
        </label>
        <select
          name="productType"
          value={formData.productType}
          onChange={handleInputChange}
          className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="clothing">Clothing</option>
          <option value="footwear">Footwear</option>
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleInputChange}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available for purchase</span>
        </label>
      </div>

      {/* Sizes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sizes {formData.productType === 'clothing' ? '(Select from options)' : '(Add custom sizes)'}
        </label>

        {formData.productType === 'clothing' ? (
          // Clothing sizes - checkboxes
          <div className="flex flex-wrap gap-2">
            {clothingSizes.map((size) => (
              <label key={size} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData.sizes.includes(size)}
                  onChange={(e) => handleArrayChange('sizes', size, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{size}</span>
              </label>
            ))}
          </div>
        ) : (
          // Footwear sizes - custom input
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add shoe size (e.g., 8, 8.5, 9)"
                className="flex-1 border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const size = input.value.trim();
                    if (size && !formData.sizes.includes(size)) {
                      setFormData(prev => ({
                        ...prev,
                        sizes: [...prev.sizes, size]
                      }));
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="Add shoe size"]') as HTMLInputElement;
                  const size = input?.value.trim();
                  if (size && !formData.sizes.includes(size)) {
                    setFormData(prev => ({
                      ...prev,
                      sizes: [...prev.sizes, size]
                    }));
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>

            {/* Display added sizes */}
            {formData.sizes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.sizes.map((size, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-sm"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          sizes: prev.sizes.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-500 hover:text-red-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick add common sizes */}
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quick add:</p>
              <div className="flex flex-wrap gap-1">
                {footwearSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      if (!formData.sizes.includes(size)) {
                        setFormData(prev => ({
                          ...prev,
                          sizes: [...prev.sizes, size]
                        }));
                      }
                    }}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Colors
        </label>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => (
            <label key={color} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={formData.colors.includes(color)}
                onChange={(e) => handleArrayChange('colors', color, e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Product Images
        </label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        {uploading && (
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Uploading... {Math.round(uploadProgress)}%</p>
          </div>
        )}

        {/* Display uploaded images */}
        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {formData.images.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Product ${index + 1}`}
                  className={`w-full h-20 object-cover rounded border-2 ${
                    formData.img === url ? 'border-blue-500' : 'border-gray-300'
                  }`}
                />
                <div className="absolute top-1 right-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setAsMainImage(url)}
                    className={`text-xs px-1 py-0.5 rounded ${
                      formData.img === url
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                    title="Set as main image"
                  >
                    Main
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-xs bg-red-500 text-white px-1 py-0.5 rounded hover:bg-red-600"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="bg-primary text-white py-2 px-4 rounded hover:opacity-90 disabled:opacity-50"
        disabled={uploading}
      >
        {initialData ? 'Update Product' : 'Save Product'}
      </button>
    </form>

    {/* Success Modal */}
    {showSuccessModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Success!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ProductForm;
