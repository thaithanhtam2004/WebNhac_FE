import { X, Loader2, Music } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "../../config/api";

const GenreForm = ({
  isEdit = false,
  genre = null,
  onClose,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const textareaRef = useRef(null);

  // ====== CONSTANTS ======
  const MAX_NAME_LENGTH = 100;
  const MAX_DESC_LENGTH = 1000;

  // ====== UTILITY FUNCTIONS ======
  const sanitizeInput = (str) => {
    if (!str) return "";
    return str
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .trim();
  };

  const validateName = (name) => {
    if (!name || !name.trim()) return "Tên thể loại không được để trống";
    if (name.length > MAX_NAME_LENGTH)
      return `Tên thể loại không được vượt quá ${MAX_NAME_LENGTH} ký tự`;
    const dangerousChars = ["<", ">", "{", "}", "\\"];
    for (let char of dangerousChars) {
      if (name.includes(char))
        return `Tên thể loại không được chứa ký tự đặc biệt: ${char}`;
    }
    return null;
  };

  const validateDescription = (desc) => {
    if (!desc) return null;
    if (desc.length > MAX_DESC_LENGTH)
      return `Mô tả không được vượt quá ${MAX_DESC_LENGTH} ký tự`;
    return null;
  };

  // ====== EFFECTS ======
  useEffect(() => {
    if (isEdit && genre) {
      setFormData({
        name: genre.name || "",
        description: genre.description || "",
      });
    }
  }, [isEdit, genre]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  }, [formData.description]);

  // ====== HANDLERS ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;

    const descError = validateDescription(formData.description);
    if (descError) errors.description = descError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      onError("Vui lòng kiểm tra lại các trường thông tin không hợp lệ");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: sanitizeInput(formData.name),
      description: sanitizeInput(formData.description)
    };

    try {
      if (isEdit) {
        await axios.put(`/genres/${genre.genreId}`, payload);
        onSuccess("Cập nhật thể loại thành công!");
      } else {
        await axios.post("/genres", payload);
        onSuccess("Thêm thể loại mới thành công!");
      }
      onClose();
    } catch (err) {
      console.error("Lỗi lưu thể loại:", err);
      onError(err.response?.data?.message || err.response?.data?.error || "Đã xảy ra lỗi khi lưu thể loại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <span className="text-red-500 text-xs mt-1 block font-semibold">
        {error}
      </span>
    );
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] p-4">
      <div className="bg-white text-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? "Chỉnh sửa thể loại" : "Thêm thể loại mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tên thể loại */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                Tên thể loại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Pop, Rock, R&B..."
                className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
                  validationErrors.name ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isSubmitting}
                maxLength={MAX_NAME_LENGTH}
              />
              <div className="flex justify-between items-center mt-1.5">
                {validationErrors.name ? (
                  <ErrorMessage error={validationErrors.name} />
                ) : (
                  <p className="text-gray-400 text-xs font-medium">Tên hiển thị của thể loại</p>
                )}
                <span className={`text-xs font-bold ${formData.name.length >= MAX_NAME_LENGTH ? "text-red-500" : "text-gray-400"}`}>
                  {formData.name.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                Mô tả thể loại
              </label>
              <textarea
                ref={textareaRef}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập thông tin mô tả về thể loại này..."
                className={`w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all focus:outline-none min-h-[120px] max-h-[300px] resize-y focus:ring-1 focus:ring-black focus:border-black ${
                  validationErrors.description ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isSubmitting}
                maxLength={MAX_DESC_LENGTH}
              />
              <div className="flex justify-between items-center mt-1.5">
                {validationErrors.description ? (
                  <ErrorMessage error={validationErrors.description} />
                ) : (
                  <p className="text-gray-400 text-xs font-medium">Có thể để trống</p>
                )}
                <span className={`text-xs font-bold ${formData.description.length >= MAX_DESC_LENGTH ? "text-red-500" : "text-gray-400"}`}>
                  {formData.description.length}/{MAX_DESC_LENGTH}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center min-w-[140px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : isEdit ? (
                  "Lưu thay đổi"
                ) : (
                  "Thêm thể loại"
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GenreForm;
