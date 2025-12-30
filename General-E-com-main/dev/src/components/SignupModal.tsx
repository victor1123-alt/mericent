import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useUser } from "../context/UserContext";
import SuccessModal from "./SuccessModal";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  openLogin: () => void; // switch modal
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, openLogin }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { signup } = useUser();

  if (!isOpen) return null;

   const loginWithGoogle = () => {
    window.location.href = "https://mericent.onrender.com/auth/google";
  };
  
  const handleEmailSignup = async () => {
    if (!email || !password || !firstName || !lastName) {
      setError("Please enter firstname, lastname, email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signup(firstName, lastName, email, password);
      setSuccessMessage(`Welcome ${firstName}! Signup successful.`);
      setShowSuccess(true);
    } catch (err) {
      let message = "Signup failed.";
      if (err && typeof err === "object") {
        // @ts-expect-error - best-effort to read nested message field
        message = err.response?.data?.message || (err as Error).message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900"
            title="Close signup modal"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        <h2 className="text-xl text-primary font-semibold text-center mb-4">
          Sign up for updates
        </h2>

        {/* First + Last Name */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="First Name"
            className="w-1/2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-1/2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg mb-3 dark:bg-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        {/* Password */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleEmailSignup}
          className="bg-primary text-white w-full py-2 rounded-lg hover:opacity-90 mb-3"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Google Signup */}
        <button
          className="bg-primary text-white w-full py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90"
          disabled={loading}
          onClick={loginWithGoogle}
        >
          <FcGoogle className="w-5 h-5" /> Sign Up with Google
        </button>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        {/* LOGIN BUTTON */}
        <button
          onClick={() => {
            onClose();  // close signup
            openLogin(); // open login popup
          }}
          className="w-full mt-3 bg-primary text-white py-2 rounded-lg hover:opacity-90"
        >
          Login
        </button>

      </motion.div>

      <SuccessModal
        isOpen={showSuccess}
        message={successMessage}
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
      />
    </div>
  );
};

export default SignupModal;
