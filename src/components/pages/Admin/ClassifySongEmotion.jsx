import { useState, useEffect } from "react";
import axios from "../../../configs/apiConfig";
import React from "react";
import { Music, Search, Upload, Sparkles, CheckCircle, Calendar, Mic2, FileMusic, AlertCircle, Loader2, Disc3 } from 'lucide-react';

export default function ClassifySongEmotion() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [songStates, setSongStates] = useState({});

  // 🔹 Load danh sách bài hát
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/songs/with-feature/all");
      const data = res.data?.data || [];

      setSongs(
        data.map((song) => ({
          ...song,
          hasFeature: !!song.hasFeature,
        }))
      );

      setError(null);
    } catch (err) {
      console.error("❌ Fetch songs error:", err);
      setError("Không thể tải danh sách bài hát");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // 🔹 Dự đoán cảm xúc
  const handlePredictEmotion = async (songId) => {
    const songState = songStates[songId];
    if (!songState?.file) {
      alert("Vui lòng chọn file nhạc để dự đoán!");
      return;
    }

    const formData = new FormData();
    formData.append("songId", songId);
    formData.append("file", songState.file);

    setSongStates((prev) => ({
      ...prev,
      [songId]: { ...prev[songId], predicting: true },
    }));

    try {
      const res = await axios.post("/features/predict-emotion", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = res.data?.data;
      await fetchSongs();

      alert(
        `🎭 Cảm xúc dự đoán: ${
          result?.emotionName || result?.emotion || "Không xác định"
        }`
      );
    } catch (err) {
      console.error("❌ Predict emotion error:", err);
      alert("Không thể dự đoán cảm xúc!");
    } finally {
      setSongStates((prev) => ({
        ...prev,
        [songId]: { ...prev[songId], predicting: false },
      }));
    }
  };

  // 🔍 Tìm kiếm
  const filteredSongs = songs.filter((s) =>
    (s?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  // 📅 Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const [year, month, day] = String(dateString)
        .substring(0, 10)
        .split("-");
      return `${day}/${month}`;
    } catch {
      return "—";
    }
  };

  // Emotion colors
  const getEmotionStyle = (emotionName) => {
    const styles = {
      'Vui vẻ': 'bg-yellow-100 text-yellow-700',
      'Buồn': 'bg-blue-100 text-blue-700',
      'Phấn khích': 'bg-red-100 text-red-700',
      'Thư giãn': 'bg-green-100 text-green-700',
      'Mạnh mẽ': 'bg-purple-100 text-purple-700',
    };
return styles[emotionName] || 'bg-indigo-100 text-indigo-700';
  };

  const stats = {
    total: songs.length,
    analyzed: songs.filter(s => s.hasFeature).length,
    classified: songs.filter(s => s.emotionName).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                Phân loại cảm xúc bài hát
              </h1>
              <p className="text-slate-600 text-xs lg:text-sm mt-0.5">
                Phân tích và dự đoán cảm xúc của bài hát bằng AI
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-lg p-3 lg:p-4 shadow-md border border-slate-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-600 mb-0.5">Tổng số</p>
                <p className="text-xl lg:text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileMusic className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 lg:p-4 shadow-md border border-slate-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-600 mb-0.5">Đã phân tích</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">{stats.analyzed}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 lg:p-4 shadow-md border border-slate-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-600 mb-0.5">Đã phân loại</p>
                <p className="text-xl lg:text-2xl font-bold text-purple-600">{stats.classified}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
              </div>
            </div>
          </div>
</div>

        {/* Search Bar */}
        <div className="mb-5 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm bài hát..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all text-sm"
          />
        </div>

        {/* Table Container - NO SCROLL */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200">
          <div className="w-full">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-slate-200">
                  <th className="w-[8%] px-2 py-3 text-center text-xs font-semibold text-slate-700">
                    #
                  </th>
                  <th className="w-[25%] px-2 py-3 text-left text-xs font-semibold text-slate-700">
                    Bài hát
                  </th>
                  <th className="w-[17%] px-2 py-3 text-left text-xs font-semibold text-slate-700 hidden lg:table-cell">
                    Ca sĩ
                  </th>
                  <th className="w-[12%] px-2 py-3 text-center text-xs font-semibold text-slate-700 hidden xl:table-cell">
                    Ngày
                  </th>
                  <th className="w-[15%] px-2 py-3 text-center text-xs font-semibold text-slate-700">
                    Cảm xúc
                  </th>
                  <th className="w-[23%] px-2 py-3 text-center text-xs font-semibold text-slate-700">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                        <p className="text-slate-600 text-sm font-medium">
                          Đang tải...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-red-100 rounded-full">
                          <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-red-600 text-sm font-medium">{error}</p>
<button
                          onClick={fetchSongs}
                          className="mt-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Thử lại
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredSongs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-100 rounded-full">
                          <Music className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                          {search ? "Không tìm thấy" : "Chưa có bài hát"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSongs.map((song, index) => (
                    <tr
                      key={song.songId}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td className="px-2 py-3 text-center">
                        <span className="text-xs font-medium text-slate-500">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                            <Disc3 className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-800 truncate">
                              {song.title || "—"}
                            </p>
                            <p className="text-xs text-slate-500 truncate lg:hidden">
                              {song.singerName || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 hidden lg:table-cell">
                        <p className="text-xs text-slate-600 truncate">
                          {song.singerName || "—"}
                        </p>
                      </td>
                      <td className="px-2 py-3 text-center hidden xl:table-cell">
                        <span className="text-xs font-mono text-slate-600">
                          {formatDate(song.releaseDate)}
                        </span>
                      </td>
                      <td className="px-2 py-3">
<div className="flex items-center justify-center gap-1">
                          {song.hasFeature && (
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          )}
                          {song.emotionName ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getEmotionStyle(song.emotionName)}`}>
                              {song.emotionName}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Chưa có
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-col gap-1.5">
                          {/* File Upload */}
                          <label className="relative cursor-pointer">
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              onChange={(e) =>
                                setSongStates((prev) => ({
                                  ...prev,
                                  [song.songId]: {
                                    ...prev[song.songId],
                                    file: e.target.files[0],
                                  },
                                }))
                              }
                            />
                            <div className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-150">
                              <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-xs font-medium truncate">
                                {songStates[song.songId]?.file
                                  ? "Đã chọn"
                                  : "Chọn file"}
                              </span>
                            </div>
                          </label>

                          {/* Predict Button */}
                          <button
                            onClick={() => handlePredictEmotion(song.songId)}
                            disabled={songStates[song.songId]?.predicting}
                            className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all duration-150 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {songStates[song.songId]?.predicting ? (
                              <>
<Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                                <span className="text-xs font-medium">Xử lý...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="text-xs font-medium">Dự đoán</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        {filteredSongs.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 px-2">
            <div className="flex items-center gap-4">
              <span>
                Hiển thị: <strong className="text-slate-800">{filteredSongs.length}</strong>
              </span>
              {search && (
                <span className="text-indigo-600 truncate max-w-[200px]">
                  "{search}"
                </span>
              )}
            </div>
            <span>
              Phân loại: <strong className="text-purple-600">
                {stats.total > 0 ? Math.round((stats.classified / stats.total) * 100) : 0}%
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}