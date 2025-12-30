import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { useUser } from "../context/UserContext";
import SuccessModal from "./SuccessModal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { login } = useUser();

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Enter email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      setSuccessMessage("Login successful. Welcome back!");
      setShowSuccess(true);
    } catch (err) {
      let message = "Login failed";
      if (err && typeof err === "object") {
        // @ts-expect-error - best-effort to read nested message field
        message = err.response?.data?.message || (err as Error).message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <motion.div
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-[90%] sm:w-[400px]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900"
              title="Close login modal"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>

          <h2 className="text-xl text-primary font-semibold text-center mb-4">Login</h2>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-gray-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          {/* Password */}
          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-gray-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-white py-2 rounded-lg hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </motion.div>
      </div>

      <SuccessModal isOpen={showSuccess} message={successMessage} onClose={handleSuccessClose} />
    </>
  );
};

export default LoginModal;
