import React, { useState, useEffect } from "react";
import { Clock, Plus, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getHistoryByUser,
  deleteHistorySong,
  clearAllHistory,
} from "../../services/historyService";
import LikeButton from "../../components/user/LikeButton";
import PlayButton from "../../components/user/playButton";
import { usePlayer } from "../../contexts/PlayerContext";
import { getUserFavorites } from "../../services/favoriteService";

export default function HistoryPage() {
  const { user } = useAuth();
  const { currentTrack, isPlaying, play, pause } = usePlayer();

  const [searchTerm, setSearchTerm] = useState("");
  const [historySongs, setHistorySongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Quản lý danh sách bài hát đã like
  const [favoriteIds, setFavoriteIds] = useState([]);

  // 🔹 Load history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.userId) return;

      try {
        const data = await getHistoryByUser(user.userId);
        setHistorySongs(data);
      } catch (err) {
        console.error("Lấy lịch sử nghe thất bại:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  // 🔹 Load favorite songs
  useEffect(() => {
    if (!user?.userId) return;
    getUserFavorites(user.userId)
      .then((favs) => setFavoriteIds(favs.map((s) => s.songId)))
      .catch((err) => console.error("Lỗi lấy favorites:", err));
  }, [user]);

  // 🔹 Delete 1 song
  const handleDeleteSong = async (songId) => {
    try {
      await deleteHistorySong({ userId: user.userId, songId });
      setHistorySongs((prev) => prev.filter((s) => s.songId !== songId));
    } catch (err) {
      console.error("Xóa bài hát thất bại:", err);
    }
  };

  // 🔹 Clear all history
  const handleClearAll = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử nghe không?"))
      return;

    try {
      await clearAllHistory(user.userId);
      setHistorySongs([]);
    } catch (err) {
      console.error("Xóa toàn bộ lịch sử thất bại:", err);
    }
  };

  const filteredSongs =
    historySongs?.filter((song) =>
      song.title?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const formatDate = (iso) => {
    if (!iso) return "Chưa nghe";
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!user)
    return (
      <p className="text-gray-400 text-center py-10">
        Vui lòng đăng nhập để xem lịch sử.
      </p>
    );

  if (loading)
    return (
      <p className="text-gray-400 text-center py-10">
        Đang tải lịch sử nghe...
      </p>
    );

  return (
    <div className="flex flex-col gap-6 relative min-h-screen p-4 sm:p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Lịch sử nghe</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Tìm kiếm bài hát..."
              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-all"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      {/* Song list */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/40 max-h-[520px] overflow-y-auto">
        {filteredSongs.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Chưa có lịch sử nghe.</p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {filteredSongs.map((song) => (
              <li
                key={song.songId}
                className="flex items-center justify-between py-3 px-2 hover:bg-[#2a2a2a] rounded-lg transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={song.coverUrl || "/default-cover.jpg"}
                    alt={song.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold">{song.title}</p>
                    <p className="text-sm text-gray-400">
                      {song.singerName || song.artist}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Nghe lần cuối: {formatDate(song.lastListenedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* PlayButton */}
                  <PlayButton
                    variant="simple"
                    song={song}
                    isCurrent={currentTrack?.songId === song.songId}
                    isPlaying={currentTrack?.songId === song.songId && isPlaying}
                    onPlay={() => {
                      if (!song.fileUrl) return;
                      play({
                        songId: song.songId,
                        title: song.title,
                        artist: song.singerName || song.artist,
                        fileUrl: song.fileUrl,
                        coverUrl: song.coverUrl || "/default-cover.jpg",
                      });
                    }}
                    onPause={pause}
                  />

                  {/* Thêm vào playlist */}
                  <button
                    className="p-2 hover:bg-green-600/30 rounded transition"
                    onClick={() => alert(`🎵 Đã thêm "${song.title}" vào playlist`)}
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>

                  {/* LikeButton */}
                  <LikeButton
                    userId={user?.userId}
                    songId={song.songId}
                    initialLiked={favoriteIds.includes(song.songId)}
                    onChange={(newLiked) =>
                      setFavoriteIds((prev) =>
                        newLiked
                          ? [...prev, song.songId]
                          : prev.filter((id) => id !== song.songId)
                      )
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
