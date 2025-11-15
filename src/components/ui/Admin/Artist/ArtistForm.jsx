import { X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../../../configs/apiConfig";

const ArtistForm = ({ isEdit = false, singer = null, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    image: null,
  });

  const [imageFileName, setImageFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load dữ liệu khi chỉnh sửa
  useEffect(() => {
    if (isEdit && singer) {
      setFormData({
        name: singer.name || "",
        bio: singer.bio || "",
        image: null,
      });
      setImageFileName("");
    }
  }, [isEdit, singer]);

  // Xử lý thay đổi input
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Xử lý chọn file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, image: file });
    setImageFileName(file.name);
  };

  // Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return onError?.("Vui lòng nhập tên nghệ sĩ!");
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      if (formData.bio?.trim()) data.append("bio", formData.bio.trim());
      if (formData.image) data.append("image", formData.image);

      if (isEdit) {
        await axios.put(`/singers/${singer.singerId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess?.("Cập nhật nghệ sĩ thành công!");
      } else {
        await axios.post("/singers", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess?.("Thêm nghệ sĩ thành công!");
      }

      onClose();
    } catch (err) {
      console.error("❌ Submit error:", err);
      onError?.(err.response?.data?.message || "Lỗi khi lưu nghệ sĩ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a1a] p-6 text-white shadow-lg">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-3 top-3 text-gray-400 transition hover:text-white disabled:opacity-50"
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
              placeholder="Nhập tên nghệ sĩ..."
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-700 bg-[#2a2a2a] px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">Mô tả</label>
            <textarea
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Nhập mô tả về nghệ sĩ..."
              disabled={isSubmitting}
              className="w-full resize-none rounded-lg border border-gray-700 bg-[#2a2a2a] px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Ảnh đại diện */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Ảnh đại diện
            </label>
            <label className="flex cursor-pointer items-center justify-center rounded-lg bg-white px-3 py-2 text-sm text-black transition hover:bg-gray-200">
              Chọn ảnh
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
            </label>

            {/* Tên file ảnh mới */}
            {imageFileName && (
              <p
                className="mt-1 truncate text-xs text-gray-400"
                title={imageFileName}
              >
                📁 {imageFileName}
              </p>
            )}

            {/* Ảnh hiện tại */}
            {isEdit && singer?.imageUrl && !imageFileName && (
              <p className="mt-1 truncate text-xs text-gray-400">
                Ảnh hiện tại:{" "}
                <a
                  href={singer.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Xem ảnh
                </a>
              </p>
            )}
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