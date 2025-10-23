// src/components/pages/Admin/Dashboard.jsx
import { Music, User, Album, ListMusic, Users, Disc, Mic, Clock } from "lucide-react";

export default function Dashboard() {
  // Stats data
  const stats = [
    { label: "Bài hát", value: 20, icon: <Music className="w-8 h-8 text-indigo-500" />, color: "bg-indigo-100 text-indigo-700" },
    { label: "Nghệ sĩ", value: 5, icon: <User className="w-8 h-8 text-pink-500" />, color: "bg-pink-100 text-pink-700" },
    { label: "Album", value: 2, icon: <Album className="w-8 h-8 text-yellow-500" />, color: "bg-yellow-100 text-yellow-700" },
    { label: "Thể loại", value: 3, icon: <ListMusic className="w-8 h-8 text-green-500" />, color: "bg-green-100 text-green-700" },
    { label: "Người nghe", value: 137, icon: <Users className="w-8 h-8 text-blue-500" />, color: "bg-blue-100 text-blue-700" },
  ];

  // Top songs
  const topSongs = [
    { name: "Chúng ta của tương lai", listens: "80" },
    { name: "Đánh đổi", listens: "68" },
    { name: "Free And Dump", listens: "59" },
  ];

  // Top artists
  const topArtists = [
    { name: "Sơn Tùng M-TP", songs: 7, listens: "212" },
    { name: "Obito", songs: 5, listens: "125" },
    { name: "LilWuyn", songs: 4, listens: "99" },
  ];

  // Recent songs
  const recentSongs = [
    { name: "An", artist: "LilWuyn", date: "10/10/2025" },
    { name: "Vinflow", artist: "Wrxdie", date: "10/10/2025" },
    { name: "Cuốn cho anh 1 điếu nữa đi", artist: "MCK", date: "08/10/2025" },
  ];

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Thống kê tổng quan</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 ${item.color}`}
          >
            <div className="mb-3">{item.icon}</div>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Top Songs */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
            {/* <Disc className="w-5 h-5 text-indigo-500 mr-2" /> */}
            Top Bài Hát
          </h2>
          <ul className="space-y-3">
            {topSongs.map((song, idx) => (
              <li
                key={idx}
                className="grid grid-cols-2 items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Tên bài hát */}
                <span className="text-gray-700 font-medium">{song.name}</span>

                {/* Lượt nghe */}
                <span className="font-bold text-gray-800 text-right">
                  {song.listens}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Artists */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
            {/* <Mic className="w-5 h-5 text-pink-500 mr-2" /> */}
            Top Nghệ Sĩ
          </h2>
          <ul className="space-y-3">
            {topArtists.map((artist, idx) => (
              <li
                key={idx}
                className="grid grid-cols-3 items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Nghệ sĩ */}
                <span className="text-gray-700 font-medium">{artist.name}</span>

                {/* Số lượng bài hát */}
                <span className="text-sm text-gray-800 text-center">
                  {artist.songs} bài hát
                </span>

                {/* Lượt nghe */}
                <span className="font-bold text-gray-800 text-right">
                  {artist.listens}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recently Added Songs */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
          {/* <Clock className="w-5 h-5 text-green-500 mr-2" /> */}
          Bài Hát Vừa Thêm Gần Đây
        </h2>
        <ul className="divide-y divide-gray-200">
          {recentSongs.map((song, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <div>
                <p className="text-gray-800 font-medium">{song.name}</p>
                <p className="text-sm text-gray-500">{song.artist}</p>
              </div>
              <span className="text-sm text-gray-400">{song.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
