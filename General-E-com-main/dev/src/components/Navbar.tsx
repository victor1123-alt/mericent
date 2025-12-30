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

  const getFirstName = (user: any) => {
    // console.log("user",user.user.email);
    
    if (!user) return '';
    const name = (user.user?? `${user.user.firstName ?? ''} ${user.user.lastName ?? ''}`);
    const myname =`${name.firstName ?? ''} ${name.lastName ?? ''}`;
    if (myname) return myname.split(' ')[0];
    if (name.email) return name.email.split('@')[0];
    return 'User';
  };

  // Sync search input with URL query param
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    setSearch(qp.get('search') || '');
  }, [location.search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Debounced navigation so search works as the user types
  useEffect(() => {
    const currentQ = new URLSearchParams(location.search).get('search') || '';
    // If the local input already matches the URL, don't navigate (prevents loops)
    if (search.trim() === currentQ) return;

    const timeout = setTimeout(() => {
      const q = search.trim();
      if (q) {
        navigate(`/?search=${encodeURIComponent(q)}`);
      } else {
        navigate(`/`);
      }
    }, 450); // 450ms debounce

    return () => clearTimeout(timeout);
  }, [search, location.search, navigate]);

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
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 py-3 gap-3 md:px-6">

          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold whitespace-nowrap">
              <Link to="/"><span className="text-primary">M</span>ercient</Link>
            </h1>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white dark:bg-gray-800 rounded-full px-3 md:px-4 py-2 shadow-inner flex-grow sm:flex-grow-0 sm:w-[65%] md:w-[50%] min-w-[220px] order-3 sm:order-none"
          >
            <input
              type="text"
              placeholder="Search for products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm md:text-base"
            />
            <button
              type="submit"
              className="ml-2 bg-primary text-white rounded-full px-3 py-1.5 hover:bg-secondary transition-colors flex items-center gap-1"
            >
              <FiSearch size={16} />
              <span className="hidden sm:inline text-sm">Search</span>
            </button>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdown(!currencyDropdown)}
                className="flex items-center gap-1 font-medium text-slate-900 dark:text-gray-300 hover:text-primary transition-colors"
              >
                <img src={flag} alt="Currency flag" className="w-5 h-5 rounded-full" />
                <span className="hidden sm:inline">{currencies[currency as keyof typeof currencies]?.symbol || '₦'}</span>
                {isLoadingRates && <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin"></div>}
                <FiChevronDown size={14} className={`transition-transform ${currencyDropdown ? 'rotate-180' : ''}`} />
              </button>
              {currencyDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[120px]">
                  {Object.entries(currencies).map(([code, { symbol, name }]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setCurrencyDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                    >
                      <span className="font-medium">{symbol}</span>
                      <span className="text-sm">{name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => setShowCart(true)}
              className="relative text-2xl hover:text-primary transition-all"
            >
              <BsCart3 />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-xs rounded-full px-[5px]">
                  {cartCount}
                </span>
              )}
              {/* syncing indicator */}
              {/** show small pulse when cart syncing */}
              {syncing && (
                <span className={`absolute -bottom-2 -right-0 w-2 h-2 rounded-full bg-yellow-400 animate-pulse`} />
              )}
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth area */}
            {user ? (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="hidden md:flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <span>Hi, <strong>{getFirstName(user)}</strong></span>
                  <FiChevronDown className={`transform transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={async () => { await logout(); navigate('/'); setDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
                {/* Mobile user menu */}
                <div className="md:hidden">
                  <span className="text-sm">Hi, <strong>{getFirstName(user)}</strong></span>
                  <div className="flex gap-2 mt-1">
                    <Link
                      to="/orders"
                      className="bg-primary text-white text-xs px-3 py-1 rounded hover:opacity-90"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={async () => { await logout(); navigate('/'); setMenuOpen(false); }}
                      className="bg-gray-200 text-xs px-3 py-1 rounded"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowSignup(true)}
                  className="hidden md:inline-block bg-primary text-white text-sm px-4 py-2 rounded-full hover:bg-secondary transition-colors"
                >
                  Sign Up
                </button>
                <button onClick={() => setShowLogin(true)} className="hidden md:inline-block text-sm px-3 py-1 rounded hover:bg-gray-100">Login</button>
              </>
            )}

            {/* Admin pages accessible at /admin and /admin/login (not shown in navbar) */}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-2xl hover:text-primary transition-all"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-5 py-3 space-y-3">
            <div>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between w-full font-medium text-slate-900 dark:text-gray-300 py-2"
              >
                Products
                <FiChevronDown
                  className={`transform transition-transform duration-300 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {dropdownOpen && (
                <div className="pl-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <a href="#" className="block hover:text-primary">Men’s Fashion</a>
                  <a href="#" className="block hover:text-primary">Women’s Fashion</a>
                  <a href="#" className="block hover:text-primary">Electronics</a>
                  <a href="#" className="block hover:text-primary">Home & Kitchen</a>
                </div>
              )}
            </div>

            <a href="#" className="block hover:text-primary">Deals</a>
            <a href="#" className="block hover:text-primary">Contact Us</a>

            {/* Mobile user menu for logged-in users */}
            {user && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <Link
                  to="/orders"
                  className="block w-full bg-primary text-white text-sm px-4 py-2 rounded-full hover:bg-secondary transition-colors text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  My Orders
                </Link>
              </div>
            )}

            {/* ✅ Mobile Sign Up */}
            {!user && (
              <button 
                onClick={() => setShowSignup(true)}
                className="w-full bg-primary text-white text-sm px-4 py-2 rounded-full hover:bg-secondary transition-colors">
                Sign Up
              </button>
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
            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />


      {/* ✅ Cart Popup */}
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

