import React, { useState, useEffect, useRef } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";

const CategoryNav: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const categories = [
    { name: "All", path: "/products" },
    { name: "Menswear", path: "/products/menswear" },
    { name: "Femalewear", path: "/products/femalewear" },
    { name: "Unisex", path: "/products/unisex" },
    { name: "Cap", path: "/products/cap" },
    { name: "Shoes", path: "/products/shoes" },
    { name: "Heels", path: "/products/heels" },
    { name: "Bags", path: "/products/bags" },
  ];

  const moreCategories = [
    { name: "Jeans", path: "/products/jeans" },
    { name: "Top", path: "/products/top" },
    { name: "Gown", path: "/products/gown" },
  ];

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full bg-milk dark:bg-darkblack text-gray-800 dark:text-white py-4 shadow-md relative z-40">
      <h2 className="text-center text-2xl md:text-3xl font-bold mb-4">
        Our <span className="text-primary">Products</span>
      </h2>

      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 px-3">
        {categories.map((cat, index) => (
          <Link
            key={index}
            to={cat.path}
            className={`text-sm md:text-base pb-1 border-b-2 transition-all duration-200 
            ${
              location.pathname === cat.path
                ? "border-primary font-semibold"
                : "border-transparent hover:border-primary"
            }`}
          >
            {cat.name}
          </Link>
        ))}

        {/* More Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-blue-500 hover:text-white transition"
          >
            <BsThreeDots size={20} />
          </button>

          {showDropdown && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              {moreCategories.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="block text-center px-4 py-2 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md transition"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
