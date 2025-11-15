import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlaylistsByUser, createPlaylist } from "../../../services/playlistService";
import { useAuth } from "../../providers/AuthContext";

export default function PlaylistListPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFrame, setShowFrame] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
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

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const newPlaylist = await createPlaylist({
        userId: user.userId,
        name: newPlaylistName,
      });
      setPlaylists((prev) => [newPlaylist, ...prev]);
      setNewPlaylistName("");
      setShowFrame(false);
    } catch (err) {
      console.error("Lỗi tạo playlist:", err);
    }
  };

  if (loading)
    return <p className="text-white text-center mt-10">Đang tải playlist...</p>;

  return (
    <div className="p-6 relative">
      {/* Tiêu đề + nút thêm */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-xl font-semibold">Playlist của bạn</h2>
        <button
          onClick={() => setShowFrame(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          Thêm Playlist
        </button>
      </div>

      {/* Mini frame tạo playlist */}
      {showFrame && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#1a1a1a] p-6 rounded-lg w-80 shadow-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Tạo Playlist Mới</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Tên playlist"
              className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFrame(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách playlist */}
      {playlists.length === 0 ? (
        <p className="text-white text-center mt-10">Chưa có playlist nào.</p>
      ) : (
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
      )}
    </div>
  );
}
