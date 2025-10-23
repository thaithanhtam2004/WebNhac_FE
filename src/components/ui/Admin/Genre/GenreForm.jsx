// src/components/ui/Admin/Genre/GenreForm.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const GenreForm = ({ isEdit = false, genre = null, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (isEdit && genre) {
      setFormData({
        name: genre.name || "",
        description: genre.description || "",
      });
    }
  }, [isEdit, genre]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isEdit ? "Cập nhật thể loại:" : "Thêm thể loại:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-lg w-[450px] p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-center mb-6">
          {isEdit ? "Chỉnh sửa thể loại" : "Thêm thể loại"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Tên thể loại */}
          <div>
            <label className="block mb-1 text-sm">Tên thể loại</label>
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

export default GenreForm;
