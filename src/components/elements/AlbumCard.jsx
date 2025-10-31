import { Play } from "lucide-react";

export default function AlbumCard({ title, artist, coverUrl, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-blue-600/40 via-purple-700/40 to-pink-600/40 
        p-4 rounded-xl shadow-lg shadow-black/30 hover:scale-105 transition-transform 
        flex flex-col items-center text-center h-72 w-full cursor-pointer"
    >
      {/* Ảnh album vuông */}
      <div className="relative w-40 h-40 bg-gray-800/70 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="object-cover w-full h-full rounded-lg"
          />
        ) : (
          <div className="text-white text-xs opacity-70">No Image</div>
        )}

        {/* Nút Play nổi giữa ảnh */}
        <button className="absolute bg-white text-black rounded-full p-3 shadow-lg hover:scale-110 transition">
          <Play size={20} className="ml-0.5" />
        </button>
      </div>

      {/* Tên Album + Ca sĩ */}
      <div className="flex flex-col items-center mb-3">
        <p className="font-semibold text-white text-sm truncate w-32">
          {title}
        </p>
        <p className="text-xs text-pink-200 truncate w-32">{artist}</p>
      </div>
    </div>
  );
}
