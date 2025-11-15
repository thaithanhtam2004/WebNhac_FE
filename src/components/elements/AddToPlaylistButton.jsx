import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { getPlaylistsByUser } from "../../services/playlistService";
import { addSongToPlaylist } from "../../services/playlistSongService";
import { useAuth } from "../providers/AuthContext";

/**
 * AddToPlaylistButton – Nút thêm bài hát vào playlist
 *
 * @param {object} song - Bài hát hiện tại { songId, title, ... }
 */
export default function AddToPlaylistButton({ song }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Lấy playlist khi mở modal
  useEffect(() => {
    if (!showModal || !user) return;

    setLoading(true);
    getPlaylistsByUser(user.userId)
      .then((data) => setPlaylists(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [showModal, user]);

  const handleAdd = async (playlistId) => {
    if (!user) {
      alert("⚠️ Vui lòng đăng nhập để thêm bài hát vào playlist!");
      return;
    }

    setLoading(true);
    try {
      await addSongToPlaylist({ playlistId, songId: song.songId });
      alert(`🎵 Đã thêm "${song.title}" vào playlist`);
      setShowModal(false);
    } catch (err) {
      console.error("❌ Lỗi khi thêm bài hát vào playlist:", err);
      alert("❌ Lỗi khi thêm bài hát vào playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Plus
        size={20}
        className={`cursor-pointer transition-all duration-200 hover:text-green-400 ${loading ? "opacity-50 pointer-events-none" : ""}`}
        title="Thêm vào playlist"
        onClick={() => setShowModal(true)}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#1a1a1a] p-6 rounded-lg w-80 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 p-1 hover:bg-gray-700 rounded"
            >
              ✕
            </button>

            <h3 className="text-white font-semibold text-lg mb-4">Chọn playlist</h3>

            {loading ? (
              <p className="text-gray-400 text-center">Đang tải...</p>
            ) : playlists.length === 0 ? (
              <p className="text-gray-400 text-center">Bạn chưa có playlist nào.</p>
            ) : (
              <ul className="max-h-64 overflow-y-auto divide-y divide-gray-700">
                {playlists.map((pl) => (
                  <li
                    key={pl.playlistId}
                    className={`py-2 px-3 hover:bg-gray-700 cursor-pointer rounded transition ${loading ? "pointer-events-none opacity-50" : ""}`}
                    onClick={() => handleAdd(pl.playlistId)}
                  >
                    {pl.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
