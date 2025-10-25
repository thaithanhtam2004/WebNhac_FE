import { X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../../../configs/apiConfig";

const GenreForm = ({ isEdit = false, genre = null, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data khi chỉnh sửa
  useEffect(() => {
    if (isEdit && genre) {
      setFormData({
        name: genre.name || "",
        description: genre.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [isEdit, genre]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      onError?.("Vui lòng nhập tên thể loại!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await axios.put(`/genres/${genre.genreId || genre._id}`, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        });
        onSuccess?.("Cập nhật thể loại thành công!");
      } else {
        await axios.post("/genres", {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        });
        onSuccess?.("Thêm thể loại thành công!");
      }
      onClose();
    } catch (err) {
      console.error("❌ Lỗi lưu thể loại:", err);
      onError?.(err.response?.data?.message || "Lỗi khi lưu thể loại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-lg w-[420px] p-6 relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-xl font-bold text-center mb-6">
          {isEdit ? "Chỉnh sửa thể loại" : "Thêm thể loại"}
        </h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Tên thể loại */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Tên thể loại <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên thể loại..."
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Mô tả</label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả (tùy chọn)..."
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 text-white"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang xử lý..." : isEdit ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenreForm;
