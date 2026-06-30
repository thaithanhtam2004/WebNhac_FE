import { X, Loader2, Music, Upload, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import axios from "../../config/api";

const AlbumForm = ({
  isEdit = false,
  album = null,
  onClose,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    singerId: "",
    description: "",
    releaseDate: "",
    cover: null,
  });

  const [coverFileName, setCoverFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [artists, setArtists] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const textareaRef = useRef(null);

  // ====== CONSTANTS ======
  const MAX_COVER_SIZE = 5 * 1024 * 1024;
  const MAX_NAME_LENGTH = 100;
  const MAX_DESC_LENGTH = 1000;

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
  
  const formatDateToDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const dateOnly = String(dateString).substring(0, 10);
      const [year, month, day] = dateOnly.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return "";
    }
  };

  const formatDateToISO = (dateString) => {
    if (!dateString) return "";
    try {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } catch {
      return "";
    }
  };

  const validateName = (name) => {
    if (!name || !name.trim()) return "Tên album không được để trống";
    if (name.length > MAX_NAME_LENGTH)
      return `Tên album không được vượt quá ${MAX_NAME_LENGTH} ký tự`;
    const dangerousChars = ["<", ">", "{", "}", "\\"];
    for (let char of dangerousChars) {
      if (name.includes(char))
        return `Tên album không được chứa ký tự đặc biệt: ${char}`;
    }
    return null;
  };

  const validateReleaseDate = (dateString) => {
    if (!dateString) return null;
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(datePattern);
    if (!match) return "Định dạng ngày không hợp lệ (dd/MM/yyyy)";

    const [, day, month, year] = match;
    const selectedDate = new Date(year, month - 1, day);

    if (
      selectedDate.getDate() !== parseInt(day) ||
      selectedDate.getMonth() !== parseInt(month) - 1 ||
      selectedDate.getFullYear() !== parseInt(year)
    ) {
      return "Ngày không tồn tại trong lịch";
    }
    if (selectedDate.getFullYear() < 1900)
      return "Năm phát hành phải từ 1900 trở đi";
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

  const validateDescription = (desc) => {
    if (!desc) return null;
    if (desc.length > MAX_DESC_LENGTH)
      return `Mô tả không được vượt quá ${MAX_DESC_LENGTH} ký tự`;
    return null;
  };

  // ====== EFFECTS ======
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resArtists = await axios.get("/singers");
        const artistOptions = (resArtists.data?.data || []).map((s) => ({
          value: s.singerId,
          label: s.name,
        }));
        setArtists(artistOptions);
      } catch (err) {
        console.error("Lỗi tải dữ liệu ca sĩ:", err);
        onError("Lỗi tải dữ liệu cơ sở");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [onError]);

  useEffect(() => {
    if (isEdit && album) {
      setFormData({
        name: album.name || "",
        singerId: album.singerId || "",
        description: album.description || "",
        releaseDate: formatDateToDisplay(album.releaseDate) || "",
        cover: null,
      });
      if (album.coverUrl) {
        setCoverFileName("Đã có ảnh bìa hiện tại (tải lên để thay đổi)");
      }
    }
  }, [isEdit, album]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  }, [formData.description]);

  // ====== HANDLERS ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-format date typing (dd/MM/yyyy)
    if (name === "releaseDate") {
      let v = value.replace(/\D/g, "");
      if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
      if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);
      setFormData((prev) => ({ ...prev, [name]: v }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption ? selectedOption.value : "" }));
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
    setCoverFileName(`${file.name} (${formatFileSize(file.size)})`);
  };

  const validateForm = () => {
    const errors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
    
    if (!formData.singerId) errors.singerId = "Vui lòng chọn nghệ sĩ";

    const descError = validateDescription(formData.description);
    if (descError) errors.description = descError;
    
    if (formData.releaseDate) {
       const releaseDateError = validateReleaseDate(formData.releaseDate);
       if (releaseDateError) errors.releaseDate = releaseDateError;
    }

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
    data.append("singerId", formData.singerId);
    
    if (formData.description) {
      data.append("description", sanitizeInput(formData.description));
    }
    if (formData.releaseDate) {
      data.append("releaseDate", formatDateToISO(formData.releaseDate));
    }
    if (formData.cover) {
      data.append("cover", formData.cover);
    }

    try {
      if (isEdit) {
        await axios.put(`/albums/${album.albumId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess("Cập nhật album thành công!");
      } else {
        await axios.post("/albums", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess("Thêm album mới thành công!");
      }
      onClose();
    } catch (err) {
      console.error("Lỗi lưu album:", err);
      onError(err.response?.data?.message || err.response?.data?.error || "Đã xảy ra lỗi khi lưu album.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select styles matching SongForm
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      padding: "2px 8px",
      borderRadius: "0.75rem",
      borderWidth: "1px",
      borderColor: validationErrors.singerId
        ? "#ef4444"
        : state.isFocused
        ? "#000"
        : "#e5e7eb",
      boxShadow: "none",
      backgroundColor: validationErrors.singerId ? "#fef2f2" : "#fff",
      "&:hover": { borderColor: state.isFocused ? "#000" : "#d1d5db" },
      fontSize: "0.875rem",
      fontWeight: "500",
      transition: "all 0.2s",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      fontWeight: "500",
      backgroundColor: state.isSelected ? "#000" : state.isFocused ? "#f3f4f6" : "transparent",
      color: state.isSelected ? "#fff" : "#111827",
      cursor: "pointer",
      padding: "10px 16px",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      fontWeight: "500",
    }),
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <span className="text-red-500 text-xs mt-1 block font-semibold">
        {error}
      </span>
    );
  };

  if (isLoadingData) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] p-4">
      <div className="bg-white text-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? "Chỉnh sửa album" : "Thêm album mới"}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên album */}
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                  Tên album <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Lạc Trôi"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
                    validationErrors.name ? "border-red-500" : "border-gray-200"
                  }`}
                  disabled={isSubmitting}
                  maxLength={MAX_NAME_LENGTH}
                />
                {validationErrors.name && (
                  <ErrorMessage error={validationErrors.name} />
                )}
              </div>
              
              {/* Ngày phát hành */}
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                  Ngày phát hành
                </label>
                <input
                  type="text"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleChange}
                  placeholder="dd/MM/yyyy"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
                    validationErrors.releaseDate ? "border-red-500" : "border-gray-200"
                  }`}
                  disabled={isSubmitting}
                />
                {validationErrors.releaseDate && (
                  <ErrorMessage error={validationErrors.releaseDate} />
                )}
              </div>
            </div>

            {/* Nghệ sĩ */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                Nghệ sĩ <span className="text-red-500">*</span>
              </label>
              <Select
                options={artists}
                value={artists.find((o) => o.value === formData.singerId) || null}
                onChange={(val) => handleSelectChange("singerId", val)}
                placeholder="-- Chọn nghệ sĩ --"
                styles={selectStyles}
                isDisabled={isSubmitting}
                isClearable
                noOptionsMessage={() => "Không tìm thấy nghệ sĩ"}
              />
              {validationErrors.singerId && (
                <ErrorMessage error={validationErrors.singerId} />
              )}
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                Mô tả album
              </label>
              <textarea
                ref={textareaRef}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập thông tin mô tả chi tiết..."
                className={`w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all focus:outline-none min-h-[120px] max-h-[300px] resize-y focus:ring-1 focus:ring-black focus:border-black ${
                  validationErrors.description ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isSubmitting}
                maxLength={MAX_DESC_LENGTH}
              />
              <div className="flex justify-between items-center mt-1.5">
                {validationErrors.description ? (
                  <ErrorMessage error={validationErrors.description} />
                ) : (
                  <p className="text-gray-400 text-xs font-medium">Có thể để trống</p>
                )}
                <span className={`text-xs font-bold ${formData.description.length >= MAX_DESC_LENGTH ? "text-red-500" : "text-gray-400"}`}>
                  {formData.description.length}/{MAX_DESC_LENGTH}
                </span>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-400" /> Hình ảnh bìa (Cover)
              </h3>
              
              <div className="relative group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => handleFileChange(e, "cover")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isSubmitting}
                />
                <div className={`w-full border border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${
                  validationErrors.cover ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 group-hover:bg-gray-100 group-hover:border-black"
                }`}>
                  <Upload className={`w-8 h-8 mb-3 ${validationErrors.cover ? "text-red-400" : "text-gray-400 group-hover:text-black transition-colors"}`} />
                  <p className="text-sm font-semibold text-gray-950 text-center mb-1">
                    {coverFileName || "Kéo thả hoặc click để chọn ảnh bìa"}
                  </p>
                  <p className="text-xs font-medium text-gray-400 text-center">
                    Hỗ trợ: JPG, PNG, WEBP (Tối đa 5MB)
                  </p>
                  {isEdit && album?.coverUrl && !coverFileName.includes(album.coverUrl) && (
                     <div className="mt-4 flex items-center justify-center">
                       <img src={album.coverUrl} alt="Current" className="w-16 h-16 object-cover rounded-lg shadow-sm border border-gray-200" />
                     </div>
                  )}
                </div>
              </div>
              {validationErrors.cover && (
                <ErrorMessage error={validationErrors.cover} />
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
                  "Thêm album"
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

export default AlbumForm;
