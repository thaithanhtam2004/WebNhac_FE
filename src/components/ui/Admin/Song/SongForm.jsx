import { X, FileText, Eye, Edit3 } from "lucide-react";
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

  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);

  // Lyrics editor states
  const [lyricTab, setLyricTab] = useState("edit"); // 'edit' | 'preview'
  const textareaRef = useRef(null);

  // Fetch artists, genres, albums
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
        setArtists([]);
        setGenres([]);
        setAlbums([]);
      }
    };
    fetchData();
  }, []);

  // Load song data when editing
  useEffect(() => {
    if (isEdit && song) {
      let formattedDate = song.releaseDate ? String(song.releaseDate).substring(0, 10) : "";
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

      // Auto resize textarea
      setTimeout(() => {
        if (textareaRef.current && lyricValue) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 400) + "px";
        }
      }, 100);
    }
  }, [isEdit, song]);

  // Handlers
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLyricChange = (e) => {
    setFormData({ ...formData, lyric: e.target.value });
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
      onError?.("Chỉ chấp nhận file .txt");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({ ...formData, lyric: event.target.result });
      setLyricTab("edit");

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 400) + "px";
        }
      }, 0);
    };
    reader.onerror = () => onError?.("Lỗi khi đọc file");
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files[0]) return;

    setFormData({ ...formData, [name]: files[0] });
    if (name === "file") setMusicFileName(files[0].name);
    if (name === "cover") setCoverFileName(files[0].name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return onError?.("Vui lòng nhập tên bài hát!");
    if (!formData.singerId) return onError?.("Vui lòng chọn nghệ sĩ!");
    if (!formData.genreId) return onError?.("Vui lòng chọn thể loại!");
    if (!isEdit && !formData.file) return onError?.("Vui lòng chọn file nhạc!");

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
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
      onError?.(err.response?.data?.message || "Lỗi khi lưu bài hát!");
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
      borderRadius: 8,
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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
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
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
              placeholder="Nhập tên bài hát..."
              required
              disabled={isSubmitting}
            />
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
                onChange={(opt) => setFormData({ ...formData, singerId: opt ? opt.value : "" })}
                placeholder="Chọn nghệ sĩ..."
                isClearable
                isDisabled={isSubmitting}
              />
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
                onChange={(opt) => setFormData({ ...formData, genreId: opt ? opt.value : "" })}
                placeholder="Chọn thể loại..."
                isClearable
                isDisabled={isSubmitting}
              />
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
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white focus:ring-2 focus:ring-white focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Lời bài hát */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-300">Lời bài hát</label>
              <span className="text-xs text-gray-500">{formData.lyric?.length || 0} ký tự</span>
            </div>

            {/* Toolbar */}
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

            {/* Editor / Preview */}
            {lyricTab === "edit" ? (
              <textarea
                ref={textareaRef}
                name="lyric"
                value={formData.lyric}
                onChange={handleLyricChange}
                className="w-full min-h-[200px] max-h-[400px] px-3 py-2 rounded-lg border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-white focus:outline-none overflow-y-auto"
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
          </div>

          {/* Upload file nhạc & ảnh bìa */}
          <div className="grid grid-cols-2 gap-4">
            {/* File nhạc */}
            <div>
              <label className="block mb-1 text-sm text-gray-300">
                File nhạc {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <label className="flex items-center justify-center px-3 py-2 bg-white text-black hover:bg-gray-200 rounded-lg cursor-pointer text-sm transition">
                Chọn file
                <input
                  type="file"
                  name="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileChange}
                  required={!isEdit}
                  disabled={isSubmitting}
                />
              </label>

              {musicFileName && (
                <p className="text-xs text-gray-400 mt-1 truncate" title={musicFileName}>
                  📁 {musicFileName}
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
            </div>

            {/* Ảnh bìa */}
            <div>
              <label className="block mb-1 text-sm text-gray-300">Ảnh bìa</label>
              <label className="flex items-center justify-center px-3 py-2 bg-white text-black hover:bg-gray-200 rounded-lg cursor-pointer text-sm transition">
                Chọn ảnh
                <input
                  type="file"
                  name="cover"
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
