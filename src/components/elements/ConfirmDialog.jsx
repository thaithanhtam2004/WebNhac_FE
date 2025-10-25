import { X } from "lucide-react";

export default function ConfirmDialog({
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] animate-fade-in">
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-xl w-[400px] p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-3">{title}</h2>
        <p className="text-sm text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 text-white transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
