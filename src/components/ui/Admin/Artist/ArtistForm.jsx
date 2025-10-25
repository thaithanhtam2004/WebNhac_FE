import { X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../../../configs/apiConfig";

const ArtistForm = ({ isEdit = false, singer = null, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({ name: "", bio: "", image: null });
  const [imageFileName, setImageFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && singer) {
      setFormData({ name: singer.name || "", bio: singer.bio || "", image: null });
      setImageFileName("");
    }
  }, [isEdit, singer]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, image: file });
    setImageFileName(file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return onError?.("Vui lòng nhập tên nghệ sĩ!");

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-lg w-[480px] max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-center mb-6">
          {isEdit ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Tên nghệ sĩ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
              placeholder="Nhập tên nghệ sĩ..."
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Mô tả</label>
            <textarea
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-white focus:outline-none"
              placeholder="Nhập mô tả về nghệ sĩ..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Ảnh đại diện</label>
            <label className="flex items-center justify-center px-3 py-2 bg-white text-black rounded-lg cursor-pointer hover:bg-gray-200 text-sm transition">
              Chọn ảnh
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
            </label>

            {imageFileName && (
              <p className="text-xs text-gray-400 mt-1 truncate" title={imageFileName}>
                📁 {imageFileName}
              </p>
            )}

            {isEdit && singer?.imageUrl && !imageFileName && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                Ảnh hiện tại: <a href={singer.imageUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Xem ảnh</a>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 text-white transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
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