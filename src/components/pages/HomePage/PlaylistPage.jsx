import React, { useState, useEffect } from "react";
import { Music, Play, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getPlaylistsByUser,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../../../services/playlistService";
import { useAuth } from "../../providers/AuthContext";

export default function PlaylistPage() {
  const { user } = useAuth(); // ✅ Lấy thông tin người dùng
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylist, setNewPlaylist] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch danh sách playlist của user
  const fetchPlaylists = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const res = await getPlaylistsByUser(user.userId);
      setPlaylists(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải playlist!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) fetchPlaylists();
  }, [user?.userId]);

  // ➕ Thêm playlist
  const handleAddPlaylist = async () => {
    if (newPlaylist.trim() === "")
      return toast.error("Tên playlist không được để trống!");
    try {
      const res = await createPlaylist({
        name: newPlaylist,
        userId: user.userId, // ✅ gửi đúng userId
      });
      if (res.success) {
        toast.success("Tạo playlist thành công!");
        fetchPlaylists(); // Refetch lại danh sách
        setNewPlaylist("");
        setShowInput(false);
      } else toast.error("Không thể tạo playlist!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo playlist!");
    }
  };

  // ✏️ Bắt đầu sửa
  const handleEdit = (playlist) => {
    setEditingId(playlist.playlistId);
    setEditName(playlist.name);
  };

  // 💾 Lưu tên sửa
  const handleSaveEdit = async (playlistId) => {
    if (editName.trim() === "") return toast.error("Tên không được để trống!");
    try {
      const res = await updatePlaylist(playlistId, { name: editName });
      if (res.success) {
        setPlaylists(
          playlists.map((p) =>
            p.playlistId === playlistId ? { ...p, name: editName } : p
          )
        );
        toast.success("Cập nhật playlist thành công!");
        setEditingId(null);
        setEditName("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật playlist!");
    }
  };

  // 🔴 Xóa playlist
  const handleDelete = async (playlistId) => {
    if (!window.confirm("Bạn có chắc muốn xóa playlist này không?")) return;
    try {
      const res = await deletePlaylist(playlistId);
      if (res.success) {
        toast.success("Đã xóa playlist!");
        setPlaylists(playlists.filter((p) => p.playlistId !== playlistId));
      } else toast.error("Không thể xóa playlist!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa playlist!");
    }
  };

  // ❌ Hủy sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // 🎧 Phát playlist (chỉ toast)
  const handlePlay = (playlistName) => {
    toast(`▶️ Đang phát playlist: ${playlistName}`, { icon: "🎵" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-cyan-400">
          <Music className="w-7 h-7 text-cyan-400" />
          Playlist cá nhân
        </h1>

        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Tạo playlist
        </button>
      </div>

      {/* Ô nhập tên playlist mới */}
      {showInput && (
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Nhập tên playlist mới..."
            value={newPlaylist}
            onChange={(e) => setNewPlaylist(e.target.value)}
            className="flex-1 bg-[#1e1e1e] border border-gray-700 rounded-lg py-2 px-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            onClick={handleAddPlaylist}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all duration-300"
          >
            Lưu
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-gray-400 text-center">Đang tải playlist...</p>
      )}

      {/* Danh sách playlist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {playlists.map((playlist) => (
          <div
            key={playlist.playlistId}
            className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg shadow-black/40 hover:scale-105 transition-all duration-300"
          >
            <div className="relative">
              <img
                src={`https://picsum.photos/seed/${playlist.playlistId}/300/300`}
                alt={playlist.name}
                className="w-full h-48 object-cover opacity-90"
              />
              <button
                onClick={() => handlePlay(playlist.name)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <Play className="w-10 h-10 text-white hover:scale-125 transition-transform duration-200" />
              </button>
            </div>

            <div className="p-4 flex justify-between items-center">
              {editingId === playlist.playlistId ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-[#2a2a2a] border border-gray-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    onClick={() => handleSaveEdit(playlist.playlistId)}
                    className="p-1 bg-green-500/30 hover:bg-green-500/50 rounded-md transition"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 bg-red-500/30 hover:bg-red-500/50 rounded-md transition"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-white truncate">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      Playlist cá nhân
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(playlist)}
                    className="p-2 bg-gray-700/30 hover:bg-gray-600/50 rounded-md transition opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="w-4 h-4 text-gray-300" />
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => handleDelete(playlist.playlistId)}
              className="absolute top-3 right-3 bg-red-500/20 hover:bg-red-500/40 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {!loading && playlists.length === 0 && (
        <p className="text-gray-400 text-center py-10">
          Bạn chưa có playlist nào. Hãy tạo mới để bắt đầu 🎶
        </p>
      )}
    </div>
  );
}
