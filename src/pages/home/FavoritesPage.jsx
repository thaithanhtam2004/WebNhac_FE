import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { usePlayer } from "../../contexts/PlayerContext";
import { getUserFavorites } from "../../services/favoriteService";
import LikeButton from "../../components/user/LikeButton";
import PlayButton from "../../components/user/playButton";
import AddToPlaylistButton from "../../components/user/AddToPlaylistButton";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { currentTrack, isPlaying, play, pause } = usePlayer();

  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // 🔹 Load danh sách bài hát yêu thích
  useEffect(() => {
    if (!user?.userId) return;
    const fetchFavorites = async () => {
      try {
        const data = await getUserFavorites(user.userId);
        setFavoriteSongs(data);
        setFavoriteIds(data.map((s) => s.songId));
      } catch (err) {
        console.error("Lỗi lấy danh sách yêu thích:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user]);

  const filteredSongs =
    favoriteSongs?.filter((song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (!user)
    return (
      <p className="text-gray-400 text-center py-10">
        Vui lòng đăng nhập để xem bài hát yêu thích.
      </p>
    );

  if (loading)
    return (
      <p className="text-gray-400 text-center py-10">
        Đang tải danh sách yêu thích...
      </p>
    );

  return (
    <div className="flex flex-col gap-6 relative min-h-screen p-4 sm:p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
          Bài hát yêu thích
        </h1>

        {/* Search */}
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
          <p className="text-gray-400 text-center py-10">
            Không có bài hát yêu thích.
          </p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {filteredSongs.map((song) => (
              <li
                key={song.songId}
                className="flex items-center justify-between gap-4 py-3 px-3 rounded-lg hover:bg-[#2a2a2a] transition-all duration-300"
              >
                {/* Ảnh bìa */}
                <div className="w-14 h-14 flex-shrink-0">
                  <img
                    src={song.coverUrl || "/default-cover.jpg"}
                    alt={song.title}
                    className="w-full h-full rounded-md object-cover"
                  />
                </div>

                {/* Thông tin bài hát */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white truncate">
                    {song.title}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {song.singerName || song.artist}
                  </p>
                </div>

                {/* Nút điều khiển */}
                <div className="flex items-center gap-3">
                  {/* PlayButton */}
                  <PlayButton
                    variant="simple"
                    song={song}
                    isCurrent={currentTrack?.songId === song.songId}
                    isPlaying={currentTrack?.songId === song.songId && isPlaying}
                    onPlay={() =>
                      play({
                        songId: song.songId,
                        title: song.title,
                        artist: song.singerName || song.artist,
                        fileUrl: song.fileUrl,
                        coverUrl: song.coverUrl || "/default-cover.jpg",
                      })
                    }
                    onPause={pause}
                  />

                  {/* Thêm vào playlist */}
                  <AddToPlaylistButton song={song} />

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
