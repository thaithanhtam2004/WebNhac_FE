import React from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

const icons = {
  success: <CheckCircle className="text-green-400" size={28} />,
  error: <XCircle className="text-red-400" size={28} />,
  warning: <AlertTriangle className="text-yellow-400" size={28} />,
};

export default function Notification({ type = "success", message, onClose }) {
  // z-index cực cao để đè lên mọi modal
  return (
    <div className="fixed top-6 right-6 z-[99999] flex items-center gap-3 bg-[#1a1a1a] text-white border border-gray-700 rounded-xl shadow-2xl p-4 animate-slide-in">
      {icons[type]}
      <p className="text-sm max-w-[260px] leading-snug font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}