import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

const icons = {
  success: <CheckCircle className="text-green-400" size={28} />,
  error: <XCircle className="text-red-400" size={28} />,
  warning: <AlertTriangle className="text-yellow-400" size={28} />,
};

export default function Notification({ type = "success", message, onClose }) {
  return (
    <div className="fixed top-6 right-6 z-[2000] flex items-center gap-3 bg-[#1a1a1a] text-white border border-gray-700 rounded-xl shadow-lg p-4 animate-fade-in">
      {icons[type]}
      <p className="text-sm max-w-[260px] leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}
