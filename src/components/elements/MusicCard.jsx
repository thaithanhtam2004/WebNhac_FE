import { useState } from "react";
import { Heart, Plus, Play } from "lucide-react";

export default function MusicCard({ title, artist, trackPath, onPlay }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-600/40 via-purple-700/40 to-pink-600/40 
      p-4 rounded-xl shadow-lg shadow-black/30 hover:scale-105 transition-transform 
      flex flex-col items-center text-center h-72 w-full">
      
      {/* Ảnh vuông */}
      <div className="relative w-40 h-40 bg-gray-800/70 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {/* Nút play nổi giữa ảnh */}
        <button
          onClick={onPlay}
          className="absolute bg-white text-black rounded-full p-3 shadow-lg hover:scale-110 transition"
        >
          <Play size={20} className="ml-0.5" />
        </button>
      </div>

      {/* Tên bài hát + nghệ sĩ */}
      <div className="flex flex-col items-center mb-3">
        <p className="font-semibold text-white text-sm truncate w-32">{title}</p>
        <p className="text-xs text-pink-200 truncate w-32">{artist}</p>
      </div>

      {/* Hàng nút tương tác */}
      <div className="flex justify-center gap-6 text-base">
        <Heart
          size={18}
          className={`cursor-pointer transition ${
            liked ? "text-red-400 fill-red-400" : "text-white hover:text-red-400"
          }`}
          onClick={() => setLiked(!liked)}
        />
        <Plus
          size={18}
          className="cursor-pointer text-white hover:text-green-400 transition"
          onClick={() => alert(`Đã thêm "${title}" vào playlist`)}
        />
      </div>
    </div>
  );
}
