import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import AddToPlaylistButton from "../../components/user/AddToPlaylistButton";
import LikeButton from "../../components/user/LikeButton";
import PlayButton from "../../components/user/playButton";
import { useAuth } from "../../contexts/AuthContext";
import { usePlayer } from "../../contexts/PlayerContext";
import { getUserFavorites } from "../../services/favoriteService";
import { addHistorySong } from "../../services/historyService";
import { getPlaylistById, getSongsOfPlaylist } from "../../services/playlistService";

export default function PlaylistPage() {
  const { playlistId } = useParams();
  const { user } = useAuth();
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Lấy playlist + bài hát
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pl = await getPlaylistById(playlistId);
        setPlaylist(pl || null);

        const songsData = await getSongsOfPlaylist(playlistId);
        setSongs(songsData || []);
      } catch (err) {
        console.error("Lỗi tải playlist hoặc bài hát:", err);
        toast.error("Không thể tải playlist!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [playlistId]);

  // Lấy danh sách favorite
  useEffect(() => {
    if (!user) return;
    getUserFavorites(user.userId)
      .then(f => setFavoriteIds(f.map(item => item.songId)))
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
    toast(`▶️ Đang phát tất cả: ${playlist.name}`, { icon: "🎵" });
  };

  if (loading) return <p className="text-white text-center mt-10">Đang tải playlist...</p>;
  if (!playlist) return <p className="text-white text-center mt-10">Playlist không tồn tại.</p>;

  return (
    <div className="flex gap-6 p-6">
      {/* Cột trái: ảnh + info */}
      <div className="flex flex-col gap-4 w-64">
        <img
          src={playlist.coverUrl || `/default-cover.jpg`}
          alt={playlist.name}
          className="w-full h-64 rounded-xl object-cover shadow-lg"
        />
        <button
          onClick={handlePlayAll}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg w-full hover:bg-cyan-500/40 transition"
        >
          Phát tất cả
        </button>
        <h2 className="text-2xl font-bold text-white">{playlist.name}</h2>
        <p className="text-gray-400">Playlist cá nhân</p>
        <p className="text-gray-400">Số bài hát: {songs.length}</p>
      </div>

      {/* Cột phải: danh sách bài hát */}
      <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/40 max-h-[520px] overflow-y-auto">
        {songs.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Chưa có bài hát nào.</p>
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
                    src={song.coverUrl || `/default-cover.jpg`}
                    alt={song.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold text-white">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.singerName || song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Play button giống LatestSongsPage */}
                  <PlayButton
                    variant="simple"
                    song={song}
                    isCurrent={currentTrack?.songId === song.songId}
                    isPlaying={currentTrack?.songId === song.songId && isPlaying}
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
