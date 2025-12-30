import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-32 lg:h-60 bg-gray-300 dark:bg-gray-700"></div>
      <div className="px-2 py-4 lg:p-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-8 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
          ))}
        </div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;