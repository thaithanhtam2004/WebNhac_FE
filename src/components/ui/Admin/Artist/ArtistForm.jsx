// src/components/ui/ArtistForm.jsx
import { X } from "lucide-react";
import { useState, useEffect } from "react";

const ArtistForm = ({ isEdit = false, artist = null, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avatar: null,
  });

  useEffect(() => {
    if (isEdit && artist) {
      setFormData({
        name: artist.name || "",
        description: artist.description || "",
        avatar: null,
      });
    }
  }, [isEdit, artist]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, avatar: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isEdit ? "Cập nhật ca sĩ:" : "Thêm ca sĩ:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-lg w-[420px] p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-center mb-6">
          {isEdit ? "Chỉnh sửa ca sĩ" : "Thêm ca sĩ"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Tên ca sĩ */}
          <div>
            <label className="block mb-1 text-sm">Tên ca sĩ</label>
            <input
              type="text"
              name="name"
              value={formData.name}
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

          {/* Ảnh đại diện */}
          <div>
            <label className="block mb-1 text-sm">Ảnh đại diện</label>
            <label className="flex items-center justify-center px-3 py-2 bg-white text-black hover:bg-gray-200 rounded-lg cursor-pointer text-sm">
              Chọn ảnh
              <input
                type="file"
                name="avatar"
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

export default ArtistForm;
