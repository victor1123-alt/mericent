import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Button from "./ui/button";

import slide1 from "../assets/mercient_pics.jpeg";
import slide2 from "../assets/mercient_shoes.jpeg";
import slide3 from "../assets/mericent_dress.jpeg";

const slides = [slide1, slide2, slide3];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
   <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-10 sm: pt-24">
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 items-center pt-10 sm:pt-16 pb-6 sm:pb-10">

        {/* TEXT SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex-1 space-y-3 sm:space-y-6 lg:space-y-8 text-left min-w-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 rounded-full bg-accent"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-[10px] sm:text-sm font-medium text-accent-foreground whitespace-nowrap">
              New Collection 2026
            </span>
          </motion.div>

          <h1 className="font-display text-xl sm:text-4xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Your Style, <span className="text-gradient text-primary">Your Way</span>
          </h1>

          <p className="text-xs sm:text-base lg:text-lg text-muted-foreground max-w-lg leading-relaxed hidden sm:block">
            Step into style with our curated collection of trendy shoes, chic
            clothing, and fashion accessories. Discover your perfect look at
            unbeatable prices.
          </p>

          <p className="text-xs text-muted-foreground leading-relaxed sm:hidden">
            Discover trendy shoes, clothing & accessories at unbeatable prices.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <Button
              variant="solid"
              className="!bg-primary !text-white hover:!bg-primary/90 px-8 h-14 text-base font-semibold rounded-xl transition-colors"
            >
              Explore Collections
            </Button>
          </div>
        </motion.div>

        {/* IMAGE SLIDESHOW */}
       <motion.div
  initial={{ opacity: 0, x: 40 }}
  animate={{ opacity: 1, x: 0 }}
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.4 }}
 className="relative w-full h-[260px] sm:h-[320px] md:h-[420px] lg:h-[480px] overflow-hidden shadow-2xl 
rounded-3xl backdrop-blur-lg border border-white/20">
          {slides.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="hero-slide"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          {/* slide indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  current === index
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}