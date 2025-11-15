import { X, FileText, Eye, Edit3, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import axios from "../../../../configs/apiConfig";

const SongForm = ({ isEdit = false, song = null, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    title: "",
    singerId: "",
    genreId: "",
    albumId: "",
    lyric: "",
    releaseDate: "",
    file: null,
    cover: null,
  });

  const [musicFileName, setMusicFileName] = useState("");
  const [coverFileName, setCoverFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({ file: 0, cover: 0 });

  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);

  const [lyricTab, setLyricTab] = useState("edit");
  const textareaRef = useRef(null);

  // ====== CONSTANTS ======
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_TITLE_LENGTH = 200;
  const MAX_LYRIC_LENGTH = 50000;

  const ALLOWED_AUDIO_TYPES = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 
    'audio/flac', 'audio/m4a', 'audio/aac'
  ];

  const ALLOWED_IMAGE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 
    'image/webp', 'image/gif'
  ];

  // ====== UTILITY FUNCTIONS ======
  const sanitizeInput = (str) => {
    if (!str) return '';
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Chuyển từ yyyy-MM-dd sang dd/MM/yyyy
  const formatDateToDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Chuyển từ dd/MM/yyyy sang yyyy-MM-dd
  const formatDateToISO = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  // Parse dd/MM/yyyy thành Date object
  const parseDisplayDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  const validateTitle = (title) => {
    if (!title || !title.trim()) {
      return "Tên bài hát không được để trống";
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return `Tên bài hát không được vượt quá ${MAX_TITLE_LENGTH} ký tự`;
    }
    if (!/^[\p{L}\p{N}\s\-_.,!?()]+$/u.test(title)) {
      return "Tên bài hát chứa ký tự không hợp lệ";
    }
    return null;
  };

  const validateReleaseDate = (dateString) => {
    if (!dateString) return null;
    
    // Validate format dd/MM/yyyy
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(datePattern);
    
    if (!match) {
      return "Định dạng ngày không hợp lệ (dd/MM/yyyy)";
    }
    
    const [, day, month, year] = match;
    const selectedDate = new Date(year, month - 1, day);
    
    // Kiểm tra ngày hợp lệ
    if (
      selectedDate.getDate() !== parseInt(day) ||
      selectedDate.getMonth() !== parseInt(month) - 1 ||
      selectedDate.getFullYear() !== parseInt(year)
    ) {
      return "Ngày không hợp lệ";
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      return "Ngày phát hành không được là ngày tương lai";
    }
    
    const minDate = new Date('1900-01-01');
    if (selectedDate < minDate) {
      return "Ngày phát hành phải từ năm 1900";
    }
    
    return null;
  };

  const validateAudioFile = (file) => {
    if (!file) return null;

    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      return "Chỉ chấp nhận file nhạc: MP3, WAV, FLAC, M4A, AAC";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `Dung lượng file không được vượt quá ${formatFileSize(MAX_FILE_SIZE)}`;
    }

    return null;
  };

  const validateImageFile = (file) => {
    if (!file) return null;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Chỉ chấp nhận ảnh: JPG, PNG, WEBP, GIF";
    }

    if (file.size > MAX_COVER_SIZE) {
      return `Dung lượng ảnh không được vượt quá ${formatFileSize(MAX_COVER_SIZE)}`;
    }

    return null;
  };

  const validateLyric = (lyric) => {
    if (!lyric) return null;

    if (lyric.length > MAX_LYRIC_LENGTH) {
      return `Lời bài hát không được vượt quá ${MAX_LYRIC_LENGTH} ký tự`;
    }

    return null;
  };

  // ====== FETCH DATA ======
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistRes, genreRes, albumRes] = await Promise.all([
          axios.get("/singers"),
          axios.get("/genres"),
          axios.get("/albums"),
        ]);

        setArtists(Array.isArray(artistRes.data) ? artistRes.data : artistRes.data?.data || []);
        setGenres(Array.isArray(genreRes.data) ? genreRes.data : genreRes.data?.data || []);
        setAlbums(Array.isArray(albumRes.data) ? albumRes.data : albumRes.data?.data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu form:", error);
        onError?.("Không thể tải dữ liệu. Vui lòng thử lại!");
      }
    };
    fetchData();
  }, []);

  // ====== LOAD SONG DATA ======
  useEffect(() => {
    if (isEdit && song) {
      // Convert yyyy-MM-dd sang dd/MM/yyyy để hiển thị
      let formattedDate = "";
      if (song.releaseDate) {
        const isoDate = String(song.releaseDate).substring(0, 10);
        formattedDate = formatDateToDisplay(isoDate);
      }
      
      const lyricValue = song.lyric || song.lyrics || "";

      setFormData({
        title: song.title || "",
        singerId: song.singerId || "",
        genreId: song.genreId || "",
        albumId: song.albumId || "",
        lyric: lyricValue,
        releaseDate: formattedDate,
        file: null,
        cover: null,
      });

      setMusicFileName("");
      setCoverFileName("");
      setValidationErrors({});

      setTimeout(() => {
        if (textareaRef.current && lyricValue) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 400) + "px";
        }
      }, 100);
    }
  }, [isEdit, song]);

  // ====== HANDLERS ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation error khi user sửa
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: null });
    }

    // Validate realtime cho một số trường
    if (name === 'title') {
      const error = validateTitle(value);
      if (error) {
        setValidationErrors({ ...validationErrors, title: error });
      }
    }

    if (name === 'releaseDate') {
      const error = validateReleaseDate(value);
      if (error) {
        setValidationErrors({ ...validationErrors, releaseDate: error });
      }
    }
  };

  const handleLyricChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, lyric: value });
    
    const error = validateLyric(value);
    if (error) {
      setValidationErrors({ ...validationErrors, lyric: error });
    } else if (validationErrors.lyric) {
      setValidationErrors({ ...validationErrors, lyric: null });
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 400) + "px";
    }
  };

  const formatLyrics = () => {
    const formatted = formData.lyric
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n\n");

    setFormData({ ...formData, lyric: formatted });

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 400) + "px";
      }
    }, 0);
  };

  const handleLyricFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      setValidationErrors({ ...validationErrors, lyric: "Chỉ chấp nhận file .txt" });
      onError?.("Chỉ chấp nhận file .txt");
      e.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB
      setValidationErrors({ ...validationErrors, lyric: "File lời bài hát không được vượt quá 1MB" });
      onError?.("File lời bài hát không được vượt quá 1MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const error = validateLyric(content);
      
      if (error) {
        setValidationErrors({ ...validationErrors, lyric: error });
        onError?.(error);
      } else {
        setFormData({ ...formData, lyric: content });
        setLyricTab("edit");
        setValidationErrors({ ...validationErrors, lyric: null });

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 400) + "px";
          }
        }, 0);
      }
    };
    reader.onerror = () => {
      onError?.("Lỗi khi đọc file");
      setValidationErrors({ ...validationErrors, lyric: "Lỗi khi đọc file" });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files[0]) return;

    const file = files[0];
    let error = null;

    if (name === "file") {
      error = validateAudioFile(file);
      if (error) {
        setValidationErrors({ ...validationErrors, file: error });
        onError?.(error);
        e.target.value = "";
        return;
      }
      setMusicFileName(file.name);
      setValidationErrors({ ...validationErrors, file: null });
    }

    if (name === "cover") {
      error = validateImageFile(file);
      if (error) {
        setValidationErrors({ ...validationErrors, cover: error });
        onError?.(error);
        e.target.value = "";
        return;
      }
      setCoverFileName(file.name);
      setValidationErrors({ ...validationErrors, cover: null });
    }

    setFormData({ ...formData, [name]: file });
  };

  const validateForm = () => {
    const errors = {};

    // Validate title
    const titleError = validateTitle(formData.title);
    if (titleError) errors.title = titleError;

    // Validate artist
    if (!formData.singerId) {
      errors.singerId = "Vui lòng chọn nghệ sĩ";
    }

    // Validate genre
    if (!formData.genreId) {
      errors.genreId = "Vui lòng chọn thể loại";
    }

    // Validate file (chỉ khi tạo mới)
    if (!isEdit && !formData.file) {
      errors.file = "Vui lòng chọn file nhạc";
    }

    // Validate release date
    const dateError = validateReleaseDate(formData.releaseDate);
    if (dateError) errors.releaseDate = dateError;

    // Validate lyric
    const lyricError = validateLyric(formData.lyric);
    if (lyricError) errors.lyric = lyricError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate toàn bộ form
    if (!validateForm()) {
      onError?.("Vui lòng kiểm tra lại thông tin đã nhập!");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", sanitizeInput(formData.title));
      data.append("singerId", formData.singerId);
      data.append("genreId", formData.genreId);
      if (formData.albumId) data.append("albumId", formData.albumId);
      data.append("lyric", formData.lyric?.trim() || "");
      if (formData.releaseDate) data.append("releaseDate", formData.releaseDate);
      if (formData.file) data.append("file", formData.file);
      if (formData.cover) data.append("cover", formData.cover);

      if (isEdit) {
        await axios.put(`/songs/${song.songId || song._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess?.("Cập nhật bài hát thành công!");
      } else {
        await axios.post("/songs", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess?.("Thêm bài hát thành công!");
      }
      onClose();
    } catch (err) {
      console.error("❌ Submit error:", err);
      const errorMsg = err.response?.data?.message || "Lỗi khi lưu bài hát!";
      onError?.(errorMsg);
      
      // Hiển thị lỗi cụ thể nếu có
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#2a2a2a",
      borderColor: state.isFocused 
        ? (validationErrors.singerId || validationErrors.genreId ? "#ef4444" : "#fff")
        : (validationErrors.singerId || validationErrors.genreId ? "#ef4444" : "#555"),
      color: "white",
      borderRadius: 8,
      boxShadow: state.isFocused ? "0 0 0 2px rgba(255,255,255,0.1)" : "none",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#2a2a2a",
      color: "white",
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#3a3a3a" : "#2a2a2a",
      color: "white",
      cursor: "pointer",
    }),
    singleValue: (base) => ({ ...base, color: "white" }),
    placeholder: (base) => ({ ...base, color: "#aaa" }),
    input: (base) => ({ ...base, color: "white" }),
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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition z-10"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-center mb-6">
          {isEdit ? "Chỉnh sửa bài hát" : "Thêm bài hát"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Tên bài hát */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Tên bài hát <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={MAX_TITLE_LENGTH}
              className={`w-full px-3 py-2 rounded-lg border ${
                validationErrors.title ? 'border-red-500' : 'border-gray-700'
              } bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none`}
              placeholder="Nhập tên bài hát..."
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-start">
              <ErrorMessage error={validationErrors.title} />
              <span className="text-xs text-gray-500 mt-1">
                {formData.title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
          </div>

          {/* Nghệ sĩ & Thể loại */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-300">
                Nghệ sĩ <span className="text-red-500">*</span>
              </label>
              <Select
                options={artists.map((a) => ({ value: a._id || a.singerId, label: a.name }))}
                styles={customSelectStyles}
                value={
                  artists.find((a) => (a._id || a.singerId) === formData.singerId)
                    ? {
                        value: formData.singerId,
                        label: artists.find((a) => (a._id || a.singerId) === formData.singerId).name,
                      }
                    : null
                }
                onChange={(opt) => {
                  setFormData({ ...formData, singerId: opt ? opt.value : "" });
                  if (validationErrors.singerId) {
                    setValidationErrors({ ...validationErrors, singerId: null });
                  }
                }}
                placeholder="Chọn nghệ sĩ..."
                isClearable
                isDisabled={isSubmitting}
              />
              <ErrorMessage error={validationErrors.singerId} />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">
                Thể loại <span className="text-red-500">*</span>
              </label>
              <Select
                options={genres.map((g) => ({ value: g._id || g.genreId, label: g.name }))}
                styles={customSelectStyles}
                value={
                  genres.find((g) => (g._id || g.genreId) === formData.genreId)
                    ? {
                        value: formData.genreId,
                        label: genres.find((g) => (g._id || g.genreId) === formData.genreId).name,
                      }
                    : null
                }
                onChange={(opt) => {
                  setFormData({ ...formData, genreId: opt ? opt.value : "" });
                  if (validationErrors.genreId) {
                    setValidationErrors({ ...validationErrors, genreId: null });
                  }
                }}
                placeholder="Chọn thể loại..."
                isClearable
                isDisabled={isSubmitting}
              />
              <ErrorMessage error={validationErrors.genreId} />
            </div>
          </div>

          {/* Ngày phát hành */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Ngày phát hành</label>
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full px-3 py-2 rounded-lg border ${
                validationErrors.releaseDate ? 'border-red-500' : 'border-gray-700'
              } bg-[#2a2a2a] text-white focus:ring-2 focus:ring-white focus:outline-none`}
              disabled={isSubmitting}
            />
            <ErrorMessage error={validationErrors.releaseDate} />
          </div>

          {/* Lời bài hát */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-300">Lời bài hát</label>
              <span className={`text-xs ${
                formData.lyric?.length > MAX_LYRIC_LENGTH ? 'text-red-400' : 'text-gray-500'
              }`}>
                {formData.lyric?.length || 0} / {MAX_LYRIC_LENGTH} ký tự
              </span>
            </div>

            <div className="flex gap-2 mb-2">
              <div className="flex gap-1 bg-[#2a2a2a] rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLyricTab("edit")}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition ${
                    lyricTab === "edit" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                  }`}
                  disabled={isSubmitting}
                >
                  <Edit3 size={14} />
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => setLyricTab("preview")}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition ${
                    lyricTab === "preview" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                  }`}
                  disabled={isSubmitting}
                >
                  <Eye size={14} />
                  Xem trước
                </button>
              </div>

              <button
                type="button"
                onClick={formatLyrics}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition"
                disabled={isSubmitting || !formData.lyric}
                title="Tự động thêm khoảng trống giữa các đoạn"
              >
                Định dạng
              </button>

              <label className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded cursor-pointer transition">
                <FileText size={14} />
                Import .txt
                <input
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleLyricFileUpload}
                  disabled={isSubmitting}
                />
              </label>
            </div>

            {lyricTab === "edit" ? (
              <textarea
                ref={textareaRef}
                name="lyric"
                value={formData.lyric}
                onChange={handleLyricChange}
                className={`w-full min-h-[200px] max-h-[400px] px-3 py-2 rounded-lg border ${
                  validationErrors.lyric ? 'border-red-500' : 'border-gray-700'
                } bg-[#2a2a2a] text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-white focus:outline-none overflow-y-auto`}
                placeholder={`Nhập lời bài hát...\n\nVí dụ:\n[Verse 1]\nDòng 1...\nDòng 2...\n\n[Chorus]\nĐiệp khúc...`}
                disabled={isSubmitting}
                style={{ lineHeight: "1.6" }}
              />
            ) : (
              <div
                className="w-full min-h-[200px] max-h-[400px] px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white whitespace-pre-wrap overflow-y-auto"
                style={{ lineHeight: "1.6" }}
              >
                {formData.lyric || (
                  <span className="text-gray-500 italic">Chưa có lời bài hát...</span>
                )}
              </div>
            )}
            <ErrorMessage error={validationErrors.lyric} />
          </div>

          {/* Upload file nhạc & ảnh bìa */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-300">
                File nhạc {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <label className={`flex items-center justify-center px-3 py-2 ${
                validationErrors.file ? 'bg-red-600 hover:bg-red-700' : 'bg-white hover:bg-gray-200'
              } text-black rounded-lg cursor-pointer text-sm transition`}>
                Chọn file
                <input
                  type="file"
                  name="file"
                  accept={ALLOWED_AUDIO_TYPES.join(',')}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </label>

              {musicFileName && (
                <p className="text-xs text-green-400 mt-1 truncate" title={musicFileName}>
                  ✓ {musicFileName}
                </p>
              )}
              {isEdit && song?.fileUrl && !musicFileName && (
                <p className="text-xs text-gray-400 mt-1 truncate">
                  Nhạc hiện tại:{" "}
                  <a
                    href={song.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Nghe nhạc
                  </a>
                </p>
              )}
              <ErrorMessage error={validationErrors.file} />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">Ảnh bìa</label>
              <label className={`flex items-center justify-center px-3 py-2 ${
                validationErrors.cover ? 'bg-red-600 hover:bg-red-700' : 'bg-white hover:bg-gray-200'
              } text-black rounded-lg cursor-pointer text-sm transition`}>
                Chọn ảnh
                <input
                  type="file"
                  name="cover"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </label>

              {coverFileName && (
                <p className="text-xs text-green-400 mt-1 truncate" title={coverFileName}>
                  ✓ {coverFileName}
                </p>
              )}
              {isEdit && song?.coverUrl && !coverFileName && (
                <p className="text-xs text-gray-400 mt-1 truncate">
                  Ảnh hiện tại:{" "}
                  <a
                    href={song.coverUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Xem ảnh
                  </a>
                </p>
              )}
              <ErrorMessage error={validationErrors.cover} />
            </div>
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
              {isSubmitting ? "Đang xử lý..." : isEdit ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongForm;