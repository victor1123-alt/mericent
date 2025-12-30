import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaPrimary?: { text: string; onClick: () => void };
  ctaSecondary?: { text: string; onClick: () => void };
  images?: string[];
}

const defaultImages = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80", // Fashion shopping
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1600&q=80", // Shoes
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1600&q=80", // Clothing
  "https://images.unsplash.com/photo-1506629905607-0b5b8b5b2b5b?auto=format&fit=crop&w=1600&q=80", // Fashion accessories
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80"  // Street fashion
];

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  images = defaultImages,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden pt-16 mt-16">
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.0 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[currentIndex]})` }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white px-4">
        <motion.div
          key={currentIndex}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-2xl text-center"
        >
          <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tight bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">{title}</h1>
          <p className="text-base text-center font-semibold text-yellow-300 mb-4 tracking-wide uppercase" style={{fontSize:"30px",textAlign:"center"}}>Your Style, Your Way</p>
          <p className="text-sm tracking-wide text-gray-300 leading-relaxed mb-6 mx-20">
            Step into style with our curated collection of trendy shoes, chic clothing, and fashion accessories. Discover your perfect look at unbeatable prices with fast shipping and easy returns.
          </p>

          <div className="flex justify-center gap-4 mb-8">
            {ctaPrimary && (
              <motion.button
                onClick={ctaPrimary.onClick}
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                {ctaPrimary.text}
              </motion.button>
            )}
            {ctaSecondary && (
              <motion.button
                onClick={ctaSecondary.onClick}
                className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-full font-bold transition-all hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {ctaSecondary.text}
              </motion.button>
            )}
          </div>

          {/* Feature highlights with animation */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 1.2 }}
          >
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free Shipping Over ₦10k
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure & Easy Returns
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              24/7 Style Support
            </div>
          </motion.div>

          {/* Category Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1.2 }}
          >
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-center hover:bg-white/30 transition-all transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Shoes</h3>
              <p className="text-sm text-gray-200">Latest sneakers, boots & sandals</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-center hover:bg-white/30 transition-all transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Clothing</h3>
              <p className="text-sm text-gray-200">Trendy dresses, jeans & tops</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-center hover:bg-white/30 transition-all transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Accessories</h3>
              <p className="text-sm text-gray-200">Bags, hats & jewelry</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
