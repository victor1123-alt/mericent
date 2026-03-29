import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export  default function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
    >
      {children}
    </button>
  );
}
