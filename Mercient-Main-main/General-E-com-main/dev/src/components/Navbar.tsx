import React, { useState, useEffect } from "react";
import { FiSearch, FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { BsCart3 } from "react-icons/bs";
import { useNavigate, useLocation, Link } from "react-router-dom";
import ThemeToggle from "./Mode";
import flag from "../assets/9ja.png";
import { useCart } from "../context/CardContext";
import CartModal from "./CartModal";

import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import { useUser } from "../context/UserContext";
import { useCurrency } from "../context/CurrencyContext";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currencyDropdown, setCurrencyDropdown] = useState(false);

  const { currency, setCurrency, currencies, isLoadingRates } = useCurrency();
  const { cartCount, syncing } = useCart();
  const { user, logout } = useUser();

  const navigate = useNavigate();
  const location = useLocation();

  /* keep search value if page refresh */
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    setSearch(qp.get("search") || "");
  }, [location.search]);

  /* SEARCH SUBMIT (MAIN FUNCTIONALITY) */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const q = search.trim();

    if (q) {
      navigate(`/?search=${encodeURIComponent(q)}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-milk dark:bg-darkblack text-slate-900 dark:text-white shadow-md transition-colors duration-300">

        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between
        px-3 sm:px-4 md:px-6
        py-2 md:py-3
        gap-2 sm:gap-3">

          {/* LOGO */}
          <div className="flex items-center shrink-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold whitespace-nowrap">
              <Link to="/"><span className="text-primary">M</span>ercient</Link>
            </h1>
          </div>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Currency */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdown(!currencyDropdown)}
                className="flex items-center gap-1 font-medium hover:text-primary transition-colors"
              >
                <img src={flag} alt="Currency flag" className="w-5 h-5 rounded-full" />

                <span className="hidden sm:inline">
                  {currencies[currency as keyof typeof currencies]?.symbol || "₦"}
                </span>

                {isLoadingRates && (
                  <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin"></div>
                )}

                <FiChevronDown
                  size={14}
                  className={`transition-transform ${currencyDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {currencyDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 min-w-[120px]">
                  {Object.entries(currencies).map(([code, { symbol, name }]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setCurrencyDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <span className="font-medium">{symbol}</span>
                      <span className="text-sm">{name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CART */}
            <button
              onClick={() => setShowCart(true)}
              className="relative text-xl sm:text-2xl hover:text-primary transition-all"
            >
              <BsCart3 />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] sm:text-xs rounded-full px-[5px]">
                  {cartCount}
                </span>
              )}

              {syncing && (
                <span className="absolute -bottom-2 right-0 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              )}
            </button>

            {/* THEME */}
            <ThemeToggle />

            {/* AUTH BUTTONS (Desktop) */}
            {user ? (
              <>
                <span className="hidden lg:inline-block text-sm px-3 py-1 rounded text-gray-700 dark:text-gray-200">Hi, {user.name || user.email}</span>
                <Link
                  to="/orders"
                  className="hidden lg:inline-block text-sm px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-colors"
                >
                  My Orders
                </Link>
                <button
                  onClick={logout}
                  className="hidden lg:inline-block text-sm px-3 py-1 rounded hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowSignup(true)}
                  className="hidden lg:inline-block bg-primary text-white text-sm px-4 py-2 rounded-full hover:bg-secondary"
                >
                  Sign Up
                </button>

                <button
                  onClick={() => setShowLogin(true)}
                  className="hidden lg:inline-block text-sm px-3 py-1 rounded hover:bg-gray-100"
                >
                  Login
                </button>
              </>
            )}

            {/* AUTH BUTTONS (Mobile) */}
            {user ? (
              <button
                onClick={logout}
                className="lg:hidden text-sm px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowSignup(true)}
                  className="lg:hidden text-sm px-2 py-1 rounded bg-primary text-white"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="lg:hidden text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  Login
                </button>
              </>
            )}

            {/* MENU (Mobile + Tablet) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-xl sm:text-2xl ml-1 hover:text-primary"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>

          </div>

          {/* SEARCH BAR */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white dark:bg-gray-800 rounded-full
            px-3 sm:px-4 py-2 shadow-inner
            w-full order-3
            md:order-none
            md:flex-1 md:max-w-lg
            lg:max-w-xl"
          >
            <input
              type="text"
              placeholder="Search for products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-gray-500 text-sm md:text-base"
            />

            <button
              type="submit"
              className="ml-2 bg-primary text-white rounded-full px-3 py-1.5 hover:bg-secondary flex items-center gap-1"
            >
              <FiSearch size={16} />
              <span className="hidden sm:inline text-sm">Search</span>
            </button>
          </form>
        </div>

        {/* MOBILE + TABLET MENU */}
        {menuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t px-5 py-3 space-y-3">

            {/* <a href="#" className="block hover:text-primary">Men’s Fashion</a>
            <a href="#" className="block hover:text-primary">Women’s Fashion</a>
            <a href="#" className="block hover:text-primary">Electronics</a>
            <a href="#" className="block hover:text-primary">Home & Kitchen</a> */}

            {user ? (
              <>
                <div className="text-sm text-gray-800 dark:text-gray-200">Hi, {user.name || user.email}</div>
                <Link
                  to="/orders"
                  className="block w-full bg-blue-500 text-white text-sm px-4 py-2 rounded-full hover:bg-blue-600 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={logout}
                  className="w-full bg-red-500 text-white text-sm px-4 py-2 rounded-full hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowSignup(true)}
                  className="w-full bg-primary text-white text-sm px-4 py-2 rounded-full"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm px-4 py-2 rounded-full"
                >
                  Login
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        openLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />

      {showCart && (
        <CartModal
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            setShowCart(false);
            window.location.href = "/checkout";
          }}
        />
      )}
    </>
  );
};

export default Navbar;