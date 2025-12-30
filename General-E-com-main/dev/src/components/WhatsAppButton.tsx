import React, { useMemo, useState } from "react";
import { BsWhatsapp } from "react-icons/bs";
import { FiX, FiSend } from "react-icons/fi";

interface WhatsAppButtonProps {
  phone?: string; // local or international format
  initialMessage?: string;
}

function toInternational(phone?: string) {
  if (!phone) return "2347044350689";
  let p = String(phone).trim();
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = `234${p.slice(1)}`;
  return p;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone = (import.meta.env.VITE_WHATSAPP_NUMBER as string) || "+2347044350689",
  initialMessage = (import.meta.env.VITE_WHATSAPP_MESSAGE as string) || "Hello! I need help with an order.",
}) => {
  const intlPhone = useMemo(() => toInternational(phone), [phone]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [history, setHistory] = useState<Array<{ from: "user" | "bot"; text: string }>>([
    { from: "bot", text: "Hi 👋, I am the WhatsApp assistant. How can I help you?" },
  ]);

  const sendToWhatsApp = (text: string) => {
    const href = `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
    window.open(href, "_blank", "noopener noreferrer");
    setHistory((h) => [...h, { from: "user", text }]);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    sendToWhatsApp(message.trim());
    setMessage("");
  };

  return (
    <>
      {/* Styles for vibrate animation and popup */}
      <style>{`
        @keyframes whatsapp-vibe {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); transform: scale(1); }
          50% { box-shadow: 0 0 14px 6px rgba(16,185,129,0.08); transform: scale(1.03); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); transform: scale(1); }
        }
        .whatsapp-vibe { animation: whatsapp-vibe 1.6s infinite ease-in-out; }
        .whatsapp-popup-enter { transform: translateY(10px); opacity: 0; }
      `}</style>

      {/* Floating Button */}
      <button
        aria-label="Open WhatsApp chat"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-6 z-50 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-colors whatsapp-vibe"
      >
        <BsWhatsapp className="w-6 h-6" />
      </button>

      {/* Chat Popup */}
      {open && (
        <div className="fixed right-4 bottom-20 z-50 w-[320px] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-green-600 text-white">
            <div className="flex items-center gap-2">
              <BsWhatsapp className="w-5 h-5" />
              <div>
                <div className="font-semibold text-sm">WhatsApp Support</div>
                <div className="text-xs opacity-90">Usually replies in a few minutes</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" title="Close chat" className="opacity-90 hover:opacity-100">
              <FiX />
            </button>
          </div>

          <div className="p-3 max-h-48 overflow-y-auto space-y-2 bg-white dark:bg-gray-900">
            {history.map((h, i) => (
              <div key={i} className={`flex ${h.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-lg text-sm ${h.from === "user" ? "bg-green-100 text-green-800" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"}`}>
                  {h.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-200 outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-green-600 p-2 rounded-lg text-white hover:bg-green-700 flex items-center justify-center"
                aria-label="Send message to WhatsApp"
              >
                <FiSend />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Chat will open WhatsApp to send the message to <span className="font-medium">{phone}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;
