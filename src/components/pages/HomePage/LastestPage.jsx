import React, { useState } from "react";
import { Clock, Play, Plus, Heart, Search } from "lucide-react";
import { useGetSongByReleaseDate } from "../../../hooks/useGetSongByReleaseDate";

// Component tái sử dụng cho các nút icon, icon luôn trắng
function ButtonIcon({ icon: Icon, bgColorClass, hoverColorClass }) {
  return (
    <button className={`p-2 bg-${bgColorClass}/20 rounded-full hover:bg-${hoverColorClass}/40 transition`}>
      <Icon className="w-5 h-5 text-white" />
    </button>
  );
}

export default function LatestSongsPage() {
  const { data: latestSongs, loading, error } = useGetSongByReleaseDate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSongs = latestSongs?.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <p className="text-gray-400 text-center py-10">
        Đang tải bài hát mới...
      </p>
    );

  if (error)
    return (
      <p className="text-red-400 text-center py-10">
        Lỗi khi tải bài hát: {error}
      </p>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-7 h-7 text-white" />
          <h1 className="text-2xl font-bold text-white">Bài hát mới nhất</h1>
        </div>

        <div className="relative w-80">
          <input
            type="text"
            placeholder="Tìm kiếm bài hát..."
            className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Danh sách bài hát */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/40 max-h-[520px] overflow-y-auto">
        {filteredSongs.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            Không có bài hát mới nào.
          </p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {filteredSongs.map((song) => (
              <li
                key={song.id}
                className="flex items-center justify-between py-3 px-2 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold text-white">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Nghe lần cuối: {formatDate(song.lastPlayed)}
                    </p>
                  </div>
                </div>

                {/* Nút thao tác với component ButtonIcon */}
                <div className="flex items-center gap-3">
                  <ButtonIcon icon={Play}  hoverColorClass="cyan-500" />
                  <ButtonIcon icon={Plus} hoverColorClass="pink-500" />
                  <ButtonIcon icon={Heart}  hoverColorClass="red-500" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
