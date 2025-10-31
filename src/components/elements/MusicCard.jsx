import { useState, useEffect } from "react";
import { Heart, Plus, Play } from "lucide-react";
import { addFavorite, removeFavorite } from "../../services/favoriteService";

export default function MusicCard({
  songId,
  userId,          // có thể undefined nếu chưa login
  title,
  artist,
  trackPath,
  onPlay,
  initialLiked = false,
}) {
  const [liked, setLiked] = useState(initialLiked);

  // Đồng bộ với prop initialLiked khi nó thay đổi
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  const handleLike = async () => {
    if (!userId) {
      alert("⚠️ Vui lòng đăng nhập để thêm bài hát vào yêu thích!");
      return;
    }

    const newValue = !liked;
    setLiked(newValue);

    try {
      if (newValue) {
        await addFavorite(userId, songId);
      } else {
        await removeFavorite(userId, songId);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật yêu thích:", err);
      setLiked(!newValue); // rollback nếu lỗi
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600/40 via-purple-700/40 to-pink-600/40 
      p-4 rounded-xl shadow-lg shadow-black/30 hover:scale-105 transition-transform 
      flex flex-col items-center text-center h-72 w-full">

      {/* Ảnh bài hát */}
      <div className="relative w-40 h-40 bg-gray-800/70 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        <button
          onClick={onPlay}
          className="absolute bg-white text-black rounded-full p-3 shadow-lg hover:scale-110 transition"
        >
          <Play size={20} />
        </button>
      </div>

      {/* Tên và nghệ sĩ */}
      <div className="flex flex-col items-center mb-3">
        <p className="font-semibold text-white text-sm truncate w-32">{title}</p>
        <p className="text-xs text-pink-200 truncate w-32">{artist}</p>
      </div>

      {/* Nút yêu thích + thêm playlist */}
      <div className="flex justify-center gap-6 text-base">
        <Heart
          size={18}
          className={`cursor-pointer transition ${liked ? "text-red-400 fill-red-400" : "text-white hover:text-red-400"}`}
          onClick={handleLike}
        />
        <Plus
          size={18}
          className="cursor-pointer text-white hover:text-green-400 transition"
          onClick={() => alert(`🎵 Đã thêm "${title}" vào playlist`)}
        />
      </div>
    </div>
  );
}
