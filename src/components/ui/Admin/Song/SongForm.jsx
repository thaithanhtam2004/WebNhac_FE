// src/components/ui/SongForm.jsx
import { X } from "lucide-react";
import { useState, useEffect } from "react";

const SongForm = ({ isEdit = false, song = null, onClose }) => {
  // state dữ liệu form
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    album: "",
    genre: "",
    lyrics: "",
    file: null,
    cover: null,
  });

  // Load dữ liệu khi edit
  useEffect(() => {
    if (isEdit && song) {
      setFormData({
        name: song.name || "",
        artist: song.artist || "",
        album: song.album || "",
        genre: song.genre || "",
        lyrics: song.lyrics || "",
        file: null,
        cover: null,
      });
    }
  }, [isEdit, song]);

  // Cập nhật input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Cập nhật file upload
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      console.log("Cập nhật bài hát:", formData);
    } else {
      console.log("Thêm bài hát:", formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-lg w-[480px] p-6 relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-xl font-bold text-center mb-6">
          {isEdit ? "Chỉnh sửa bài hát" : "Thêm bài hát"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Tên bài hát */}
          <div>
            <label className="block mb-1 text-sm">Tên bài hát</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white"
            />
          </div>

          {/* Ca sĩ */}
          <div>
            <label className="block mb-1 text-sm">Tên ca sĩ</label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white"
            />
          </div>

          {/* Album */}
          <div>
            <label className="block mb-1 text-sm">Album</label>
            <input
              type="text"
              name="album"
              value={formData.album}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white"
            />
          </div>

          {/* Thể loại */}
          <div>
            <label className="block mb-1 text-sm">Thể loại</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white"
            />
          </div>

          {/* Lời bài hát */}
          <div>
            <label className="block mb-1 text-sm">Lời bài hát</label>
            <textarea
              rows="3"
              name="lyrics"
              value={formData.lyrics}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white resize-none"
            ></textarea>
          </div>

          {/* Upload file */}
          <div className="grid grid-cols-2 gap-4">
            {/* File nhạc */}
            <div>
              <label className="block mb-1 text-sm">File nhạc</label>
              <label className="flex items-center justify-center px-3 py-2 bg-white text-black hover:bg-gray-200 rounded-lg cursor-pointer text-sm">
                Chọn file
                <input
                  type="file"
                  name="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
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

export default SongForm;
