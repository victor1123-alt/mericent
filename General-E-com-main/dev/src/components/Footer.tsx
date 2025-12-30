import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 dark:bg-gray-800 dark:text-gray-200 py-8">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

        {/* Brand */}
        <div className="text-2xl font-bold">
          <span className="text-primary dark:text-primary">M</span>ercient
        </div>

        {/* WhatsApp Customer Service */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="font-semibold text-white dark:text-gray-200 mb-1">
            Customer Service
          </h3>
          <a
            href="https://wa.me/2347044350689"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white dark:hover:text-white transition"
          >
            <FaWhatsapp className="text-green-500" />
            +234 7044 350 689
          </a>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <h3 className="font-semibold text-white dark:text-gray-200">Follow Us</h3>
          <div className="flex gap-4 mt-1">
            <Link to="#" className="hover:text-white dark:hover:text-white transition">
              <FaFacebookF />
            </Link>
            <Link to="#" className="hover:text-white dark:hover:text-white transition">
              <FaTwitter />
            </Link>
            <Link to="#" className="hover:text-white dark:hover:text-white transition">
              <FaInstagram />
            </Link>
            <Link to="#" className="hover:text-white dark:hover:text-white transition">
              <FaLinkedinIn />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Mercient. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
