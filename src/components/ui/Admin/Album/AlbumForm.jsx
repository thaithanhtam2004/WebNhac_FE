import { useState, useEffect } from "react";
import { X, AlertCircle, ImagePlus } from "lucide-react";
import axios from "../../../../configs/apiConfig";
import Select from "react-select";

const AlbumForm = ({ isEdit = false, album = null, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: "",
    singerId: "",
    year: "",
    description: "",
    coverUrl: null,
  });

  const [coverFileName, setCoverFileName] = useState("");
  const [coverPreview, setCoverPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [singers, setSingers] = useState([]);

  // ====== CONSTANTS ======
  const MAX_NAME_LENGTH = 100;
  const MAX_DESCRIPTION_LENGTH = 1000;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MIN_YEAR = 1900;
  const MAX_YEAR = new Date().getFullYear() + 1;

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  // ====== FETCH DATA ======
  useEffect(() => {
    const fetchSingers = async () => {
      try {
        const res = await axios.get("/singers");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setSingers(data);
      } catch (err) {
        console.error("❌ Lỗi tải ca sĩ:", err);
        onError?.("Không thể tải danh sách ca sĩ");
      }
    };
    fetchSingers();
  }, []);

  // ====== LOAD DATA ======
  useEffect(() => {
    if (isEdit && album) {
      let year = "";
      if (album.releaseDate) {
        year = new Date(album.releaseDate).getFullYear().toString();
      }
      setFormData({
        name: album.name || "",
        singerId: album.singerId?._id || album.singerId || "",
        year,
        description: album.description || "",
        coverUrl: null,
      });
      setCoverFileName("");
      setCoverPreview(null);
      setValidationErrors({});
    }
  }, [isEdit, album]);

  // ====== HANDLERS ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) setValidationErrors({ ...validationErrors, [name]: null });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      onError?.("Ảnh quá lớn (Max 5MB)");
      e.target.value = "";
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError?.("Định dạng ảnh không hỗ trợ");
      e.target.value = "";
      return;
    }

    setFormData({ ...formData, coverUrl: file });
    setCoverFileName(file.name);
    
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setFormData({ ...formData, coverUrl: null });
    setCoverFileName("");
    setCoverPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    const errors = {};
    if (!formData.name.trim()) errors.name = "Tên album không được để trống";
    if (!formData.singerId) errors.singerId = "Vui lòng chọn ca sĩ";
    
    if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("singerId", formData.singerId);
      if (formData.year) data.append("releaseDate", `${formData.year}-01-01`);
      if (formData.description) data.append("description", formData.description.trim());
      if (formData.coverUrl) data.append("cover", formData.coverUrl);

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
      console.error("❌ Submit error:", err);
      const errorMsg = err.response?.data?.message || "Lỗi khi lưu dữ liệu!";
      onError?.(errorMsg);
      if (err.response?.data?.errors) setValidationErrors(err.response.data.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <div className="flex items-center gap-1 mt-1 text-xs text-red-400"><AlertCircle size={12}/><span>{error}</span></div>;
  };

  // Custom style cho Select để khớp với theme cũ
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#2a2a2a",
      borderColor: state.isFocused ? (validationErrors.singerId ? "#ef4444" : "#fff") : "#555",
      color: "white",
      borderRadius: 8,
    }),
    menu: (base) => ({ ...base, backgroundColor: "#2a2a2a", zIndex: 9999 }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#3a3a3a" : "#2a2a2a",
      color: "white",
      cursor: "pointer",
    }),
    singleValue: (base) => ({ ...base, color: "white" }),
    input: (base) => ({ ...base, color: "white" }),
  };

  // Custom label hiển thị ảnh trong dropdown
  const formatOptionLabel = ({ label, image }) => (
    <div className="flex items-center gap-2">
      <img src={image || "https://via.placeholder.com/30"} alt="" className="w-6 h-6 rounded-full object-cover"/>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a1a] p-6 text-white shadow-lg">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-3 top-3 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Tiêu đề */}
        <h2 className="mb-6 text-center text-xl font-bold">
          {isEdit ? "Sửa Album" : "Thêm Album"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên Album */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">Tên Album <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên album..."
              disabled={isSubmitting}
              className={`w-full rounded-lg border ${validationErrors.name ? 'border-red-500' : 'border-gray-700'} bg-[#2a2a2a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white`}
            />
            <ErrorMessage error={validationErrors.name} />
          </div>

          {/* Nghệ sĩ */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">Nghệ sĩ <span className="text-red-500">*</span></label>
            <Select
              options={singers.map((s) => ({ value: s.singerId || s._id, label: s.name, image: s.imageUrl }))}
              styles={customSelectStyles}
              formatOptionLabel={formatOptionLabel}
              value={singers.map(s => ({value: s.singerId||s._id, label: s.name, image: s.imageUrl})).find(op => op.value === formData.singerId)}
              onChange={(opt) => {
                setFormData({ ...formData, singerId: opt ? opt.value : "" });
                setValidationErrors({ ...validationErrors, singerId: null });
              }}
              placeholder="Chọn nghệ sĩ..."
              isDisabled={isSubmitting}
            />
            <ErrorMessage error={validationErrors.singerId} />
          </div>

          {/* Năm phát hành */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">Năm phát hành</label>
            <input
              type="number"
              name="year"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={formData.year}
              onChange={handleChange}
              placeholder={`VD: ${new Date().getFullYear()}`}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-700 bg-[#2a2a2a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">Mô tả</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả..."
              disabled={isSubmitting}
              className="w-full resize-none rounded-lg border border-gray-700 bg-[#2a2a2a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Ảnh bìa */}
          <div>
            <label className="mb-2 block text-sm text-gray-300">Ảnh bìa</label>
            
            {(coverPreview || (isEdit && album?.coverUrl)) && (
              <div className="mb-3 flex justify-center">
                <div className="relative">
                  <img src={coverPreview || album?.coverUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-600"/>
                  {coverPreview && (
                    <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full text-white hover:bg-red-600 transition">
                      <X size={14}/>
                    </button>
                  )}
                </div>
              </div>
            )}

            <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                validationErrors.coverUrl ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white hover:bg-gray-200 text-black'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <ImagePlus size={18} />
              {coverFileName || "Chọn ảnh"}
              <input type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" onChange={handleFileChange} disabled={isSubmitting} />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-600 px-4 py-2 text-white hover:bg-gray-800"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2 text-black hover:bg-gray-200 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : isEdit ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlbumForm;