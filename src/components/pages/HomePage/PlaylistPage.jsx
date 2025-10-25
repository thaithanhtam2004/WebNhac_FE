import React, { useState } from "react";
import { Music, Play, Plus, Trash2, Pencil, Check, X } from "lucide-react";

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState([
    {
      id: 1,
      name: "Chill Vibes",
      description: "Những giai điệu thư giãn nhẹ nhàng",
      cover: "https://picsum.photos/seed/chill/300/300",
    },
    {
      id: 2,
      name: "Workout Energy",
      description: "Nhạc giúp tăng năng lượng khi tập luyện",
      cover: "https://picsum.photos/seed/workout/300/300",
    },
    {
      id: 3,
      name: "Top Hits",
      description: "Những bản nhạc được yêu thích nhất",
      cover: "https://picsum.photos/seed/top/300/300",
    },
  ]);

  const [newPlaylist, setNewPlaylist] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // 🟢 Thêm playlist mới
  const handleAddPlaylist = () => {
    if (newPlaylist.trim() === "") return;
    const newItem = {
      id: Date.now(),
      name: newPlaylist,
      description: "Playlist mới của bạn 🎵",
      cover: `https://picsum.photos/seed/${newPlaylist}/300/300`,
    };
    setPlaylists([newItem, ...playlists]);
    setNewPlaylist("");
    setShowInput(false);
  };

  // 🔴 Xóa playlist
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa playlist này không?")) {
      setPlaylists(playlists.filter((p) => p.id !== id));
    }
  };

  // 🎧 Phát playlist
  const handlePlay = (playlistName) => {
    alert(`▶️ Đang phát playlist: ${playlistName}`);
  };

  // ✏️ Bắt đầu sửa tên
  const handleEdit = (playlist) => {
    setEditingId(playlist.id);
    setEditName(playlist.name);
  };

  // 💾 Lưu tên sửa
  const handleSaveEdit = (id) => {
    if (editName.trim() === "") return;
    setPlaylists(
      playlists.map((p) =>
        p.id === id ? { ...p, name: editName } : p
      )
    );
    setEditingId(null);
    setEditName("");
  };

  // ❌ Hủy sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-cyan-400">
          <Music className="w-7 h-7 text-cyan-400" />
          Playlist cá nhân
        </h1>

        {/* Nút thêm playlist */}
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

      {/* Danh sách playlist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg shadow-black/40 hover:scale-105 transition-all duration-300"
          >
            {/* Ảnh bìa */}
            <div className="relative">
              <img
                src={playlist.cover}
                alt={playlist.name}
                className="w-full h-48 object-cover opacity-90"
              />
              {/* Overlay + Nút Play */}
              <button
                onClick={() => handlePlay(playlist.name)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <Play className="w-10 h-10 text-white hover:scale-125 transition-transform duration-200" />
              </button>
            </div>

            {/* Nội dung */}
            <div className="p-4 flex justify-between items-center">
              {editingId === playlist.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-[#2a2a2a] border border-gray-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    onClick={() => handleSaveEdit(playlist.id)}
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
                      {playlist.description}
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

            {/* Nút xóa */}
            <button
              onClick={() => handleDelete(playlist.id)}
              className="absolute top-3 right-3 bg-red-500/20 hover:bg-red-500/40 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Nếu không có playlist */}
      {playlists.length === 0 && (
        <p className="text-gray-400 text-center py-10">
          Bạn chưa có playlist nào. Hãy tạo mới để bắt đầu 🎶
        </p>
      )}
    </div>
  );
}
