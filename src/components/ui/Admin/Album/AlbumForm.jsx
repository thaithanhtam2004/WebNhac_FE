// src/components/ui/Admin/Album/AlbumForm.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const AlbumForm = ({ isEdit = false, album = null, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    year: "",
    description: "",
    cover: null,
  });

  useEffect(() => {
    if (isEdit && album) {
      setFormData({
        name: album.name || "",
        artist: album.artist || "",
        year: album.year || "",
        description: album.description || "",
        cover: null,
      });
    }
  }, [isEdit, album]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, cover: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isEdit ? "Cập nhật album:" : "Thêm album:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-lg w-[480px] p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-center mb-6">
          {isEdit ? "Chỉnh sửa Album" : "Thêm Album"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Tên Album */}
          <div>
            <label className="block mb-1 text-sm">Tên Album</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white"
            />
          </div>

          {/* Nghệ sĩ */}
          <div>
            <label className="block mb-1 text-sm">Nghệ sĩ</label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white"
            />
          </div>

          {/* Năm phát hành */}
          <div>
            <label className="block mb-1 text-sm">Năm phát hành</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block mb-1 text-sm">Mô tả</label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white resize-none"
            ></textarea>
          </div>

          {/* Ảnh bìa */}
          <div>
            <label className="block mb-1 text-sm">Ảnh bìa</label>
            <label className="flex items-center justify-center px-3 py-2 bg-white text-black hover:bg-gray-200 rounded-lg cursor-pointer text-sm">
              Chọn ảnh
              <input
                type="file"
                name="cover"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200"
            >
              {isEdit ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlbumForm;
