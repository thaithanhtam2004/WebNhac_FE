import React, { useState } from "react";
import { Clock, Play, ListPlus, Trash2, Search } from "lucide-react";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Dữ liệu mẫu
  const [historySongs, setHistorySongs] = useState([
    { id: 1, title: "Counting Stars", artist: "OneRepublic", cover: "https://i.scdn.co/image/ab67616d0000b273b3b3b3b3b3b3b3b3b3b3b3b3", lastPlayed: "2025-10-09T21:45:00" },
    { id: 2, title: "Shape of You", artist: "Ed Sheeran", cover: "https://i.scdn.co/image/ab67616d0000b2736f6f6f6f6f6f6f6f6f6f6f6f", lastPlayed: "2025-10-09T20:15:00" },
    { id: 3, title: "Blinding Lights", artist: "The Weeknd", cover: "https://i.scdn.co/image/ab67616d0000b273cccccccccccccccccccccccc", lastPlayed: "2025-10-08T23:10:00" },
    { id: 4, title: "Levitating", artist: "Dua Lipa", cover: "https://i.scdn.co/image/ab67616d0000b273d4d4d4d4d4d4d4d4d4d4d4d4", lastPlayed: "2025-10-08T19:00:00" },
    { id: 5, title: "Havana", artist: "Camila Cabello", cover: "https://i.scdn.co/image/ab67616d0000b273aaaaaaaabbbbbbbbcccccccc", lastPlayed: "2025-10-07T18:10:00" },
    { id: 6, title: "Stay", artist: "The Kid LAROI & Justin Bieber", cover: "https://i.scdn.co/image/ab67616d0000b273eeeeeeeeffffffffdddddddd", lastPlayed: "2025-10-07T14:40:00" },
    { id: 7, title: "Perfect", artist: "Ed Sheeran", cover: "https://i.scdn.co/image/ab67616d0000b273bbbbbbbbccccccccdddddddd", lastPlayed: "2025-10-06T22:00:00" },
    { id: 8, title: "Someone You Loved", artist: "Lewis Capaldi", cover: "https://i.scdn.co/image/ab67616d0000b27399999999aaaaaaaa77777777", lastPlayed: "2025-10-06T19:10:00" },
    { id: 9, title: "Senorita", artist: "Shawn Mendes & Camila Cabello", cover: "https://i.scdn.co/image/ab67616d0000b273444444445555555566666666", lastPlayed: "2025-10-06T17:05:00" },
    { id: 10, title: "Peaches", artist: "Justin Bieber", cover: "https://i.scdn.co/image/ab67616d0000b2738888888899999999aaaaaaa9", lastPlayed: "2025-10-05T20:50:00" },
    { id: 11, title: "Believer", artist: "Imagine Dragons", cover: "https://i.scdn.co/image/ab67616d0000b273aaaaaaaaaaaaaaaaaaaaaaaa", lastPlayed: "2025-10-04T22:10:00" },
    { id: 12, title: "Thunder", artist: "Imagine Dragons", cover: "https://i.scdn.co/image/ab67616d0000b273bbbbbbbbbbbbbbbbbbbbbbbb", lastPlayed: "2025-10-04T21:00:00" },
  ]);

  // 🔍 Lọc bài hát
  const filteredSongs = historySongs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🕒 Format thời gian
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

  // ❌ Xóa 1 bài
  const handleDeleteSong = (id) => {
    setHistorySongs((prev) => prev.filter((song) => song.id !== id));
  };

  // ❌ Xóa tất cả
  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử nghe không?")) {
      setHistorySongs([]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-7 h-7 text-cyan-400" />
          <h1 className="text-2xl font-bold text-cyan-400">Lịch sử nghe nhạc</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Thanh tìm kiếm */}
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

          {/* Nút Xóa tất cả */}
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Xóa tất cả
          </button>
        </div>
      </div>

      {/* Danh sách bài hát */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/40 max-h-[520px] overflow-y-auto">
        {filteredSongs.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Không có bài hát nào trong lịch sử.</p>
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

                <div className="flex items-center gap-3">
                  <button className="p-2 bg-cyan-500/20 rounded-full hover:bg-cyan-500/40 transition">
                    <Play className="w-5 h-5 text-cyan-400" />
                  </button>
                  <button className="p-2 bg-pink-500/20 rounded-full hover:bg-pink-500/40 transition">
                    <ListPlus className="w-5 h-5 text-pink-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteSong(song.id)}
                    className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 transition"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
