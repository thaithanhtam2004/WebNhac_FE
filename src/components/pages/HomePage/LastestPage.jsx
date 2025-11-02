import React, { useState, useEffect } from "react";
import { Clock, Plus, Search } from "lucide-react";
import { useGetSongByReleaseDate } from "../../../hooks/useGetSongByReleaseDate";
import LikeButton from "../../elements/LikeButton";
import PlayButton from "../../elements/playButton";
import { useAuth } from "../../providers/AuthContext";
import { getUserFavorites } from "../../../services/favoriteService";
import { addHistorySong } from "../../../services/historyService";
import { usePlayer } from "../../providers/PlayerContext"; // ✅ player global

export default function LatestSongsPage() {
  const { data: latestSongs, loading, error } = useGetSongByReleaseDate();
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState([]);

  // ✅ Lấy player global
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();

  // ❤️ Lấy danh sách favorite
  useEffect(() => {
    if (!user) return;
    getUserFavorites(user.userId)
      .then(f => setFavoriteIds(f.map(item => item.songId)))
      .catch(err => console.error("Lỗi lấy favorites:", err));
  }, [user]);

  // 🟢 Lưu lịch sử nghe sau 1/3 thời lượng
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentTrack) return;

    const handleTimeUpdate = () => {
      if (!user) return;
      if (audio.currentTime >= audio.duration / 3) {
        addHistorySong({ userId: user.userId, songId: currentTrack.songId });
        audio.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [currentTrack, user, audioRef]);

  const filteredSongs =
    latestSongs?.filter(song =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const formatDate = iso => {
    if (!iso) return "Chưa nghe";
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading)
    return <p className="text-gray-400 text-center py-10">Đang tải bài hát mới...</p>;
  if (error)
    return <p className="text-red-400 text-center py-10">Lỗi khi tải bài hát: {error}</p>;

  return (
    <div className="flex flex-col gap-6 relative min-h-screen p-4 sm:p-6 text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-7 h-7 text-cyan-400" />
          <h1 className="text-2xl font-bold">Bài hát mới nhất</h1>
        </div>

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
      </div>

      {/* Song list */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/40 max-h-[520px] overflow-y-auto">
        {filteredSongs.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Không có bài hát mới nào.</p>
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
                    <p className="text-sm text-gray-400">{song.singerName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Nghe lần cuối: {formatDate(song.lastPlayed)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  
                  {/* ✅ FIXED PlayButton */}
                  <PlayButton
                    variant="simple"
                    song={song}
                    isCurrent={currentTrack?.songId === song.songId}
                    isPlaying={currentTrack?.songId === song.songId && isPlaying}
                    onPlay={() => play(song)}
                    onPause={() => pause()}
                  />

                  <button
                    className="p-2 hover:bg-green-600/30 rounded transition"
                    onClick={() => alert(`🎵 Đã thêm "${song.title}" vào playlist`)}
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>

                  <LikeButton
                    userId={user?.userId}
                    songId={song.songId}
                    initialLiked={favoriteIds.includes(song.songId)}
                    onChange={(newLiked) =>
                      setFavoriteIds(prev =>
                        newLiked
                          ? [...prev, song.songId]
                          : prev.filter(id => id !== song.songId)
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
