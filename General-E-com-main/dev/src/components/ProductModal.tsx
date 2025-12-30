import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { ProductItem } from "../context/CardContext";
import { useCart } from "../context/CardContext";
import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useAlert } from "../context/AlertContext";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem;
  category?: string;
  onAdded?: (msg: string) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  category,
  onAdded,
}) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const formatCurrency = useFormatCurrency();
  const { showAlert } = useAlert();

  // Extract numeric price from string like "N10,000"
  const getNumericPrice = (priceStr: string): number => {
    const match = priceStr.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  };
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("#111827");
  const [activeImage, setActiveImage] = useState<number>(0);

  if (!isOpen || !product) return null;

  // Use provided images array where possible
  const images = (product.images && product.images.length > 0) ? product.images : [product.img];

  const clothingSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL", "XXL"];
  const colorOptions = product.colors && product.colors.length > 0 ? product.colors : ["#111827", "#ef4444", "#10b981", "#3b82f6"];

  const prodCategory = product.category || category;
  // only require a size when actual sizes are provided by the product
  const needsSize = Boolean(product.sizes && product.sizes.length > 0);

  

  const handleAdd = () => {
    if (needsSize && !selectedSize) {
      showAlert("Please select a size before adding to cart.", "warning");
      return;
    }
    addToCart({ ...product, size: selectedSize, color: selectedColor });
    onAdded?.(`${product.name} (${selectedSize || "no size"}) added to cart`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl p-4 overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="md:w-1/2 w-full">
            <img src={images[activeImage]} alt={product.name} className="w-full h-64 md:h-80 object-cover rounded-md" />
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name}-${i}`}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-16 object-cover rounded-md cursor-pointer border ${activeImage === i ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="md:w-1/2 w-full">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-primary font-bold mt-2">{formatCurrency(getNumericPrice(product.price))}</p>
              </div>
              <button onClick={onClose} aria-label="Close" title="Close" className="text-gray-600 dark:text-gray-300"><FiX /></button>
            </div>

            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{product.description || 'No description available.'}</p>

            {/* Colors */}
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Colors</div>
              <div className="flex gap-2">
                {colorOptions.map((c) => {
                  
                 return  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    title={`Select color ${c}`}
                    aria-label={`Select color ${c}`}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center ${selectedColor === c ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                  >
                    
                      
                    <span className=" rounded-full" style={{ backgroundColor: c,display:"inline-block",minWidth:"30px",minHeight:"30px"}}></span>
                  </button>
})}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Sizes</div>
              <div className="flex flex-wrap gap-2">
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`px-3 py-1 rounded border ${selectedSize === s ? "bg-primary text-white" : "bg-transparent"}`}>{s}</button>
                  ))
                ) : (
                  // muted placeholders when no sizes are available
                  clothingSizes.map((s) => (
                    <span key={s} className={"px-3 py-1 rounded border opacity-50 text-gray-400 cursor-not-allowed"}>{s}</span>
                  ))
                )}
              </div>
            </div>

            {/* Add to cart */}
            <div className="mt-6 flex gap-2">
              <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded w-full">Add to Cart</button>
              <button onClick={() => { addToCart({ ...product, size: selectedSize, color: selectedColor }); onClose(); navigate('/checkout'); }} className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded w-full">Buy Now</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductModal;
