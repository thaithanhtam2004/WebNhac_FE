import { X, FileText, Eye, Edit3, AlertCircle, Upload, CheckCircle, XCircle, Loader2, Music, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import axios from "../../../../configs/apiConfig";

const SongForm = ({ isEdit = false, song = null, onClose, onSuccess, onError }) => {
  // Mode: 'single' hoặc 'bulk'
  const [uploadMode, setUploadMode] = useState('single');
  
  // Single mode state
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

  // Bulk mode state
  const [bulkSongs, setBulkSongs] = useState([]);
  const [bulkDefaults, setBulkDefaults] = useState({
    singerId: "",
    genreId: "",
    albumId: "",
    releaseDate: "",
  });
  const [expandedSongs, setExpandedSongs] = useState({});
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const [musicFileName, setMusicFileName] = useState("");
  const [coverFileName, setCoverFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  // ✅ BỔ SUNG: Trạng thái loading dữ liệu select
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [lyricTab, setLyricTab] = useState("edit");
  const textareaRef = useRef(null);
  const bulkFileInputRef = useRef(null);

  // ====== CONSTANTS ======
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const MAX_COVER_SIZE = 5 * 1024 * 1024;
  const MAX_TITLE_LENGTH = 200;
  const MAX_LYRIC_LENGTH = 50000;
  const MAX_BULK_SONGS = 50; 

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

  const formatDateToDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const dateOnly = String(dateString).substring(0, 10);
      const [year, month, day] = dateOnly.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  const formatDateToISO = (dateString) => {
    if (!dateString) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  // ✅ CẬP NHẬT: Nới lỏng regex, cho phép ( ) - | [ ]
  const validateTitle = (title) => {
    if (!title || !title.trim()) {
      return "Tên bài hát không được để trống";
    }
    
    if (title.length > MAX_TITLE_LENGTH) {
      return `Tên bài hát không được vượt quá ${MAX_TITLE_LENGTH} ký tự`;
    }
    
    // Chỉ cấm các ký tự thực sự nguy hiểm cho code injection
    const dangerousChars = ['<', '>', '{', '}', '\\'];
    for (let char of dangerousChars) {
      if (title.includes(char)) {
        return `Tên bài hát không được chứa ký tự đặc biệt: ${char}`;
      }
    }
    
    return null;
  };

  // ✅ CẬP NHẬT: Validate ngày tháng chính xác hơn
  const validateReleaseDate = (dateString) => {
    if (!dateString) return null;
    
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(datePattern);
    
    if (!match) return "Định dạng ngày không hợp lệ (dd/MM/yyyy)";
    
    const [, day, month, year] = match;
    const selectedDate = new Date(year, month - 1, day);
    
    // Check ngày tồn tại (VD: 30/02)
    if (
      selectedDate.getDate() !== parseInt(day) ||
      selectedDate.getMonth() !== parseInt(month) - 1 ||
      selectedDate.getFullYear() !== parseInt(year)
    ) {
      return "Ngày không tồn tại trong lịch";
    }
    
    if (selectedDate.getFullYear() < 1900) {
      return "Năm phát hành phải từ 1900 trở đi";
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
      setIsLoadingData(true);
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
        // ✅ BỔ SUNG: Không crash app nhưng thông báo nhẹ
        onError?.("Không thể tải danh sách nghệ sĩ/thể loại. Vui lòng tải lại trang.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // ====== LOAD SONG DATA (EDIT MODE) ======
  useEffect(() => {
    if (isEdit && song) {
      let formattedDate = "";
      if (song.releaseDate) {
        formattedDate = formatDateToDisplay(song.releaseDate);
      }
      
      const lyricValue = song.lyric || song.lyrics || "";

      setFormData({
        title: song.title || "",
        singerId: song.singerId?._id || song.singerId || "", // ✅ BỔ SUNG: Handle object populated
        genreId: song.genreId?._id || song.genreId || "",
        albumId: song.albumId?._id || song.albumId || "",
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

  // ====== BULK UPLOAD HANDLERS ======
  const handleBulkFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = MAX_BULK_SONGS - bulkSongs.length;
    
    if (remainingSlots <= 0) {
      onError?.(`Đã đạt giới hạn tối đa ${MAX_BULK_SONGS} bài hát!`);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
      return;
    }
    
    if (files.length > remainingSlots) {
      onError?.(`Chỉ có thể thêm ${remainingSlots} bài nữa (tối đa ${MAX_BULK_SONGS} bài/lần)`);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
      return;
    }
    
    const validFiles = files.filter(file => {
      const error = validateAudioFile(file);
      if (error) {
        onError?.(`${file.name}: ${error}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
      return;
    }

    const newSongs = validFiles.map((file, index) => ({
      id: Date.now() + index,
      file: file,
      title: file.name.replace(/\.[^/.]+$/, ""), // Tự động lấy tên file làm tên bài
      singerId: bulkDefaults.singerId,
      genreId: bulkDefaults.genreId,
      albumId: bulkDefaults.albumId,
      releaseDate: bulkDefaults.releaseDate,
      lyric: "",
      cover: null,
      coverFileName: "",
      status: 'pending',
      error: null
    }));

    setBulkSongs([...bulkSongs, ...newSongs]);
    
    const newExpanded = {};
    newSongs.forEach(song => { newExpanded[song.id] = true; });
    setExpandedSongs({...expandedSongs, ...newExpanded});
    
    if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
  };

  const handleBulkDefaultChange = (field, value) => {
    setBulkDefaults({...bulkDefaults, [field]: value});
  };

  const applyDefaultsToAll = () => {
    setBulkSongs(bulkSongs.map(song => ({
      ...song,
      singerId: bulkDefaults.singerId || song.singerId,
      genreId: bulkDefaults.genreId || song.genreId,
      albumId: bulkDefaults.albumId || song.albumId,
      releaseDate: bulkDefaults.releaseDate || song.releaseDate,
    })));
    onSuccess?.("Đã áp dụng thông tin chung cho tất cả bài hát!");
  };

  const updateBulkSong = (id, field, value) => {
    setBulkSongs(bulkSongs.map(song => 
      song.id === id ? {...song, [field]: value} : song
    ));
  };

  const removeBulkSong = (id) => {
    setBulkSongs(bulkSongs.filter(song => song.id !== id));
    const newExpanded = {...expandedSongs};
    delete newExpanded[id];
    setExpandedSongs(newExpanded);
  };

  const toggleExpanded = (id) => {
    setExpandedSongs({...expandedSongs, [id]: !expandedSongs[id]});
  };

  const handleBulkCoverChange = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      onError?.(error);
      e.target.value = '';
      return;
    }

    updateBulkSong(id, 'cover', file);
    updateBulkSong(id, 'coverFileName', file.name);
  };

  const handleBulkSubmit = async () => {
    const errors = [];
    bulkSongs.forEach((song, index) => {
      if (!song.title?.trim()) errors.push(`Bài ${index + 1}: Thiếu tên bài hát`);
      if (!song.singerId) errors.push(`Bài ${index + 1}: Thiếu nghệ sĩ`);
      if (!song.genreId) errors.push(`Bài ${index + 1}: Thiếu thể loại`);
    });

    if (errors.length > 0) {
      onError?.(errors.join('\n'));
      return;
    }

    setIsBulkUploading(true);
    const results = [];

    for (let i = 0; i < bulkSongs.length; i++) {
      const song = bulkSongs[i];
      
      setBulkSongs(prev => prev.map(s => 
        s.id === song.id ? {...s, status: 'uploading'} : s
      ));

      try {
        const data = new FormData();
        data.append("title", sanitizeInput(song.title));
        data.append("singerId", song.singerId);
        data.append("genreId", song.genreId);
        if (song.albumId) data.append("albumId", song.albumId);
        data.append("lyric", song.lyric?.trim() || "");
        
        if (song.releaseDate) {
          const isoDate = formatDateToISO(song.releaseDate);
          data.append("releaseDate", isoDate);
        }
        
        data.append("file", song.file);
        if (song.cover) data.append("cover", song.cover);

        await axios.post("/songs", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setBulkSongs(prev => prev.map(s => 
          s.id === song.id ? {...s, status: 'success'} : s
        ));
        results.push({ success: true, title: song.title });

      } catch (err) {
        console.error("Upload error:", err);
        const errorMsg = err.response?.data?.message || "Lỗi khi upload";
        
        setBulkSongs(prev => prev.map(s => 
          s.id === song.id ? {...s, status: 'error', error: errorMsg} : s
        ));
        results.push({ success: false, title: song.title, error: errorMsg });
      }
    }

    setIsBulkUploading(false);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    if (failCount === 0) {
      onSuccess?.(`🎉 Đã thêm thành công ${successCount}/${bulkSongs.length} bài hát!`);
      setTimeout(() => onClose(), 2000);
    } else {
      onError?.(`⚠️ Thành công: ${successCount} | Thất bại: ${failCount}`);
    }
  };

  // ====== SINGLE MODE HANDLERS ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: null });
    }

    if (name === 'title') {
      const error = validateTitle(value);
      if (error) {
        setValidationErrors(prev => ({ ...prev, title: error }));
      }
    }

    if (name === 'releaseDate') {
      const error = validateReleaseDate(value);
      if (error) {
        setValidationErrors(prev => ({ ...prev, releaseDate: error }));
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
      e.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setValidationErrors({ ...validationErrors, lyric: "File lời bài hát không được vượt quá 1MB" });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const error = validateLyric(content);
      
      if (error) {
        setValidationErrors({ ...validationErrors, lyric: error });
      } else {
        setFormData({ ...formData, lyric: content });
        setLyricTab("edit");
        setValidationErrors({ ...validationErrors, lyric: null });
      }
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

    const titleError = validateTitle(formData.title);
    if (titleError) errors.title = titleError;

    if (!formData.singerId) errors.singerId = "Vui lòng chọn nghệ sĩ";
    if (!formData.genreId) errors.genreId = "Vui lòng chọn thể loại";
    if (!isEdit && !formData.file) errors.file = "Vui lòng chọn file nhạc";

    const dateError = validateReleaseDate(formData.releaseDate);
    if (dateError) errors.releaseDate = dateError;

    const lyricError = validateLyric(formData.lyric);
    if (lyricError) errors.lyric = lyricError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      
      if (formData.releaseDate) {
        const isoDate = formatDateToISO(formData.releaseDate);
        data.append("releaseDate", isoDate);
      }
      
      if (formData.file) data.append("file", formData.file);
      if (formData.cover) data.append("cover", formData.cover);

      if (isEdit) {
        // Handle ID field whether it's named songId or _id
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
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10"
          disabled={isSubmitting || isBulkUploading}
        >
          <X size={24} />
        </button>

        {/* Header with Mode Toggle */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-700 px-6 py-4 z-10">
          <h2 className="text-2xl font-bold text-center mb-4">
            {isEdit ? "Chỉnh sửa bài hát" : "Thêm bài hát"}
          </h2>

          {!isEdit && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setUploadMode('single')}
                className={`px-6 py-2 rounded-lg transition ${
                  uploadMode === 'single'
                    ? 'bg-white text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Music className="w-4 h-4 inline mr-2" />
                Thêm 1 bài
              </button>
              <button
                onClick={() => setUploadMode('bulk')}
                className={`px-6 py-2 rounded-lg transition ${
                  uploadMode === 'bulk'
                    ? 'bg-white text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Thêm nhiều bài
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* BULK MODE - GIỮ NGUYÊN */}
          {uploadMode === 'bulk' && !isEdit && (
            <div className="space-y-6">
              {/* Thông báo giới hạn */}
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-200 font-medium mb-1">Giới hạn upload: {MAX_BULK_SONGS} bài/lần</p>
                  <p className="text-blue-300/80">
                    Nếu cần thêm nhiều hơn, vui lòng upload nhiều lần.
                  </p>
                </div>
              </div>

              {/* Thông tin chung */}
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText size={20} />
                  Thông tin chung (Tùy chọn)
                </h3>
                
                {/* ✅ BỔ SUNG: Show loading state */}
                {isLoadingData ? (
                  <div className="text-center py-4 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Đang tải danh sách nghệ sĩ...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-300">Nghệ sĩ mặc định</label>
                      <Select
                        options={artists.map((a) => ({ value: a._id || a.singerId, label: a.name }))}
                        styles={customSelectStyles}
                        value={
                          artists.find((a) => (a._id || a.singerId) === bulkDefaults.singerId)
                            ? {
                                value: bulkDefaults.singerId,
                                label: artists.find((a) => (a._id || a.singerId) === bulkDefaults.singerId).name,
                              }
                            : null
                        }
                        onChange={(opt) => handleBulkDefaultChange('singerId', opt ? opt.value : "")}
                        placeholder="Chọn nghệ sĩ..."
                        isClearable
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm text-gray-300">Thể loại mặc định</label>
                      <Select
                        options={genres.map((g) => ({ value: g._id || g.genreId, label: g.name }))}
                        styles={customSelectStyles}
                        value={
                          genres.find((g) => (g._id || g.genreId) === bulkDefaults.genreId)
                            ? {
                                value: bulkDefaults.genreId,
                                label: genres.find((g) => (g._id || g.genreId) === bulkDefaults.genreId).name,
                              }
                            : null
                        }
                        onChange={(opt) => handleBulkDefaultChange('genreId', opt ? opt.value : "")}
                        placeholder="Chọn thể loại..."
                        isClearable
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm text-gray-300">Album mặc định</label>
                      <Select
                        options={albums.map((a) => ({ value: a._id || a.albumId, label: a.name }))}
                        styles={customSelectStyles}
                        value={
                          albums.find((a) => (a._id || a.albumId) === bulkDefaults.albumId)
                            ? {
                                value: bulkDefaults.albumId,
                                label: albums.find((a) => (a._id || a.albumId) === bulkDefaults.albumId).name,
                              }
                            : null
                        }
                        onChange={(opt) => handleBulkDefaultChange('albumId', opt ? opt.value : "")}
                        placeholder="Chọn album..."
                        isClearable
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm text-gray-300">
                        Ngày phát hành mặc định
                        <span className="text-xs text-gray-500 ml-2">(dd/MM/yyyy)</span>
                      </label>
                      <input
                        type="text"
                        value={bulkDefaults.releaseDate}
                        onChange={(e) => handleBulkDefaultChange('releaseDate', e.target.value)}
                        placeholder="dd/MM/yyyy"
                        className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
                {/* Button apply giữ nguyên */}
                 {bulkSongs.length > 0 && !isLoadingData && (
                  <button
                    onClick={applyDefaultsToAll}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm font-medium"
                  >
                    Áp dụng cho tất cả {bulkSongs.length} bài
                  </button>
                )}
              </div>

              {/* Upload files zone - Giữ nguyên */}
              <div className={`bg-gray-800/50 p-6 rounded-xl border-2 border-dashed transition text-center ${
                bulkSongs.length >= MAX_BULK_SONGS 
                  ? 'border-gray-700 opacity-50 cursor-not-allowed' 
                  : 'border-gray-600 hover:border-gray-500 cursor-pointer'
              }`}>
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Chọn file nhạc</h3>
                <p className="text-sm text-gray-400 mb-4">
                  (MP3, WAV, FLAC, M4A, AAC)
                </p>
                <label className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  bulkSongs.length >= MAX_BULK_SONGS
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-black cursor-pointer hover:bg-gray-200'
                }`}>
                  <Upload size={20} />
                  Chọn file
                  <input
                    ref={bulkFileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_AUDIO_TYPES.join(',')}
                    className="hidden"
                    onChange={handleBulkFileSelect}
                    disabled={isBulkUploading || bulkSongs.length >= MAX_BULK_SONGS}
                  />
                </label>
              </div>

              {/* Danh sách bài hát Bulk - Giữ nguyên logic hiển thị */}
              {bulkSongs.length > 0 && (
                <div className="space-y-3">
                   {/* ... (Phần render list bulk giữ nguyên code cũ của bạn) ... */}
                   {/* Chỉ cần chú ý phần Select nghệ sĩ trong từng item cũng cần check isLoadingData nếu muốn kỹ, 
                       nhưng vì data load 1 lần ở trên nên không cần sửa gì thêm ở đây */}
                   
                   {bulkSongs.map((song, index) => (
                    <div key={song.id} className="bg-gray-800/50 rounded-xl border border-gray-700">
                      {/* ... Header ... */}
                       <div className="p-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{song.title || song.file.name}</div>
                          {song.error && <div className="text-red-400 text-sm">{song.error}</div>}
                        </div>
                        {/* Toggle button */}
                        <button onClick={() => toggleExpanded(song.id)} className="p-2">
                           {expandedSongs[song.id] ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        <button onClick={() => removeBulkSong(song.id)} className="p-2 text-red-400"><X /></button>
                       </div>

                       {/* Expanded Form for Bulk Item */}
                       {expandedSongs[song.id] && (
                          <div className="p-4 border-t border-gray-700 space-y-3">
                            <input 
                              value={song.title} 
                              onChange={(e) => updateBulkSong(song.id, 'title', e.target.value)}
                              className="w-full bg-[#2a2a2a] px-3 py-2 rounded border border-gray-700" 
                              placeholder="Tên bài hát"
                            />
                            <div className="grid grid-cols-2 gap-3">
                               <Select
                                  options={artists.map((a) => ({ value: a._id || a.singerId, label: a.name }))}
                                  styles={customSelectStyles}
                                  value={artists.find(a => (a._id||a.singerId) == song.singerId) ? {label: artists.find(a => (a._id||a.singerId) == song.singerId).name, value: song.singerId} : null}
                                  onChange={(opt) => updateBulkSong(song.id, 'singerId', opt?.value)}
                                  placeholder="Nghệ sĩ..."
                               />
                               <Select
                                  options={genres.map((g) => ({ value: g._id || g.genreId, label: g.name }))}
                                  styles={customSelectStyles}
                                  value={genres.find(g => (g._id||g.genreId) == song.genreId) ? {label: genres.find(g => (g._id||g.genreId) == song.genreId).name, value: song.genreId} : null}
                                  onChange={(opt) => updateBulkSong(song.id, 'genreId', opt?.value)}
                                  placeholder="Thể loại..."
                               />
                            </div>
                          </div>
                       )}
                    </div>
                   ))}
                </div>
              )}

              {/* Submit Button Bulk */}
              {bulkSongs.length > 0 && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                  <button onClick={onClose} className="px-6 py-3 rounded-lg border border-gray-600 hover:bg-gray-800">Hủy</button>
                  <button onClick={handleBulkSubmit} className="px-6 py-3 rounded-lg bg-white text-black hover:bg-gray-200">
                    {isBulkUploading ? "Đang upload..." : `Upload ${bulkSongs.length} bài`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SINGLE MODE - Form cũ đã được cập nhật logic validation */}
          {uploadMode === 'single' && (
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
                <ErrorMessage error={validationErrors.title} />
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
                      if (validationErrors.singerId) setValidationErrors({ ...validationErrors, singerId: null });
                    }}
                    placeholder={isLoadingData ? "Đang tải..." : "Chọn nghệ sĩ..."}
                    isDisabled={isSubmitting || isLoadingData}
                    isClearable
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
                      if (validationErrors.genreId) setValidationErrors({ ...validationErrors, genreId: null });
                    }}
                    placeholder={isLoadingData ? "Đang tải..." : "Chọn thể loại..."}
                    isDisabled={isSubmitting || isLoadingData}
                    isClearable
                  />
                  <ErrorMessage error={validationErrors.genreId} />
                </div>
              </div>

              {/* Ngày phát hành */}
              <div>
                <label className="block mb-1 text-sm text-gray-300">
                  Ngày phát hành
                  <span className="text-xs text-gray-500 ml-2">(dd/MM/yyyy)</span>
                </label>
                <input
                  type="text"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleChange}
                  placeholder="dd/MM/yyyy"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    validationErrors.releaseDate ? 'border-red-500' : 'border-gray-700'
                  } bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none`}
                  disabled={isSubmitting}
                />
                <ErrorMessage error={validationErrors.releaseDate} />
              </div>

              {/* Lời bài hát */}
              <div>
                {/* Header lời bài hát giữ nguyên */}
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300">Lời bài hát</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={formatLyrics} className="text-xs bg-gray-700 px-2 py-1 rounded">Format</button>
                    <label className="text-xs bg-gray-700 px-2 py-1 rounded cursor-pointer">
                       Import .txt 
                       <input type="file" accept=".txt" className="hidden" onChange={handleLyricFileUpload}/>
                    </label>
                  </div>
                </div>

                <textarea
                    ref={textareaRef}
                    name="lyric"
                    value={formData.lyric}
                    onChange={handleLyricChange}
                    className={`w-full min-h-[200px] max-h-[400px] px-3 py-2 rounded-lg border ${
                      validationErrors.lyric ? 'border-red-500' : 'border-gray-700'
                    } bg-[#2a2a2a] text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-white focus:outline-none overflow-y-auto`}
                    placeholder="Nhập lời bài hát..."
                    disabled={isSubmitting}
                  />
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
                    <p className="text-xs text-green-400 mt-1 truncate">✓ {musicFileName}</p>
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
                    <p className="text-xs text-green-400 mt-1 truncate">✓ {coverFileName}</p>
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
                  disabled={isSubmitting || isLoadingData}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : isEdit ? "Lưu" : "Thêm"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongForm;