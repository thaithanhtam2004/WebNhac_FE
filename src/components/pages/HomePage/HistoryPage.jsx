import React, { useState, useEffect } from "react";
import { Clock, Play, ListPlus, Trash2, Search } from "lucide-react";
import { useAuth } from "../../providers/AuthContext";
import {
  getHistoryByUser,
  addHistorySong,
  removeHistorySong,
  clearHistory,
} from "../../services/historyService";

export default function HistoryPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [historySongs, setHistorySongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load lịch sử nghe
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const data = await getHistoryByUser(user.id);
        setHistorySongs(data);
      } catch (err) {
        console.error("Lấy lịch sử nghe thất bại:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  // 🔹 Xử lý Play bài hát
  const handlePlaySong = async (song) => {
    try {
      // TODO: play audio
      console.log("Playing:", song.title);

      // Lưu vào lịch sử
      if (user && user.id) {
        const savedSong = await addHistorySong({
          userId: user.id,
          songId: song.id,
        });

        // Cập nhật state ngay lập tức
        setHistorySongs((prev) => {
          const filtered = prev.filter((s) => s.id !== song.id);
          return [savedSong, ...filtered];
        });
      }
    } catch (err) {
      console.error("Lưu lịch sử nghe thất bại:", err);
    }
  };

  // ❌ Xóa 1 bài
  const handleDeleteSong = async (id) => {
    try {
      await removeHistorySong(id);
      setHistorySongs((prev) => prev.filter((song) => song.id !== id));
    } catch (err) {
      console.error("Xóa bài hát thất bại:", err);
    }
  };

  // ❌ Xóa tất cả
  const handleClearAll = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử nghe không?"))
      return;
    try {
      await clearHistory(user.id);
      setHistorySongs([]);
    } catch (err) {
      console.error("Xóa toàn bộ lịch sử thất bại:", err);
    }
  };

  // 🔍 Lọc bài hát
  const filteredSongs = historySongs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!user)
    return <p className="text-gray-400">Vui lòng đăng nhập để xem lịch sử.</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-7 h-7 text-cyan-400" />
          <h1 className="text-2xl font-bold text-cyan-400">
            Lịch sử nghe nhạc
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Tìm kiếm bài hát..."
              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Xóa tất cả
          </button>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/40 max-h-[520px] overflow-y-auto">
        {loading ? (
          <p className="text-gray-400 text-center py-10">Đang tải lịch sử...</p>
        ) : filteredSongs.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            Không có bài hát nào trong lịch sử.
          </p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {filteredSongs.map((song) => (
              <li
                key={song.id}
                className="flex items-center justify-between py-3 px-2 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold text-white">
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Nghe lần cuối: {formatDate(song.lastPlayed)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlaySong(song)}
                    className="p-2 bg-cyan-500/20 rounded-full hover:bg-cyan-500/40 transition"
                  >
                    <Play className="w-5 h-5 text-cyan-400" />
                  </button>
                  <button className="p-2 bg-pink-500/20 rounded-full hover:bg-pink-500/40 transition">
                    <ListPlus className="w-5 h-5 text-pink-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteSong(song.id)}
                    className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 transition"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
