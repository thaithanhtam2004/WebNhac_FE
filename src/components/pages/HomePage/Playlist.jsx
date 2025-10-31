import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Play, Heart, ListPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { getPlaylistById, getSongsOfPlaylist } from "../../../services/playlistService";

export default function PlaylistPage() {
   // playlistId từ route
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playlistId } = useParams();

useEffect(() => {
  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const playlistData = await getPlaylistById(playlistId); // dùng playlistId
      setPlaylist(playlistData || null);

      const songsData = await getSongsOfPlaylist(playlistId);
      setSongs(songsData || []);
    } catch (err) {
      console.error("Lỗi lấy chi tiết playlist hoặc bài hát:", err);
      toast.error("Không thể tải playlist!");
    } finally {
      setLoading(false);
    }
  };
  fetchPlaylist();
}, [playlistId]);


  if (loading)
    return <p className="text-white text-center mt-10">Đang tải playlist...</p>;

  if (!playlist)
    return <p className="text-white text-center mt-10">Playlist không tồn tại.</p>;

  const handlePlayAll = () => toast(`▶️ Đang phát tất cả: ${playlist.name}`, { icon: "🎵" });
  const handlePlaySong = (song) => toast(`▶️ Đang phát: ${song.title}`, { icon: "🎵" });

  return (
    <div className="flex gap-6 p-6">
      {/* Cột trái: ảnh + info */}
      <div className="flex flex-col gap-4 w-64">
        <img
          src={`https://picsum.photos/seed/${playlist.playlistId}/300/300`}
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
                    src={song.coverUrl || `https://picsum.photos/seed/${song.songId}/60/60`}
                    alt={song.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold text-white">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-pink-500 cursor-pointer" />
                  <ListPlus className="w-5 h-5 text-cyan-400 cursor-pointer" />
                  <span className="text-gray-400">{song.duration}</span>
                  <button
                    onClick={() => handlePlaySong(song)}
                    className="p-2 bg-cyan-500/20 rounded-full hover:bg-cyan-500/40 transition"
                  >
                    <Play className="w-5 h-5 text-cyan-400" />
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
