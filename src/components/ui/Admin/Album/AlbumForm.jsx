import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "../../../../configs/apiConfig";
import Select from "react-select";

const AlbumForm = ({ isEdit = false, album = null, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: "",
    singerId: "",
    year: "", // ✅ Chỉ lưu năm
    description: "",
    coverUrl: null,
  });

  const [coverFileName, setCoverFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [singers, setSingers] = useState([]);

  // 🔹 Fetch danh sách ca sĩ
  useEffect(() => {
    const fetchSingers = async () => {
      try {
        const res = await axios.get("/singers");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setSingers(data);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách ca sĩ:", err);
        setSingers([]);
      }
    };
    fetchSingers();
  }, []);

  // 🔹 Load dữ liệu khi edit
  useEffect(() => {
    if (isEdit && album) {
      // ✅ Lấy năm từ releaseDate nếu có
      let year = "";
      if (album.releaseDate) {
        year = new Date(album.releaseDate).getFullYear().toString();
      }

      setFormData({
        name: album.name || "",
        singerId: album.singerId || "",
        year: year,
        description: album.description || "",
        coverUrl: null,
      });
      setCoverFileName("");
    }
  }, [isEdit, album]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, coverUrl: file });
    setCoverFileName(file ? file.name : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) return onError?.("Vui lòng nhập tên album!");
    if (!formData.singerId) return onError?.("Vui lòng chọn ca sĩ!");
    
    // ✅ Validate năm
    if (formData.year) {
      const year = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        return onError?.(`Năm phải từ 1900 đến ${currentYear}!`);
      }
    }

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("singerId", formData.singerId);
    
    // ✅ Gửi năm dưới dạng releaseDate (01/01/năm đó)
    if (formData.year) {
      data.append("releaseDate", `${formData.year}-01-01`);
    }
    
    if (formData.description) data.append("description", formData.description.trim());
    if (formData.coverUrl) data.append("cover", formData.coverUrl);

    try {
      setIsSubmitting(true);
      if (isEdit) {
        await axios.put(`/albums/${album.albumId || album._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess?.("Cập nhật album thành công!");
      } else {
        await axios.post("/albums", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess?.("Thêm album thành công!");
      }
      onClose();
    } catch (err) {
      console.error("❌ Album submit error:", err);
      onError?.(err.response?.data?.message || "Lỗi khi lưu album!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const customSelectStyles = {
    control: (base) => ({ 
      ...base, 
      backgroundColor: "#2a2a2a", 
      borderColor: "#555", 
      color: "white", 
      borderRadius: 8 
    }),
    menu: (base) => ({ 
      ...base, 
      backgroundColor: "#2a2a2a", 
      color: "white", 
      zIndex: 9999 
    }),
    option: (base, state) => ({ 
      ...base, 
      backgroundColor: state.isFocused ? "#3a3a3a" : "#2a2a2a", 
      color: "white",
      cursor: "pointer"
    }),
    singleValue: (base) => ({ ...base, color: "white" }),
    placeholder: (base) => ({ ...base, color: "#aaa" }),
    input: (base) => ({ ...base, color: "white" }),
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-lg w-[480px] max-h-[90vh] overflow-y-auto p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition" 
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-center mb-6">
          {isEdit ? "Chỉnh sửa Album" : "Thêm Album"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên Album */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Tên Album <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên album..."
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Ca sĩ */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Ca sĩ <span className="text-red-500">*</span>
            </label>
            <Select
              options={singers.map(s => ({ 
                value: s.singerId || s._id, 
                label: s.name 
              }))}
              styles={customSelectStyles}
              value={
                singers.find(s => (s.singerId || s._id) === formData.singerId)
                  ? {
                      value: formData.singerId,
                      label: singers.find(s => (s.singerId || s._id) === formData.singerId).name,
                    }
                  : null
              }
              onChange={(opt) => setFormData({ ...formData, singerId: opt ? opt.value : "" })}
              placeholder="Chọn ca sĩ..."
              isClearable
              isDisabled={isSubmitting}
            />
          </div>

          {/* ✅ Năm phát hành - INPUT NUMBER */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Năm phát hành</label>
            <input
              type="number"
              name="year"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.year}
              onChange={handleChange}
              placeholder="Nhập năm phát hành..."
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Mô tả</label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả album..."
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-white focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Ảnh bìa */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Ảnh bìa</label>
            <label className="flex items-center justify-center px-3 py-2 bg-white text-black hover:bg-gray-200 rounded-lg cursor-pointer text-sm transition">
              Chọn ảnh
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
            </label>

            {coverFileName && (
              <p className="text-xs text-gray-400 mt-1 truncate" title={coverFileName}>
                📁 {coverFileName}
              </p>
            )}

            {isEdit && album?.coverUrl && !coverFileName && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                Ảnh hiện tại: <a href={album.coverUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Xem ảnh</a>
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 text-white transition"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlbumForm;