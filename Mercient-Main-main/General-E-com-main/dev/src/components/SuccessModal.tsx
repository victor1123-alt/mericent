import React from "react";
import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, title = "Success", message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-[90%] max-w-sm shadow-xl text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <FiCheckCircle className="text-green-500 w-12 h-12" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
          <button
            onClick={onClose}
            className="mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessModal;