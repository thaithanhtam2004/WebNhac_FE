import React, { useState, useEffect } from "react";
import axios from "../../config/api";
import { Loader2, X } from "lucide-react";
import Pagination from "../../components/common/Pagination";

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ClassifySongEmotion() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [openSongId, setOpenSongId] = useState(null);
  const [songStates, setSongStates] = useState({}); // { file, predicting, result }

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // 🟢 Lấy danh sách bài hát kèm trạng thái đã phân tích
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/songs/with-feature/all", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
        }
      });

      // ép thêm field hasFeature cho chắc chắn
      setSongs(
        (res.data?.data || []).map((song) => ({
          ...song,
          hasFeature: !!song.hasFeature,
        }))
      );
      if (res.data?.pagination) {
        setTotalItems(res.data.pagination.total);
      } else {
        setTotalItems(res.data?.data?.length || 0);
      }

      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách bài hát");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [currentPage, debouncedSearch]);

  // Reset trang về 1 khi tìm kiếm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // 🧠 Hàm gọi API dự đoán cảm xúc
  const handlePredictEmotion = async (songId) => {
    const songState = songStates[songId];
    if (!songState?.file) return alert("Vui lòng chọn file nhạc để dự đoán!");

    const formData = new FormData();
    formData.append("file", songState.file);
    formData.append("songId", songId);

    // Bật trạng thái loading riêng từng bài
    setSongStates((prev) => ({
      ...prev,
      [songId]: { ...prev[songId], predicting: true },
    }));

    try {
      const res = await axios.post("/features/predict-emotion", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = res.data?.data;
      setSongStates((prev) => ({
        ...prev,
        [songId]: {
          ...prev[songId],
          predicting: false,
          result,
        },
      }));

      // Cập nhật lại trạng thái hasFeature của bài hát trong UI
      setSongs((prevSongs) =>
        prevSongs.map((s) =>
          s.songId === songId ? { ...s, hasFeature: true } : s
        )
      );

      alert(`🎭 Cảm xúc dự đoán: ${result?.emotion || "Không xác định"}`);
    } catch (err) {
      console.error("❌ Lỗi dự đoán:", err);
      alert("Không thể dự đoán cảm xúc!");
      setSongStates((prev) => ({
        ...prev,
        [songId]: { ...prev[songId], predicting: false },
      }));
    }
  };

  // Không cần lọc và cắt mảng trên FE vì đã có BE xử lý
  const startIndex = (currentPage - 1) * itemsPerPage;

  // 🧩 Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "—";
    }
  };

  return (
    <div className="relative pb-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
              Phân lớp bài hát
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Tìm kiếm bài hát..."
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-black text-sm placeholder-gray-400 font-medium text-black bg-transparent transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <div>
            Hiển thị <span className="text-gray-900">{songs.length}</span> /{" "}
            <span className="text-gray-900">{totalItems}</span> bài hát
          </div>
        </div>

        {/* Table container */}
        <div className="bg-white border border-gray-200 overflow-x-auto relative">
          <table className="min-w-full border-collapse">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="w-[60px] px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  NO.
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Tên bài hát
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Ca sĩ
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Thể loại
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Phát hành
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Đã phân tích
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Cảm xúc dự đoán
                </th>
                <th className="w-[180px] px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="px-6 py-24 text-center text-red-500 font-semibold text-sm">
                    {error}
                  </td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-900 font-bold text-lg mb-1">Không tìm thấy kết quả</p>
                      <p className="text-gray-500 text-sm">Không có bài hát nào khớp với tìm kiếm của bạn.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                songs.map((song, index) => {
                  const isExpanded = openSongId === song.songId;
                  const globalIndex = startIndex + index + 1;
                  return (
                    <React.Fragment key={song.songId}>
                      <tr className="hover:bg-gray-50 transition border-b border-gray-100 group">
                        <td className="px-4 py-4 text-center text-sm text-gray-500">
                          {globalIndex}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 truncate max-w-[200px]" title={song.title}>
                          {song.title || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[150px]" title={song.singerName}>
                          {song.singerName || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {song.genreName || "—"}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          {formatDate(song.releaseDate)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {song.hasFeature ? (
                            <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                              Đã phân tích
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {songStates[song.songId]?.result ? (
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-bold uppercase tracking-wider">
                              {songStates[song.songId].result.emotionName}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => setOpenSongId(isExpanded ? null : song.songId)}
                              className={`flex items-center justify-center gap-2 px-4 py-1.5 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 outline-none ${isExpanded
                                  ? "bg-gray-950 border-gray-950 text-white"
                                  : "border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
                                }`}
                            >
                              {isExpanded ? "Đóng lại" : "Dự đoán"}
                            </button>
                            {songStates[song.songId]?.predicting && (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* File upload expander */}
                      {isExpanded && (
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <td colSpan="8" className="px-8 py-6">
                            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 shadow-sm max-w-xl mx-auto flex flex-col gap-4">
                              <div className="flex flex-col gap-1">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                  Tải lên tệp âm thanh để phân tích
                                </h4>
                                <p className="text-xs text-gray-500">
                                  Chọn tệp nhạc `.mp3`, `.wav` hoặc `.flac` thuộc bài hát này để mô hình AI tiến hành dự đoán cảm xúc.
                                </p>
                              </div>

                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                <label className="flex-1 w-full flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 hover:bg-gray-100/50 cursor-pointer transition-colors group">
                                  <span className="text-xs font-medium text-gray-600 truncate max-w-[250px]">
                                    {songStates[song.songId]?.file
                                      ? songStates[song.songId].file.name
                                      : "Chưa chọn tệp tin..."}
                                  </span>
                                  <span className="text-xs font-bold uppercase text-gray-900 tracking-wider group-hover:text-black shrink-0">
                                    Chọn file
                                  </span>
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
                                  />
                                </label>

                                <button
                                  onClick={() => handlePredictEmotion(song.songId)}
                                  disabled={songStates[song.songId]?.predicting}
                                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white disabled:bg-gray-300 rounded-lg font-bold text-xs uppercase tracking-widest w-full sm:w-auto transition-colors"
                                >
                                  {songStates[song.songId]?.predicting ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Đang phân loại...
                                    </>
                                  ) : (
                                    "Phân loại cảm xúc"
                                  )}
                                </button>
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

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>
    </div>
  );
}