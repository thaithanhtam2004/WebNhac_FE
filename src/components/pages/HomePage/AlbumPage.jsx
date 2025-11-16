import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

// Components
import PlayButton from "../../elements/playButton";
import LikeButton from "../../elements/LikeButton";
import AddToPlaylistButton from "../../elements/AddToPlaylistButton";

// Contexts
import { useAuth } from "../../providers/AuthContext";
import { usePlayer } from "../../providers/PlayerContext";

// Services
import { getAlbumById } from "../../../services/albumService";
import { getSongsOfAlbum } from "../../../services/albumSongService";
import { getUserFavorites } from "../../../services/favoriteService";
import { addHistorySong } from "../../../services/historyService";

export default function AlbumPage() {
  const { albumId } = useParams();
  const { user } = useAuth();
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Lấy album + bài hát
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const alb = await getAlbumById(albumId);
        setAlbum(alb || null);

        const songsData = await getSongsOfAlbum(albumId);
        setSongs(songsData || []);
      } catch (err) {
        console.error("Lỗi tải album hoặc bài hát:", err);
        toast.error("Không thể tải album!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [albumId]);

  // Lấy danh sách favorite
  useEffect(() => {
    if (!user) return;
    getUserFavorites(user.userId)
      .then((f) => setFavoriteIds(f.map((item) => item.songId)))
      .catch(console.error);
  }, [user]);

  // Lưu lịch sử nghe sau 1/3 thời lượng
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentTrack || !audio) return;

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

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    play(songs[0]);
    toast(`▶️ Đang phát tất cả: ${album?.title}`, { icon: "🎵" });
  };

  // Helper: Extract year from date
  const getYear = (dateString) => {
    if (!dateString) return "N/A";
    return dateString.split("-")[0];
  };

  if (loading)
    return <p className="text-white text-center mt-10">Đang tải album...</p>;
  if (!album)
    return <p className="text-white text-center mt-10">Album không tồn tại.</p>;

  return (
    <div className="flex gap-6 p-6">
      {/* Cột trái: ảnh + info */}
      <div className="flex flex-col gap-4 w-64">
        <img
          src={album.coverUrl || "/default-cover.jpg"}
          alt={album.title}
          className="w-full h-64 rounded-xl object-cover shadow-lg"
        />
        <button
          onClick={handlePlayAll}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg w-full hover:bg-cyan-500/40 transition"
        >
          Phát tất cả
        </button>
        <h2 className="text-2xl font-bold text-white">{album.title}</h2>
        <p className="text-gray-400">{album.artist}</p>
        <p className="text-gray-400">Số bài hát: {songs.length}</p>
        <p className="text-gray-400">
          Năm phát hành: {getYear(album.releaseDate)}
        </p>
      </div>

      {/* Cột phải: danh sách bài hát */}
      <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/40 max-h-[520px] overflow-y-auto">
        {songs.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            Chưa có bài hát nào.
          </p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {songs.map((song, index) => (
              <li
                key={song.songId}
                className="flex items-center justify-between py-3 px-2 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-gray-400">{index + 1}</span>
                  <img
                    src={song.coverUrl || "/default-cover.jpg"}
                    alt={song.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold text-white">
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-400">
                      {song.singerName || song.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Play button */}
                  <PlayButton
                    variant="simple"
                    song={song}
                    isCurrent={currentTrack?.songId === song.songId}
                    isPlaying={
                      currentTrack?.songId === song.songId && isPlaying
                    }
                    onPlay={() => play(song)}
                    onPause={() => pause()}
                  />

                  {/* Add to Playlist */}
                  <AddToPlaylistButton song={song} />

                  {/* Like button */}
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