import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

const icons = {
  success: <CheckCircle className="text-green-500" size={24} />,
  error: <XCircle className="text-red-500" size={24} />,
  warning: <AlertTriangle className="text-yellow-500" size={24} />,
};

export default function Notification({ type = "success", message, onClose }) {
  return (
    <div className="fixed top-6 right-6 z-[2000] flex items-center gap-3 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-lg p-4 animate-fade-in font-medium">
      {icons[type]}
      <p className="text-sm max-w-[260px] leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-900 transition-colors outline-none"
      >
        <X size={18} />
      </button>
    </div>
  );
}
