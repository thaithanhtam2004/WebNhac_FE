import { X, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../../../configs/apiConfig";

const GenreForm = ({ isEdit = false, genre = null, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // ====== CONSTANTS ======
  const MAX_NAME_LENGTH = 50;
  const MAX_DESCRIPTION_LENGTH = 500;

  // ====== UTILITY ======
  const sanitizeInput = (str) => {
    if (!str) return '';
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  };

  // ====== VALIDATION ======
  const validateName = (name) => {
    if (!name || !name.trim()) return "Tên thể loại không được để trống";
    if (name.length > MAX_NAME_LENGTH) return `Tên thể loại quá dài (Max ${MAX_NAME_LENGTH})`;
    // Regex cho phép chữ cái, số, khoảng trắng và các ký tự đặc biệt phổ biến trong tên thể loại (R&B, Pop/Rock, Lo-fi)
    if (!/^[\p{L}\p{N}\s\-_.,()&/]+$/u.test(name)) return "Tên thể loại chứa ký tự không hợp lệ";
    return null;
  };

  const validateDescription = (description) => {
    if (!description) return null;
    if (description.length > MAX_DESCRIPTION_LENGTH) return `Mô tả quá dài (Max ${MAX_DESCRIPTION_LENGTH})`;
    return null;
  };

  // ====== EFFECT ======
  useEffect(() => {
    if (isEdit && genre) {
      setFormData({
        name: genre.name || "",
        description: genre.description || "",
      });
      setValidationErrors({});
    } else {
      setFormData({ name: "", description: "" });
      setValidationErrors({});
    }
  }, [isEdit, genre]);

  // ====== HANDLERS ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (validationErrors[name]) setValidationErrors({ ...validationErrors, [name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Frontend
    const errors = {};
    const nameErr = validateName(formData.name);
    if (nameErr) errors.name = nameErr;
    const descErr = validateDescription(formData.description);
    if (descErr) errors.description = descErr;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        name: sanitizeInput(formData.name),
        description: sanitizeInput(formData.description) || null,
      };

      if (isEdit) {
        await axios.put(`/genres/${genre.genreId || genre._id}`, data);
        onSuccess?.("Cập nhật thể loại thành công!");
      } else {
        await axios.post("/genres", data);
        onSuccess?.("Thêm thể loại thành công!");
      }

      onClose();
    } catch (err) {
      console.error("❌ Lỗi lưu thể loại:", err);
      // Lấy message lỗi chi tiết từ backend (VD: Thể loại đã tồn tại)
      const errorMsg = err.response?.data?.message || "Lỗi khi lưu dữ liệu!";
      onError?.(errorMsg);

      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
        <AlertCircle size={12} />
        <span>{error}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#1a1a1a] p-6 text-white shadow-lg">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 transition hover:text-white disabled:opacity-50 z-10"
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
              maxLength={MAX_NAME_LENGTH}
              placeholder="Nhập tên thể loại (VD: Pop, R&B)..."
              disabled={isSubmitting}
              className={`w-full rounded-lg border ${
                validationErrors.name ? 'border-red-500' : 'border-gray-700'
              } bg-[#2a2a2a] px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none`}
            />
            <div className="flex justify-between items-start">
              <ErrorMessage error={validationErrors.name} />
              <span className="text-xs text-gray-500 mt-1">
                {formData.name.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Mô tả
            </label>
            <textarea
              rows="5"
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="Nhập mô tả (tùy chọn)..."
              disabled={isSubmitting}
              className={`w-full resize-none rounded-lg border ${
                validationErrors.description ? 'border-red-500' : 'border-gray-700'
              } bg-[#2a2a2a] px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none`}
            />
            <div className="flex justify-between items-start">
              <ErrorMessage error={validationErrors.description} />
              <span className={`text-xs mt-1 ${
                formData.description?.length > MAX_DESCRIPTION_LENGTH ? 'text-red-400' : 'text-gray-500'
              }`}>
                {formData.description?.length || 0}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
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