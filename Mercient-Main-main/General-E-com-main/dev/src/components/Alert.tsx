import React, { useEffect, useState } from "react";

interface AlertProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
  showCancelButton?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  message,
  type = "info",
  onClose,
  duration = 5000,
  showCancelButton = true
}) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [onClose, duration]);

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-500 text-black";
      case "error":
        return "bg-red-100 border-red-500 text-black";
      case "warning":
        return "bg-yellow-100 border-yellow-500 text-black";
      case "info":
      default:
        return "bg-blue-100 border-blue-500 text-black";
    }
  };

  const getTextColor = () => {
    return "text-black";
  };

  return (
    <div className={`fixed top-4 right-4 z-[9999] border-l-4 p-4 max-w-sm shadow-lg ${getColors()}`}>
      <div className="flex items-start">
        <div className="flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`} style={{ color: 'black' }}>{message}</p>
        </div>
        {showCancelButton && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Auto-closing in {timeLeft}s
      </div>
    </div>
  );
};

export default Alert;
