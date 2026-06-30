import { X, Loader2, Music, Upload, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import Select from "react-select";
import axios from "../../config/api";

const SongForm = ({
  isEdit = false,
  song = null,
  onClose,
  onSuccess,
  onError,
}) => {
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

  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const textareaRef = useRef(null);

  // ====== CONSTANTS ======
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const MAX_COVER_SIZE = 5 * 1024 * 1024;
  const MAX_TITLE_LENGTH = 200;
  const MAX_LYRIC_LENGTH = 50000;

  const ALLOWED_AUDIO_TYPES = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/flac",
    "audio/m4a",
    "audio/aac",
  ];
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

  const validateTitle = (title) => {
    if (!title || !title.trim()) return "Tên bài hát không được để trống";
    if (title.length > MAX_TITLE_LENGTH)
      return `Tên bài hát không được vượt quá ${MAX_TITLE_LENGTH} ký tự`;
    const dangerousChars = ["<", ">", "{", "}", "\\\\"];
    for (let char of dangerousChars) {
      if (title.includes(char))
        return `Tên bài hát không được chứa ký tự đặc biệt: ${char}`;
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

  const validateAudioFile = (file) => {
    if (!file) return null;
    if (!ALLOWED_AUDIO_TYPES.includes(file.type))
      return "Chỉ chấp nhận file nhạc: MP3, WAV, FLAC, M4A, AAC";
    if (file.size > MAX_FILE_SIZE)
      return `Dung lượng file không được vượt quá ${formatFileSize(MAX_FILE_SIZE)}`;
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

  const validateLyric = (lyric) => {
    if (!lyric) return null;
    if (lyric.length > MAX_LYRIC_LENGTH)
      return `Lời bài hát không được vượt quá ${MAX_LYRIC_LENGTH} ký tự`;
    return null;
  };

  // ====== FETCH DATA ======
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [artistRes, genreRes] = await Promise.all([
          axios.get("/singers"),
          axios.get("/genres"),
        ]);
        setArtists(
          Array.isArray(artistRes.data)
            ? artistRes.data
            : artistRes.data?.data || [],
        );
        setGenres(
          Array.isArray(genreRes.data)
            ? genreRes.data
            : genreRes.data?.data || [],
        );
      } catch (error) {
        console.error("Lỗi tải dữ liệu form:", error);
        onError?.(
          "Không thể tải danh sách nghệ sĩ/thể loại. Vui lòng tải lại trang.",
        );
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
      if (song.releaseDate)
        formattedDate = formatDateToDisplay(song.releaseDate);
      const lyricValue = song.lyric || song.lyrics || "";

      setFormData({
        title: song.title || "",
        singerId: song.singerId?._id || song.singerId || "",
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
    }
  }, [isEdit, song]);

  // ====== PREVIEWS ======
  const previewCoverUrl = useMemo(() => {
    if (formData.cover) return URL.createObjectURL(formData.cover);
    if (isEdit && song?.coverUrl) return song.coverUrl;
    return null;
  }, [formData.cover, isEdit, song]);

  const previewAudioUrl = useMemo(() => {
    if (formData.file) return URL.createObjectURL(formData.file);
    if (isEdit && song?.fileUrl) return song.fileUrl;
    return null;
  }, [formData.file, isEdit, song]);

  useEffect(() => {
    return () => {
      if (previewCoverUrl && previewCoverUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewCoverUrl);
      if (previewAudioUrl && previewAudioUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewAudioUrl);
    };
  }, [previewCoverUrl, previewAudioUrl]);

  // ====== HANDLERS ======
  const formatDatePickerInput = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === "releaseDate") finalValue = formatDatePickerInput(value);

    setFormData({ ...formData, [name]: finalValue });

    if (validationErrors[name])
      setValidationErrors({ ...validationErrors, [name]: null });

    if (name === "title") {
      const error = validateTitle(finalValue);
      if (error) setValidationErrors((prev) => ({ ...prev, title: error }));
    }

    if (name === "releaseDate") {
      const error = validateReleaseDate(finalValue);
      if (error)
        setValidationErrors((prev) => ({ ...prev, releaseDate: error }));
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
  };

  const formatLyrics = () => {
    const formatted = formData.lyric
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join("\n\n");
    setFormData({ ...formData, lyric: formatted });
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
        data.append("releaseDate", formatDateToISO(formData.releaseDate));
      }
      if (formData.file) data.append("file", formData.file);
      if (formData.cover) data.append("cover", formData.cover);

      if (isEdit) {
        await axios.put(`/songs/${song.songId || song._id || song.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess?.("Cập nhật bài hát thành công!");
      } else {
        await axios.post("/songs", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess?.("Thêm bài hát thành công!");
      }
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error("Submit error:", error);
      onError?.(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====== SELECT STYLES ======
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: state.isFocused ? "#000000" : "#d1d5db",
      borderRadius: "0.75rem",
      padding: "0.15rem",
      boxShadow: state.isFocused ? "0 0 0 1px #000000" : "none",
      "&:hover": { borderColor: state.isFocused ? "#000000" : "#9ca3af" },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "white",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      overflow: "hidden",
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#000000"
        : state.isFocused
          ? "#f3f4f6"
          : "white",
      color: state.isSelected ? "white" : "#111827",
      "&:hover": { backgroundColor: state.isSelected ? "#000000" : "#f3f4f6" },
      cursor: "pointer",
    }),
    singleValue: (provided) => ({ ...provided, color: "#111827" }),
    input: (provided) => ({ ...provided, color: "#111827" }),
    placeholder: (provided) => ({ ...provided, color: "#6b7280" }),
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <span className="text-red-400 text-xs mt-1 block font-medium">
        {error}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] p-4">
      <div className="bg-white text-gray-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? "Chỉnh sửa bài hát" : "Thêm bài hát mới"}
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
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* CỘT TRÁI: PREVIEW ẢNH VÀ NHẠC */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <label className="text-sm font-semibold text-gray-700 block">
                Ảnh bìa bài hát
              </label>
              <div
                className="flex flex-col items-center justify-center w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 relative group cursor-pointer hover:border-black hover:bg-gray-100 transition-all"
                onClick={() => document.getElementById("cover-upload").click()}
              >
                {previewCoverUrl ? (
                  <img
                    src={previewCoverUrl}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 group-hover:text-black transition-colors">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-70" />
                    <span className="text-sm font-medium">Chọn ảnh bìa</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-sm font-medium flex items-center gap-2">
                    <Upload size={16} /> Tải ảnh lên
                  </span>
                </div>
                <input
                  id="cover-upload"
                  type="file"
                  name="cover"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-center -mt-2">
                <ErrorMessage error={validationErrors.cover} />
              </div>

              <div className="w-full mt-2">
                <label className="block mb-2 text-sm text-gray-700 font-semibold">
                  File nhạc {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <label
                  className={`flex items-center justify-center px-4 py-3 ${
                    validationErrors.file
                      ? "bg-red-50 text-red-600 border-red-300"
                      : "bg-gray-50 text-gray-700 border-gray-300 hover:border-black hover:bg-gray-100"
                  } border-2 border-dashed rounded-xl cursor-pointer text-sm transition-all font-medium w-full`}
                >
                  <Music className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">
                    {musicFileName ||
                      (isEdit && song?.fileUrl
                        ? "Thay đổi nhạc"
                        : "Chọn file mp3/wav")}
                  </span>
                  <input
                    type="file"
                    name="file"
                    accept={ALLOWED_AUDIO_TYPES.join(",")}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </label>
                <div className="flex justify-center mt-1">
                  <ErrorMessage error={validationErrors.file} />
                </div>

                {previewAudioUrl && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
                    <audio
                      controls
                      className="w-full h-8 outline-none"
                      src={previewAudioUrl}
                    ></audio>
                  </div>
                )}
              </div>
            </div>

            {/* CỘT PHẢI: THÔNG TIN BÀI HÁT */}
            <div className="md:col-span-2 flex flex-col">
              <div className="space-y-4">
                {/* Tên bài hát */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Tên bài hát <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={MAX_TITLE_LENGTH}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      validationErrors.title
                        ? "border-red-500"
                        : "border-gray-200"
                    } bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all`}
                    placeholder="Nhập tên bài hát..."
                    disabled={isSubmitting}
                  />
                  <ErrorMessage error={validationErrors.title} />
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">
                      Nghệ sĩ <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={artists.map((a) => ({
                        value: a._id || a.singerId,
                        label: a.name,
                      }))}
                      styles={customSelectStyles}
                      value={
                        artists.find(
                          (a) => (a._id || a.singerId) === formData.singerId,
                        )
                          ? {
                              value: formData.singerId,
                              label: artists.find(
                                (a) =>
                                  (a._id || a.singerId) === formData.singerId,
                              ).name,
                            }
                          : null
                      }
                      onChange={(opt) => {
                        setFormData({
                          ...formData,
                          singerId: opt ? opt.value : "",
                        });
                        if (validationErrors.singerId)
                          setValidationErrors({
                            ...validationErrors,
                            singerId: null,
                          });
                      }}
                      placeholder={
                        isLoadingData ? "Đang tải..." : "Chọn nghệ sĩ..."
                      }
                      isDisabled={isSubmitting || isLoadingData}
                      isClearable
                    />
                    <ErrorMessage error={validationErrors.singerId} />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">
                      Thể loại <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={genres.map((g) => ({
                        value: g._id || g.genreId,
                        label: g.name,
                      }))}
                      styles={customSelectStyles}
                      value={
                        genres.find(
                          (g) => (g._id || g.genreId) === formData.genreId,
                        )
                          ? {
                              value: formData.genreId,
                              label: genres.find(
                                (g) =>
                                  (g._id || g.genreId) === formData.genreId,
                              ).name,
                            }
                          : null
                      }
                      onChange={(opt) => {
                        setFormData({
                          ...formData,
                          genreId: opt ? opt.value : "",
                        });
                        if (validationErrors.genreId)
                          setValidationErrors({
                            ...validationErrors,
                            genreId: null,
                          });
                      }}
                      placeholder={
                        isLoadingData ? "Đang tải..." : "Chọn thể loại..."
                      }
                      isDisabled={isSubmitting || isLoadingData}
                      isClearable
                    />
                    <ErrorMessage error={validationErrors.genreId} />
                  </div>
                </div>

                {/* Ngày phát hành */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Ngày phát hành
                  </label>
                  <input
                    type="text"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleChange}
                    placeholder="dd/MM/yyyy"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      validationErrors.releaseDate
                        ? "border-red-500"
                        : "border-gray-200"
                    } bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all`}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage error={validationErrors.releaseDate} />
                </div>

                {/* Lời bài hát */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Lời bài hát
                    </label>
                    <button
                      type="button"
                      onClick={formatLyrics}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-md transition-colors font-medium border border-gray-200"
                    >
                      Định dạng nhanh
                    </button>
                  </div>
                  <textarea
                    ref={textareaRef}
                    name="lyric"
                    value={formData.lyric}
                    onChange={handleLyricChange}
                    className={`w-full min-h-[120px] px-4 py-3 rounded-xl border ${
                      validationErrors.lyric
                        ? "border-red-500"
                        : "border-gray-200"
                    } bg-white text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all`}
                    placeholder="Nhập lời bài hát (mỗi câu 1 dòng)..."
                    disabled={isSubmitting}
                  />
                  <ErrorMessage error={validationErrors.lyric} />
                </div>
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
                  disabled={isSubmitting || isLoadingData}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : isEdit ? (
                    "Lưu thay đổi"
                  ) : (
                    "Thêm bài hát"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SongForm;
