// src/components/pages/Admin/Dashboard.jsx
import { Music, User, Album, ListMusic, Users, Disc, Mic, Clock } from "lucide-react";

export default function Dashboard() {
  // Stats data
  const stats = [
    { label: "Bài hát", value: 120, icon: <Music className="w-8 h-8 text-indigo-500" />, color: "bg-indigo-100 text-indigo-700" },
    { label: "Nghệ sĩ", value: 35, icon: <User className="w-8 h-8 text-pink-500" />, color: "bg-pink-100 text-pink-700" },
    { label: "Album", value: 18, icon: <Album className="w-8 h-8 text-yellow-500" />, color: "bg-yellow-100 text-yellow-700" },
    { label: "Thể loại", value: 12, icon: <ListMusic className="w-8 h-8 text-green-500" />, color: "bg-green-100 text-green-700" },
    { label: "Người nghe", value: 540, icon: <Users className="w-8 h-8 text-blue-500" />, color: "bg-blue-100 text-blue-700" },
  ];

  // Top songs
  const topSongs = [
    { name: "Song A", listens: "1.2k" },
    { name: "Song B", listens: "980" },
    { name: "Song C", listens: "860" },
    { name: "Song D", listens: "720" },
  ];

  // Top artists
  const topArtists = [
    { name: "Artist A", songs: 45, listens: "5.2k" },
    { name: "Artist B", songs: 32, listens: "4.1k" },
    { name: "Artist C", songs: 28, listens: "3.8k" },
    { name: "Artist D", songs: 20, listens: "2.9k" },
  ];

  // Recent songs
  const recentSongs = [
    { name: "New Song 1", artist: "Artist X", date: "10/10/2025" },
    { name: "New Song 2", artist: "Artist Y", date: "09/10/2025" },
    { name: "New Song 3", artist: "Artist Z", date: "08/10/2025" },
    { name: "New Song 4", artist: "Artist A", date: "07/10/2025" },
  ];

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Thống kê tổng quan
        </h1>
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
            <Disc className="w-5 h-5 text-indigo-500 mr-2" />
            Top Bài Hát
          </h2>
          <ul className="space-y-3">
            {topSongs.map((song, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">{song.name}</span>
                <span className="font-semibold text-indigo-600">
                  {song.listens}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Artists */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
            <Mic className="w-5 h-5 text-pink-500 mr-2" />
            Top Nghệ Sĩ
          </h2>
          <ul className="space-y-3">
            {topArtists.map((artist, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">{artist.name}</span>
                <span className="text-sm text-gray-500">
                  {artist.songs} bài hát
                </span>
                <span className="font-semibold text-pink-600">
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
          <Clock className="w-5 h-5 text-green-500 mr-2" />
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
