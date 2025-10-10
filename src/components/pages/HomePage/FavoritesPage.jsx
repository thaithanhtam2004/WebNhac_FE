import React, { useState } from "react";
import { Heart, Play, Plus } from "lucide-react";
import FavoriteSearchBar from "../../elements/FavoriteSearchBar";

export default function FavoritesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Dữ liệu mẫu
  const favoriteSongs = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    title: `Bài hát ${i + 1}`,
    artist: ["Sơn Tùng M-TP", "Đen Vâu", "Hoàng Thùy Linh", "Jack", "Min"][
      Math.floor(Math.random() * 5)
    ],
    cover: `https://picsum.photos/seed/song${i}/80/80`,
  }));

  // 🔍 Lọc danh sách
  const filteredSongs = favoriteSongs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToPlaylist = (song) => {
    console.log(`🎵 Đã thêm "${song.title}" vào playlist!`);
    alert(`Đã thêm "${song.title}" vào playlist 🎶`);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-pink-400">
          <Heart className="w-7 h-7 text-pink-400" />
          Bài hát yêu thích
        </h1>

        {/* Thanh tìm kiếm */}
        <FavoriteSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* Danh sách bài hát */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/30 max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {filteredSongs.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            Không tìm thấy bài hát nào.
          </p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {filteredSongs.map((song) => (
              <li
                key={song.id}
                className="group flex items-center justify-between gap-4 py-3 px-3 rounded-lg hover:bg-[#2a2a2a] transition-all duration-300 relative"
              >
                {/* Ảnh bìa */}
                <div className="relative w-14 h-14 flex-shrink-0">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full rounded-md object-cover"
                  />
                  {/* Nút play xuất hiện khi hover */}
                  <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md">
                    <Play className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Thông tin bài hát */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white truncate">
                    {song.title}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                </div>

                {/* Khu vực nút điều khiển */}
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => handleAddToPlaylist(song)}
                    className="p-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/40 transition-all duration-300"
                  >
                    <Plus className="w-5 h-5 text-pink-400" />
                  </button>
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
