import { X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../../../configs/apiConfig";

const GenreForm = ({ isEdit = false, genre = null, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load dữ liệu khi chỉnh sửa
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

  // Xử lý thay đổi input
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-[420px] rounded-2xl bg-[#1a1a1a] p-6 text-white shadow-lg">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 transition hover:text-white disabled:opacity-50"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        {/* Tiêu đề */}
        <h2 className="mb-6 text-center text-xl font-bold">
          {isEdit ? "Chỉnh sửa thể loại" : "Thêm thể loại"}
        </h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Tên thể loại */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Tên thể loại <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên thể loại..."
              className="w-full rounded-lg border border-gray-700 bg-[#2a2a2a] px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">Mô tả</label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả (tùy chọn)..."
              className="w-full resize-none rounded-lg border border-gray-700 bg-[#2a2a2a] px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-600 px-4 py-2 text-white transition hover:bg-gray-800 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-white px-4 py-2 text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
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
