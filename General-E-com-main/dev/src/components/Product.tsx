import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { BsCartPlus } from "react-icons/bs";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  Menswear,
  Femalewear,
  Unisex,
  Caps,
  Shoes,
  Heels,
  Bags,
} from "../data";
import { useCart, type ProductItem } from "../context/CardContext";
import Alert from "../components/Alert";
import ProductModal from "../components/ProductModal";
import ProductSkeleton from "../components/ProductSkeleton";
import { productAPI } from "../utils/api";
import { useFormatCurrency } from "../utils/useFormatCurrency";

const clothingSizes = ["S", "M", "L", "XL", "XXL"];

const Product: React.FC = () => {

  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const { addToCart } = useCart();
  const formatCurrency = useFormatCurrency();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<null | ProductItem>(null);

  // Extract numeric price from string like "N10,000"
  const getNumericPrice = (priceStr: string): number => {
    const match = priceStr.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  };

  // Backend product shape
  type BackendProduct = {
    _id?: string;
    id?: string;
    img?: string;
    images?: string[];
    productName?: string;
    price?: number;
    category?: string;
    description?: string;
    sizes?: string[];
    colors?: string[];
    sku?: string;
  };

  const getProducts = useCallback(() => {
    switch (category) {
      case "menswear":
        return Menswear.map((p) => ({ ...p, category: "menswear" }));
      case "femalewear":
        return Femalewear.map((p) => ({ ...p, category: "femalewear" }));
      case "unisex":
        return Unisex.map((p) => ({ ...p, category: "unisex" }));
      case "cap":
        return Caps.map((p) => ({ ...p, category: "cap" }));
      case "shoes":
        return Shoes.map((p) => ({ ...p, category: "shoes" }));
      case "heels":
        return Heels.map((p) => ({ ...p, category: "heels" }));
      case "bags":
        return Bags.map((p) => ({ ...p, category: "bags" }));
      default:
        return [
          ...Menswear.map((p) => ({ ...p, category: "menswear" })),
          ...Femalewear.map((p) => ({ ...p, category: "femalewear" })),
          ...Unisex.map((p) => ({ ...p, category: "unisex" })),
          ...Caps.map((p) => ({ ...p, category: "cap" })),
          ...Shoes.map((p) => ({ ...p, category: "shoes" })),
          ...Heels.map((p) => ({ ...p, category: "heels" })),
          ...Bags.map((p) => ({ ...p, category: "bags" })),
        ];
    }
  }, [category]);

  const [products, setProducts] = useState<ProductItem[]>(getProducts());

  // Pagination state (server-driven)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // sent as `limit` to backend
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // displayed products are provided by server (or fallback list)
  const paginatedProducts = products; // already paginated by backend when fetched

  const displayName =
    category && category !== "all"
      ? `${category.charAt(0).toUpperCase()}${category.slice(1)} Collection`
      : "All Products";

  // Handle adding to cart
  const handleAddToCart = (item: ProductItem) => {
    console.log("Adding to cart:", item);
    const selectedSize = selectedSizes[item.name] || "";

    // Only require size when sizes are explicitly provided
    const needsSize = Array.isArray(item.sizes) && item.sizes.length > 0;

    if (needsSize && !selectedSize) {
      // Instead of alerting, open the product modal so user can pick size/color on mobile
      setSelectedProduct(item);
      return;
    }

    addToCart({ ...item, size: selectedSize, color: item.color, category: item.category });
    setAlertMessage(`${item.name} (${selectedSize || "No size"}) added to cart! ✔`);
  };

  // Handle selecting or typing size
  const handleSizeSelect = (productName: string, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productName]: size,
    }));
  };

  // Reset page to 1 when search changes
  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchQuery, currentPage]);

  // Load products from backend; fallback to bundled data if backend returns nothing
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const params: Record<string, string | number> = { page: currentPage, limit: itemsPerPage };
        if (category && category !== "all") params.category = category;
        if (searchQuery) params.search = searchQuery;
        const res = await productAPI.getProducts(params);

        // supports responses that are either: { data: [{...}], total, page, pages }
        // or legacy: [{...}]
        if (res?.status === 200) {
          if (Array.isArray(res.data)) {
            const mapped = res.data.map((p: BackendProduct) => ({
              id: p._id || p.id,
              img: p.img || (Array.isArray(p.images) && p.images[0]) || "https://via.placeholder.com/600x400?text=No+Image",
              images: p.images || (p.img ? [p.img] : []),
              name: p.productName || "Unnamed Product",
              priceNumber: p.price ?? 0,
              price: `N${p.price ?? 0}`,
              button: "Add to Chart",
              category: p.category || "all",
              sizes: p.sizes || [],
              colors: p.colors || [],
              description: p.description || "",
              sku: p.sku || undefined,
            }));
            setProducts(mapped);
            setTotalPages(Math.max(1, Math.ceil(mapped.length / itemsPerPage)));
            setIsLoading(false);
            return;
          }

          // paginated response
          const pag = res.data && res.data.data ? res.data : null;
          if (pag && Array.isArray(pag.data)) {
            const mapped = pag.data.map((p: BackendProduct) => ({
              id: p._id || p.id,
              img: p.img || (Array.isArray(p.images) && p.images[0]) || "https://via.placeholder.com/600x400?text=No+Image",
              images: p.images || (p.img ? [p.img] : []),
              name: p.productName || "Unnamed Product",
              priceNumber: p.price ?? 0,
              price: `N${p.price ?? 0}`,
              button: "Add to Chart",
              category: p.category || "all",
              sizes: p.sizes || [],
              colors: p.colors || [],
              description: p.description || "",
              sku: p.sku || undefined,
            }));
            setProducts(mapped);
            setTotalPages(pag.pages || 1);
            setIsLoading(false);
            return;
          }
        }

        // If we get here, backend didn't return valid data, use static data
        setProducts(getProducts());
        setHasError(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Product fetch failed:", err);
        // On error, use static data
        setProducts(getProducts());
        setHasError(true);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, getProducts, currentPage, itemsPerPage, searchQuery]);

  return (
    <section className="py-10 bg-milk dark:bg-darkblack transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          {displayName}
        </h2>

        {/* ✅ Alert */}
        {alertMessage && (
          <Alert
            message={alertMessage}
            type="success"
            onClose={() => setAlertMessage(null)}
          />
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {isLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))
          ) : (
            // Show actual products when loaded
            paginatedProducts.map((wear, index) => {
              // determine item-specific category so sizes show even when viewing 'All Products' (kept for future use)
              // const prodCat = wear.category || category;



              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-sm shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="overflow-hidden relative cursor-pointer" onClick={() => setSelectedProduct(wear)}>
                    <img
                      src={wear.img}
                      alt={wear.name}
                      className="w-full h-32 lg:h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="px-2 py-4 lg:p-4 text-start">
                    <p className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                     <button onClick={() => setSelectedProduct(wear)} className="text-left w-full hover:underline">{wear.name}</button>
                    </p>
                    <p className="text-primary font-bold mb-3">{formatCurrency(getNumericPrice(wear.price))}</p>

                    {/* 👕 Size display (always visible). If sizes are provided use them, otherwise show muted placeholders */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {wear.sizes && wear.sizes.length > 0 ? (
                          wear.sizes.map((size, i) => (
                            <span
                              key={i} 
                              onClick={() => handleSizeSelect(wear.name, size)}
                              className={`text-sm border px-2 py-1 rounded-md cursor-pointer transition-all ${
                                selectedSizes[wear.name] === size
                                  ? "bg-primary text-white border-primary"
                                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white"
                              }`}
                            >
                              {size}
                            </span>
                          ))
                        ) : (
                          // Muted placeholders when no sizes available
                          clothingSizes.map((size, i) => (
                            <span
                              key={i}
                              className={"text-sm border px-2 py-1 rounded-md opacity-50 text-gray-400 cursor-not-allowed"}
                            >
                              {size}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(wear)}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white font-medium py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
                    >
                      <BsCartPlus /> {wear.button}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Product Detail Modal */}
        <ProductModal
          isOpen={!!selectedProduct}
          product={selectedProduct as ProductItem}
          category={category}
          onClose={() => setSelectedProduct(null)}
          onAdded={(msg) => setAlertMessage(msg)}
        />

        {/* Pagination Controls - Only show when not loading */}
        {!isLoading && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className={`px-3 py-1 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <FiChevronLeft />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className={`px-3 py-1 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Product;
