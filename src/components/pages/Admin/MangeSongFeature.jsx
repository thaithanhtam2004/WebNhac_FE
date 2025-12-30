import { useState, useEffect, useMemo, useCallback } from "react";
import { Brain, Music, CheckCircle, AlertCircle, Upload, Loader2, Filter, ArrowUpDown, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import axios from "../../../configs/apiConfig";
import Pagination from "../../elements/Pagination";
import React from "react";

// ✅ Custom hook for debounced value
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function ManageSongFeature() {
  // === State Management ===
  const [songs, setSongs] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Separate search term and debounced search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const [currentPage, setCurrentPage] = useState(1);
  
  // ✅ Filter and sort states
  const [filterStatus, setFilterStatus] = useState(""); // all, analyzed, not-analyzed
  const [filterEmotion, setFilterEmotion] = useState("");
  const [sortBy, setSortBy] = useState(""); // title, releaseDate
  const [sortOrder, setSortOrder] = useState("asc");

  const [openSongId, setOpenSongId] = useState(null);
  const [songStates, setSongStates] = useState({});

  // === Constants ===
  const itemsPerPage = 10;

  // === Data Fetching ===

  // 🟢 Fetch songs list
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/songs/with-feature/all");
      setSongs(
        (res.data?.data || []).map((song) => ({
          ...song,
          hasFeature: song.hasFeature ? true : false,
        }))
      );
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách bài hát");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Fetch emotions list
  const fetchEmotions = async () => {
    try {
      const res = await axios.get("/emotions");
      setEmotions(res.data?.data || []);
    } catch (err) {
      console.error("Lỗi khi tải cảm xúc:", err);
    }
  };

  useEffect(() => {
    fetchSongs();
    fetchEmotions();
  }, []);

  // ✅ Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterStatus, filterEmotion, sortBy, sortOrder]);

  // === Event Handlers ===

  // 🟢 Analyze individual song
  const handleAnalyzeAndAssign = async (songId) => {
    const songState = songStates[songId];
    if (!songState?.file) {
      alert("Vui lòng chọn file nhạc!");
      return;
    }
    if (!songState?.emotionId) {
      alert("Vui lòng chọn cảm xúc!");
      return;
    }

    const formData = new FormData();
    formData.append("songId", songId);
    formData.append("emotionId", songState.emotionId);
    formData.append("file", songState.file);

    // Enable spinner for this song
    setSongStates((prev) => ({
      ...prev,
      [songId]: { ...prev[songId], saving: true },
    }));

    try {
      await axios.post("/features/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Phân tích & gán cảm xúc thành công!");

      // ✅ Update hasFeature in state
      setSongs((prevSongs) =>
        prevSongs.map((s) =>
          s.songId === songId ? { ...s, hasFeature: true } : s
        )
      );

      // Reset songStates
      setSongStates((prev) => ({
        ...prev,
        [songId]: { file: null, emotionId: null, saving: false },
      }));

      setOpenSongId(null);
    } catch (err) {
      console.error("❌ Lỗi phân tích:", err);
      alert(err.response?.data?.message || "Không thể phân tích hoặc gán cảm xúc!");
      setSongStates((prev) => ({
        ...prev,
        [songId]: { ...prev[songId], saving: false },
      }));
    }
  };

  const handleToggleAnalyzePanel = useCallback((songId) => {
    setOpenSongId((prev) => (prev === songId ? null : songId));
  }, []);

  // ✅ Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterEmotion("");
    setSortBy("");
    setSortOrder("asc");
  }, []);

  // ✅ Statistics
  const stats = useMemo(() => {
    const total = songs.length;
    const analyzed = songs.filter((s) => s.hasFeature).length;
    const notAnalyzed = total - analyzed;
    const percentage = total > 0 ? Math.round((analyzed / total) * 100) : 0;
    return { total, analyzed, notAnalyzed, percentage };
  }, [songs]);

  // ✅ Optimized filtering and sorting with useMemo
  const filteredAndSortedSongs = useMemo(() => {
    let result = songs.filter((song) => {
      const matchSearch = (song?.title || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

      const matchStatus =
        !filterStatus ||
        (filterStatus === "analyzed" && song.hasFeature) ||
        (filterStatus === "not-analyzed" && !song.hasFeature);

      const matchEmotion = 
        !filterEmotion || song.emotionId === filterEmotion;

      return matchSearch && matchStatus && matchEmotion;
    });

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let aVal, bVal;

        switch (sortBy) {
          case "title":
            aVal = (a.title || "").toLowerCase();
            bVal = (b.title || "").toLowerCase();
            break;
          case "releaseDate":
            aVal = new Date(a.releaseDate || 0).getTime();
            bVal = new Date(b.releaseDate || 0).getTime();
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [songs, debouncedSearch, filterStatus, filterEmotion, sortBy, sortOrder]);

  // ✅ Optimized pagination with useMemo
  const currentSongs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSongs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedSongs, currentPage, itemsPerPage]);

  // ✅ Toggle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // === Helper Functions ===

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const [year, month, day] = String(dateString).substring(0, 10).split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return "—";
    }
  };

  return (
    <div className="p-8 relative bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            Phân tích đặc trưng bài hát
          </h1>

          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm bài hát..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80 shadow-sm"
            />
          </div>
        </div>

        {/* ✅ Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">Tổng bài hát</p>
                <p className="text-4xl font-bold text-purple-700 mt-1">{stats.total}</p>
              </div>
              <Music className="w-14 h-14 text-purple-400 opacity-40" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-semibold uppercase tracking-wide">Đã phân tích</p>
                <p className="text-4xl font-bold text-green-700 mt-1">{stats.analyzed}</p>
              </div>
              <CheckCircle className="w-14 h-14 text-green-400 opacity-40" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">Chưa phân tích</p>
                <p className="text-4xl font-bold text-orange-700 mt-1">{stats.notAnalyzed}</p>
              </div>
              <AlertCircle className="w-14 h-14 text-orange-400 opacity-40" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Tiến độ</p>
                <p className="text-4xl font-bold text-blue-700 mt-1">{stats.percentage}%</p>
              </div>
              <TrendingUp className="w-14 h-14 text-blue-400 opacity-40" />
            </div>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* ✅ Filter and Sort Section */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Filter className="w-5 h-5 text-purple-600" />
            <span className="text-sm">Bộ lọc:</span>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
          >
            <option value="">📋 Tất cả trạng thái</option>
            <option value="analyzed">✅ Đã phân tích</option>
            <option value="not-analyzed">⏳ Chưa phân tích</option>
          </select>

          <select
            value={filterEmotion}
            onChange={(e) => setFilterEmotion(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
          >
            <option value="">💭 Tất cả cảm xúc</option>
            {emotions.map((emotion) => (
              <option key={emotion.emotionId} value={emotion.emotionId}>
                {emotion.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-4">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
            >
              <option value="">🔄 Sắp xếp theo</option>
              <option value="title">📝 Tên bài hát</option>
              <option value="releaseDate">📅 Ngày phát hành</option>
            </select>

            {sortBy && (
              <button
                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium bg-white"
              >
                {sortOrder === "asc" ? "⬆️ Tăng dần" : "⬇️ Giảm dần"}
              </button>
            )}
          </div>

          {(searchTerm || filterStatus || filterEmotion || sortBy) && (
            <button
              onClick={handleClearFilters}
              className="ml-auto px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition text-sm font-medium shadow-sm"
            >
              ✖️ Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-700 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 inline-block">
          Hiển thị <span className="font-bold text-purple-600">{currentSongs.length}</span> / {" "}
          <span className="font-bold text-purple-600">{filteredAndSortedSongs.length}</span> bài hát
          {songs.length !== filteredAndSortedSongs.length && (
            <span className="text-gray-500"> (từ tổng {songs.length})</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <tr>
                <th className="w-[60px] px-4 py-4 text-center text-sm font-bold">
                  STT
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-2 hover:text-purple-200 transition"
                  >
                    Tên bài hát
                    {sortBy === "title" && (
                      <span className="text-xs">{sortOrder === "asc" ? "⬆️" : "⬇️"}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold">
                  Ca sĩ
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold">
                  Thể loại
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold">
                  <button
                    onClick={() => handleSort("releaseDate")}
                    className="flex items-center gap-2 hover:text-purple-200 transition mx-auto"
                  >
                    Ngày phát hành
                    {sortBy === "releaseDate" && (
                      <span className="text-xs">{sortOrder === "asc" ? "⬆️" : "⬇️"}</span>
                    )}
                  </button>
                </th>
                <th className="w-[140px] px-6 py-4 text-center text-sm font-bold">
                  Trạng thái
                </th>
                <th className="w-[140px] px-6 py-4 text-center text-sm font-bold">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-600" />
                    <p className="text-gray-600 mt-3 font-medium">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-red-500 font-medium">
                    ❌ {error}
                  </td>
                </tr>
              ) : currentSongs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-600">
                    {debouncedSearch || filterStatus || filterEmotion ? (
                      <div className="space-y-3">
                        <AlertCircle className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-lg font-medium">Không tìm thấy kết quả</p>
                        <button
                          onClick={handleClearFilters}
                          className="text-purple-600 hover:text-purple-800 underline font-medium"
                        >
                          Xóa bộ lọc và thử lại
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Music className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-lg font-medium">Không có dữ liệu</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                currentSongs.map((song, index) => {
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const isOpen = openSongId === song.songId;
                  const isSaving = songStates[song.songId]?.saving;

                  return (
                    <React.Fragment key={song.songId}>
                      <tr className="hover:bg-purple-50 transition-colors">
                        <td className="px-4 py-4 text-center text-gray-700 font-medium">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-semibold truncate max-w-[250px]">
                          {song.title || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-700 truncate max-w-[150px]">
                          {song.singerName || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-700 truncate max-w-[120px]">
                          {song.genreName || "—"}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700 whitespace-nowrap">
                          {formatDate(song.releaseDate)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              song.hasFeature
                                ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-green-300"
                                : "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border border-orange-300"
                            }`}
                          >
                            {song.hasFeature ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Đã phân tích
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                Chưa phân tích
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleAnalyzePanel(song.songId)}
                            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 mx-auto font-medium shadow-sm ${
                              isOpen
                                ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700"
                                : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                            }`}
                            disabled={isSaving}
                          >
                            {isOpen ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Đóng
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4" />
                                Phân tích
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* ✅ Enhanced Analyze Panel */}
                      {isOpen && (
                        <tr className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
                          <td colSpan="7" className="px-6 py-6">
                            <div className="bg-white p-6 rounded-xl border-2 border-purple-300 shadow-lg">
                              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                                  <Brain className="w-5 h-5 text-white" />
                                </div>
                                Phân tích cảm xúc: <span className="text-purple-600">{song.title}</span>
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* File Upload */}
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    File nhạc <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="file"
                                      accept=".mp3,.wav,.flac"
                                      onChange={(e) =>
                                        setSongStates((prev) => ({
                                          ...prev,
                                          [song.songId]: {
                                            ...prev[song.songId],
                                            file: e.target.files[0],
                                          },
                                        }))
                                      }
                                      className="hidden"
                                      id={`file-${song.songId}`}
                                    />
                                    <label
                                      htmlFor={`file-${song.songId}`}
                                      className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                                    >
                                      <Upload className="w-5 h-5 text-purple-500" />
                                      <span className="text-sm font-medium text-gray-700">
                                        {songStates[song.songId]?.file?.name || "📁 Chọn file nhạc"}
                                      </span>
                                    </label>
                                  </div>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    MP3, WAV, FLAC (tối đa 50MB)
                                  </p>
                                </div>

                                {/* Emotion Select */}
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Cảm xúc <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={songStates[song.songId]?.emotionId || ""}
                                    onChange={(e) =>
                                      setSongStates((prev) => ({
                                        ...prev,
                                        [song.songId]: {
                                          ...prev[song.songId],
                                          emotionId: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                                  >
                                    <option value="">💭 Chọn cảm xúc</option>
                                    {emotions.map((e) => (
                                      <option key={e.emotionId} value={e.emotionId}>
                                        {e.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Action Button */}
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Thực hiện
                                  </label>
                                  <button
                                    onClick={() => handleAnalyzeAndAssign(song.songId)}
                                    disabled={isSaving}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold shadow-md"
                                  >
                                    {isSaving ? (
                                      <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang phân tích...
                                      </>
                                    ) : (
                                      <>
                                        <Brain className="w-5 h-5" />
                                        🚀 Phân tích AI
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Instructions */}
                              <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                                <p className="text-sm text-blue-800 flex items-start gap-3">
                                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                                  <span>
                                    <strong className="font-bold">💡 Hướng dẫn:</strong> Upload file nhạc và chọn cảm xúc phù hợp. 
                                    Hệ thống AI sẽ phân tích các đặc trưng âm thanh (tempo, pitch, energy, spectral features) 
                                    để tạo fingerprint độc đáo cho bài hát.
                                  </span>
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredAndSortedSongs.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredAndSortedSongs.length}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}