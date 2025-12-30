import { X, AlertCircle, ImagePlus } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../../../configs/apiConfig";

const ArtistForm = ({ isEdit = false, singer = null, onClose, onSuccess, onError }) => {
  // State giữ nguyên như cũ
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    image: null,
  });

  const [imageFileName, setImageFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null); // Thêm preview nhẹ để UX tốt hơn (không ảnh hưởng layout)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Constants
  const MAX_NAME_LENGTH = 100;
  const MAX_BIO_LENGTH = 2000;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  // Load data khi edit
  useEffect(() => {
    if (isEdit && singer) {
      setFormData({
        name: singer.name || "",
        bio: singer.bio || "",
        image: null,
      });
      setImageFileName("");
      setImagePreview(null);
      setValidationErrors({});
    }
  }, [isEdit, singer]);

  // Handle change input text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: null });
    }
  };

  // Handle change file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size
    if (file.size > MAX_IMAGE_SIZE) {
      onError?.("Dung lượng ảnh không được vượt quá 5MB");
      e.target.value = "";
      return;
    }

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError?.("Chỉ chấp nhận file ảnh (JPG, PNG, GIF...)");
      e.target.value = "";
      return;
    }

    setFormData({ ...formData, image: file });
    setImageFileName(file.name);
    setValidationErrors({ ...validationErrors, image: null });

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setFormData({ ...formData, image: null });
    setImageFileName("");
    setImagePreview(null);
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.name.trim()) {
        setValidationErrors({...validationErrors, name: "Tên không được để trống"});
        return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      if (formData.bio) data.append("bio", formData.bio.trim());
      if (formData.image) data.append("image", formData.image);

      if (isEdit) {
        // Update
        await axios.put(`/singers/${singer.singerId || singer._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess?.("Cập nhật nghệ sĩ thành công!");
      } else {
        // Create
        await axios.post("/singers", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess?.("Thêm nghệ sĩ thành công!");
      }
      onClose();
    } catch (err) {
      console.error("❌ Submit error:", err);
      // Lấy message lỗi từ Backend trả về
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

  // --- GIAO DIỆN CŨ CỦA BẠN ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a1a] p-6 text-white shadow-lg">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-3 top-3 text-gray-400 transition hover:text-white disabled:opacity-50 z-10"
        >
          <X size={20} />
        </button>

        {/* Tiêu đề */}
        <h2 className="mb-6 text-center text-xl font-bold">
          {isEdit ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên nghệ sĩ */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Tên nghệ sĩ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={MAX_NAME_LENGTH}
              placeholder="Nhập tên nghệ sĩ..."
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
              Mô tả / Tiểu sử
            </label>
            <textarea
              name="bio"
              rows="5"
              value={formData.bio}
              onChange={handleChange}
              maxLength={MAX_BIO_LENGTH}
              placeholder="Nhập mô tả về nghệ sĩ..."
              disabled={isSubmitting}
              className="w-full resize-none rounded-lg border border-gray-700 bg-[#2a2a2a] px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
            />
             <div className="text-right text-xs text-gray-500 mt-1">
                {formData.bio?.length || 0}/{MAX_BIO_LENGTH}
             </div>
          </div>

          {/* Ảnh đại diện */}
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Ảnh đại diện
            </label>

            {/* Preview ảnh (Giữ layout cũ nhưng thêm ảnh hiện ra cho dễ nhìn) */}
            {(imagePreview || (isEdit && singer?.imageUrl)) && (
              <div className="mb-3 flex justify-center">
                <div className="relative">
                  <img
                    src={imagePreview || singer?.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-full border-4 border-gray-700"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={clearImage}
                      disabled={isSubmitting}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition"
                      title="Xóa ảnh"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Upload button cũ */}
            <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              validationErrors.image 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-white hover:bg-gray-200 text-black'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <ImagePlus size={18} />
              {imageFileName ? 'Đổi ảnh khác' : 'Chọn ảnh'}
              <input
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
            </label>

            {/* File info */}
            {imageFileName && (
              <p className="mt-1 truncate text-xs text-green-400">
                ✓ {imageFileName}
              </p>
            )}

            {/* Link ảnh hiện tại khi edit */}
            {isEdit && singer?.imageUrl && !imageFileName && !imagePreview && (
              <p className="mt-1 truncate text-xs text-gray-400">
                Ảnh hiện tại: <span className="text-blue-400">Đang hiển thị</span>
              </p>
            )}

            <ErrorMessage error={validationErrors.image} />
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-600 px-4 py-2 text-white transition hover:bg-gray-800 disabled:opacity-50"
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

export default ArtistForm;