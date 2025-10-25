import { useState } from "react";
import { Heart, Plus, Play } from "lucide-react";

export default function AlbumCard({
  title,
  artist,
  coverUrl,
  trackCount,
  releaseDate,
  onPlay,
  onClick, // thêm prop onClick
}) {
  const [liked, setLiked] = useState(false);

  return (
    <div
      onClick={onClick} // click toàn bộ card
      className="cursor-pointer bg-gradient-to-br from-blue-600/40 via-purple-700/40 to-pink-600/40 
      p-4 rounded-xl shadow-lg shadow-black/30 hover:scale-105 transition-transform 
      flex flex-col items-center text-center h-80 w-64"
    >
      {/* Ảnh album */}
      <div className="relative w-48 h-48 bg-gray-800/70 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
        {/* Nút play nổi giữa ảnh */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // ngăn click card
            onPlay?.();
          }}
          className="absolute bg-white text-black rounded-full p-3 shadow-lg hover:scale-110 transition"
        >
          <Play size={20} />
        </button>
      </div>

      {/* Tên album + nghệ sĩ */}
      <div className="flex flex-col items-center mb-3">
        <p className="font-semibold text-white text-sm truncate w-48">
          {title}
        </p>
        <p className="text-xs text-pink-200 truncate w-48">{artist}</p>
        <p className="text-xs text-gray-400 mt-1">
          {trackCount} bài hát • {releaseDate}
        </p>
      </div>

      {/* Hàng nút tương tác */}
      <div className="flex justify-center gap-6 text-base">
        <Heart
          size={18}
          className={`cursor-pointer transition ${
            liked
              ? "text-red-400 fill-red-400"
              : "text-white hover:text-red-400"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
        />
        <Plus
          size={18}
          className="cursor-pointer text-white hover:text-green-400 transition"
          onClick={(e) => {
            e.stopPropagation();
            alert(`Đã thêm album "${title}" vào playlist`);
          }}
        />
      </div>
    </div>
  );
}
