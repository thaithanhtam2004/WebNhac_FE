import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlaylistsByUser } from "../../../services/playlistService";
import { useAuth } from "../../providers/AuthContext";

export default function PlaylistListPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!user?.userId) return;
      setLoading(true);
      try {
        const data = await getPlaylistsByUser(user.userId);
        setPlaylists(data || []);
      } catch (err) {
        console.error("Lỗi lấy playlist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [user?.userId]);

  if (loading)
    return <p className="text-white text-center mt-10">Đang tải playlist...</p>;

  if (playlists.length === 0)
    return <p className="text-white text-center mt-10">Chưa có playlist nào.</p>;

  return (
    <div className="p-6">
      <h2 className="text-white text-xl font-semibold mb-6">Playlist của bạn</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.playlistId}
            className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg shadow-black/40 cursor-pointer hover:scale-105 transition-all duration-300"
            onClick={() => navigate(`/playlists/${playlist.playlistId}`)}
          >
            <img
              src={`https://picsum.photos/seed/${playlist.playlistId}/300/300`}
              alt={playlist.name}
              className="w-full h-48 object-cover opacity-90"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold text-white truncate">{playlist.name}</h3>
              <p className="text-sm text-gray-400 truncate">Playlist cá nhân</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
