import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategoryNav from "../components/Category";
import Product from "../components/Product";
import Footer from "../components/Footer";

const Home: React.FC = () => {
  return (
    <div className="bg-milk overflow-hidden dark:bg-darkblack min-h-screen text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="pt-18">
        <Hero title="GET THE BEST"/>
        <div className="mt-6">
          <CategoryNav />
          <Product />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;

