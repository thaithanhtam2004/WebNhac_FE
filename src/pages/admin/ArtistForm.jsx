import { X, Loader2, User, Upload, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "../../config/api";

const ArtistForm = ({
  isEdit = false,
  singer = null,
  onClose,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    image: null,
  });

  const [imageFileName, setImageFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const textareaRef = useRef(null);

  // ====== CONSTANTS ======
  const MAX_COVER_SIZE = 5 * 1024 * 1024;
  const MAX_NAME_LENGTH = 100;
  const MAX_BIO_LENGTH = 10000;

  const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateName = (name) => {
    if (!name || !name.trim()) return "Tên nghệ sĩ không được để trống";
    if (name.length > MAX_NAME_LENGTH)
      return `Tên nghệ sĩ không được vượt quá ${MAX_NAME_LENGTH} ký tự`;
    const dangerousChars = ["<", ">", "{", "}", "\\"];
    for (let char of dangerousChars) {
      if (name.includes(char))
        return `Tên nghệ sĩ không được chứa ký tự đặc biệt: ${char}`;
    }
    return null;
  };

  const validateImageFile = (file) => {
    if (!file) return null;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
      return "Chỉ chấp nhận ảnh: JPG, PNG, WEBP, GIF";
    if (file.size > MAX_COVER_SIZE)
      return `Dung lượng ảnh không được vượt quá ${formatFileSize(MAX_COVER_SIZE)}`;
    return null;
  };

  const validateBio = (bio) => {
    if (!bio) return null;
    if (bio.length > MAX_BIO_LENGTH)
      return `Tiểu sử không được vượt quá ${MAX_BIO_LENGTH} ký tự`;
    return null;
  };

  // ====== EFFECTS ======
  useEffect(() => {
    if (isEdit && singer) {
      setFormData({
        name: singer.name || "",
        bio: singer.bio || "",
        image: null,
      });
      if (singer.imageUrl) {
        setImageFileName("Đã có ảnh hiện tại (tải lên để thay đổi)");
      }
    }
  }, [isEdit, singer]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  }, [formData.bio]);

  // ====== HANDLERS ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImageFile(file);

    if (error) {
      setValidationErrors((prev) => ({ ...prev, [type]: error }));
      e.target.value = null; // reset input
      return;
    }

    setValidationErrors((prev) => ({ ...prev, [type]: null }));
    setFormData((prev) => ({ ...prev, [type]: file }));
    setImageFileName(`${file.name} (${formatFileSize(file.size)})`);
  };

  const validateForm = () => {
    const errors = {};
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;

    const bioError = validateBio(formData.bio);
    if (bioError) errors.bio = bioError;

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
    const data = new FormData();

    data.append("name", sanitizeInput(formData.name));
    if (formData.bio) {
      data.append("bio", sanitizeInput(formData.bio));
    }
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (isEdit) {
        await axios.put(`/singers/${singer.singerId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess("Cập nhật nghệ sĩ thành công!");
      } else {
        await axios.post("/singers", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess("Thêm nghệ sĩ mới thành công!");
      }
      onClose();
    } catch (err) {
      console.error("Lỗi lưu nghệ sĩ:", err);
      onError(err.response?.data?.message || err.response?.data?.error || "Đã xảy ra lỗi khi lưu nghệ sĩ.");
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
            {isEdit ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}
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
            
            {/* Tên nghệ sĩ */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                Tên nghệ sĩ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Sơn Tùng M-TP"
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
                  <p className="text-gray-400 text-xs font-medium">Tên hiển thị chính thức của nghệ sĩ</p>
                )}
                <span className={`text-xs font-bold ${formData.name.length >= MAX_NAME_LENGTH ? "text-red-500" : "text-gray-400"}`}>
                  {formData.name.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
            </div>

            {/* Tiểu sử */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                Tiểu sử nghệ sĩ
              </label>
              <textarea
                ref={textareaRef}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Nhập thông tin tiểu sử chi tiết..."
                className={`w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all focus:outline-none min-h-[120px] max-h-[300px] resize-y focus:ring-1 focus:ring-black focus:border-black ${
                  validationErrors.bio ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isSubmitting}
                maxLength={MAX_BIO_LENGTH}
              />
              <div className="flex justify-between items-center mt-1.5">
                {validationErrors.bio ? (
                  <ErrorMessage error={validationErrors.bio} />
                ) : (
                  <p className="text-gray-400 text-xs font-medium">Có thể để trống</p>
                )}
                <span className={`text-xs font-bold ${formData.bio.length >= MAX_BIO_LENGTH ? "text-red-500" : "text-gray-400"}`}>
                  {formData.bio.length}/{MAX_BIO_LENGTH}
                </span>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-400" /> Hình ảnh đại diện
              </h3>
              
              <div className="relative group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => handleFileChange(e, "image")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isSubmitting}
                />
                <div className={`w-full border border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${
                  validationErrors.image ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 group-hover:bg-gray-100 group-hover:border-black"
                }`}>
                  <Upload className={`w-8 h-8 mb-3 ${validationErrors.image ? "text-red-400" : "text-gray-400 group-hover:text-black transition-colors"}`} />
                  <p className="text-sm font-semibold text-gray-950 text-center mb-1">
                    {imageFileName || "Kéo thả hoặc click để chọn ảnh đại diện"}
                  </p>
                  <p className="text-xs font-medium text-gray-400 text-center">
                    Hỗ trợ: JPG, PNG, WEBP (Tối đa 5MB)
                  </p>
                  {isEdit && singer?.imageUrl && !imageFileName.includes(singer.imageUrl) && (
                     <div className="mt-4 flex items-center justify-center">
                       <img src={singer.imageUrl} alt="Current" className="w-16 h-16 object-cover rounded-lg shadow-sm border border-gray-200" />
                     </div>
                  )}
                </div>
              </div>
              {validationErrors.image && (
                <ErrorMessage error={validationErrors.image} />
              )}
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
                  "Thêm nghệ sĩ"
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

export default ArtistForm;
