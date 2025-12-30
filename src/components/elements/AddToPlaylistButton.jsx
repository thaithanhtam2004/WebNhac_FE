import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, FolderPlus, Check } from "lucide-react";

// Đảm bảo đường dẫn import đúng service của bạn
import { getPlaylistsByUser, createPlaylist } from "../../services/playlistService";
import { addSongToPlaylist } from "../../services/playlistSongService";
import { useAuth } from "../providers/AuthContext";
import Notification from "./Notification";

export default function AddToPlaylistButton({ song, onSuccess }) {
  const { user } = useAuth();
  
  // --- STATE UI ---
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // --- STATE LOGIC ---
  const [addedPlaylistIds, setAddedPlaylistIds] = useState(new Set()); 
  const [notification, setNotification] = useState(null);
  
  // --- STATE FORM TẠO MỚI ---
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Load danh sách khi mở Modal
  useEffect(() => {
    if (!showModal || !user) return;

    setLoading(true);
    getPlaylistsByUser(user.userId)
      .then((data) => setPlaylists(data || []))
      .catch((err) => console.error("Lỗi tải playlist:", err))
      .finally(() => setLoading(false));
  }, [showModal, user]);

  // Helper hiển thị thông báo
  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- XỬ LÝ 1: THÊM VÀO PLAYLIST CÓ SẴN ---
  const handleAdd = async (playlist) => {
    if (addedPlaylistIds.has(playlist.playlistId)) {
        showNotify("success", "Bài hát đã có trong playlist này rồi!");
        return;
    }

    setLoading(true);
    try {
      await addSongToPlaylist({ playlistId: playlist.playlistId, songId: song.songId });
      
      // Update UI: Đánh dấu tích xanh
      setAddedPlaylistIds(prev => new Set(prev).add(playlist.playlistId));
      
      showNotify("success", `Đã thêm vào playlist: ${playlist.name}`);
      if (onSuccess) onSuccess(playlist.name);
    } catch (err) {
      console.error(err);
      showNotify("error", "Lỗi khi thêm bài hát");
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ 2: TẠO PLAYLIST MỚI (FIX LỖI UNDEFINED) ---
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    setLoading(true);
    try {
        // 1. Gọi API tạo playlist
        const response = await createPlaylist({ 
            userId: user.userId, 
            name: newPlaylistName, 
            description: "Được tạo nhanh" 
        });

        // Xử lý response (đề phòng API trả về bọc trong data)
        const newPl = response?.data || response;

        if (newPl && newPl.playlistId) {
            // 2. Thêm bài hát vào playlist vừa tạo luôn
            await addSongToPlaylist({ playlistId: newPl.playlistId, songId: song.songId });
            
            // 3. Tạo object hiển thị thủ công (Để tránh lỗi nếu API không trả về name)
            const uiPlaylistItem = {
                playlistId: newPl.playlistId,
                name: newPlaylistName, // Dùng chính text input để hiển thị -> Chắc chắn đúng
                songCount: 1
            };

            // 4. Cập nhật UI
            setPlaylists([uiPlaylistItem, ...playlists]); // Đưa lên đầu list
            setAddedPlaylistIds(prev => new Set(prev).add(newPl.playlistId)); // Đánh dấu tích
            
            showNotify("success", `Đã tạo "${newPlaylistName}" và thêm bài hát!`);
            
            // 5. Reset form
            setNewPlaylistName("");
            setIsCreating(false);
        }
    } catch (err) {
        console.error(err);
        showNotify("error", "Lỗi khi tạo playlist mới");
    } finally {
        setLoading(false);
    }
  };

  // --- RENDER ---
  const modalContent = showModal ? (
    <div 
        className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={(e) => e.stopPropagation()} 
    >
      <div className="bg-[#282828] rounded-xl w-96 shadow-2xl relative max-h-[85vh] flex flex-col border border-neutral-700">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#282828] rounded-t-xl">
            <h3 className="text-white font-bold text-lg">Thêm vào playlist</h3>
            <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded-full transition"
            >
                <X size={20} />
            </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto custom-scrollbar">
            
            {/* Form Tạo Mới */}
            <div className="mb-4 pb-4 border-b border-gray-700">
                {!isCreating ? (
                    <button 
                        onClick={() => setIsCreating(true)} 
                        className="w-full py-2 px-3 flex items-center justify-center gap-2 text-sm text-gray-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-dashed border-gray-600 hover:border-gray-400 transition"
                    >
                        <FolderPlus size={18} /> 
                        <span>Tạo playlist mới</span>
                    </button>
                ) : (
                    <div className="flex gap-2 animate-slide-down">
                        <input 
                            autoFocus 
                            type="text" 
                            value={newPlaylistName} 
                            onChange={(e) => setNewPlaylistName(e.target.value)} 
                            placeholder="Tên playlist..." 
                            className="flex-1 bg-neutral-900 border border-neutral-600 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-green-500" 
                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                        />
                        <button 
                            onClick={handleCreatePlaylist} 
                            disabled={!newPlaylistName.trim()} 
                            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-3 rounded-md text-sm whitespace-nowrap disabled:opacity-50"
                        >
                            Tạo
                        </button>
                        <button 
                            onClick={() => setIsCreating(false)} 
                            className="bg-neutral-700 hover:bg-neutral-600 text-white py-2 px-3 rounded-md text-sm"
                        >
                            Hủy
                        </button>
                    </div>
                )}
            </div>

            {/* Danh sách */}
            {loading && playlists.length === 0 ? (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500 mx-auto"></div>
                </div>
            ) : playlists.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm">Bạn chưa có playlist nào.</p>
            ) : (
                <ul className="space-y-1">
                    {playlists.map((pl) => {
                        const isAdded = addedPlaylistIds.has(pl.playlistId);
                        return (
                            <li 
                                key={pl.playlistId} 
                                onClick={() => handleAdd(pl)} 
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition select-none
                                    ${isAdded ? 'bg-green-900/20 hover:bg-green-900/30' : 'hover:bg-neutral-700'}`}
                            >
                                <div className="truncate pr-2">
                                    <div className={`font-medium truncate ${isAdded ? 'text-green-500' : 'text-white'}`}>
                                        {pl.name}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {pl.songCount ? `${pl.songCount} bài hát` : 'Playlist'}
                                    </div>
                                </div>
                                {isAdded && (
                                    <div className="bg-green-500 rounded-full p-1 shadow-sm">
                                        <Check size={14} className="text-black" strokeWidth={3} />
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
      </div>
    </div>
  ) : null;

  const notificationContent = notification ? (
      <Notification 
        type={notification.type} 
        message={notification.message} 
        onClose={() => setNotification(null)} 
      />
  ) : null;

  return (
    <>
      <Plus
        size={20}
        className={`cursor-pointer transition-all duration-200 hover:text-green-400 hover:scale-110 
            ${loading && !showModal ? "opacity-50 pointer-events-none" : ""}`}
        title="Thêm vào playlist"
        onClick={(e) => {
            e.stopPropagation(); 
            if(!user) { 
                showNotify("warning", "Vui lòng đăng nhập!"); 
                return; 
            }
            setShowModal(true);
        }}
      />
      
      {/* Portal */}
      {typeof document !== 'undefined' && createPortal(modalContent, document.body)}
      {typeof document !== 'undefined' && createPortal(notificationContent, document.body)}
    </>
  );
}