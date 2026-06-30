// src/components/pages/Admin/Dashboard.jsx
import { useState, useEffect } from "react";
import { Music, User, Album, ListMusic, Users, TrendingUp, Clock, Crown, Play } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import axios from "../../config/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalSingers: 0,
    totalAlbums: 0,
    totalGenres: 0,
    totalUsers: 0,
  });

  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // === Fetch tất cả dữ liệu thống kê ===
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch tất cả data song song
      const [songsRes, singersRes, albumsRes, genresRes, usersRes] = await Promise.all([
        axios.get("/songs"),
        axios.get("/singers"),
        axios.get("/albums"),
        axios.get("/genres"),
        axios.get("/users"),
      ]);

      // Lấy data từ response
      const songs = songsRes.data?.data || songsRes.data || [];
      const singers = singersRes.data?.data || singersRes.data || [];
      const albums = albumsRes.data?.data || albumsRes.data || [];
      const genres = genresRes.data?.data || genresRes.data || [];
      const users = usersRes.data?.data || usersRes.data || [];

      // Set stats
      setStats({
        totalSongs: Array.isArray(songs) ? songs.length : 0,
        totalSingers: Array.isArray(singers) ? singers.length : 0,
        totalAlbums: Array.isArray(albums) ? albums.length : 0,
        totalGenres: Array.isArray(genres) ? genres.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
      });

      // Top 5 bài hát có lượt nghe cao nhất
      if (Array.isArray(songs)) {
        const sortedSongs = [...songs]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);
        setTopSongs(sortedSongs);
      }

      // Top 5 nghệ sĩ (theo số lượng bài hát)
      if (Array.isArray(songs) && Array.isArray(singers)) {
        const artistStats = {};

        // Đếm số bài hát và tổng lượt nghe cho mỗi nghệ sĩ
        songs.forEach((song) => {
          const artistName = song.singerName || "Unknown";
          if (!artistStats[artistName]) {
            artistStats[artistName] = { songs: 0, listens: 0 };
          }
          artistStats[artistName].songs += 1;
          artistStats[artistName].listens += song.views || 0;
        });

        // Chuyển thành array và sort
        const artistArray = Object.entries(artistStats)
          .map(([name, data]) => ({
            name,
            songs: data.songs,
            listens: data.listens,
          }))
          .sort((a, b) => b.listens - a.listens)
          .slice(0, 5);

        setTopArtists(artistArray);
      }

      // 5 bài hát mới nhất (theo thời gian thêm vào hệ thống)
      if (Array.isArray(songs)) {
        const recentSongsList = [...songs]
          .sort((a, b) => {
            // Ưu tiên sắp xếp theo createdAt nếu có
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // Nếu không có createdAt, sắp xếp theo _id (MongoDB ObjectId chứa timestamp)
            if (a._id && b._id) {
              return b._id.localeCompare(a._id);
            }
            // Fallback: sắp xếp theo songId giảm dần (giả sử ID tăng dần)
            return (b.songId || 0) - (a.songId || 0);
          })
          .slice(0, 5);
        setRecentSongs(recentSongsList);
      }

      // Cập nhật thời gian làm mới
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // === Format helpers ===
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return num.toLocaleString("vi-VN");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "—";
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const statsCards = [
    {
      label: "Bài hát",
      value: stats.totalSongs,
      icon: <Music size={24} className="text-gray-900" />,
    },
    {
      label: "Nghệ sĩ",
      value: stats.totalSingers,
      icon: <User size={24} className="text-gray-900" />,
    },
    {
      label: "Album",
      value: stats.totalAlbums,
      icon: <Album size={24} className="text-gray-900" />,
    },
    {
      label: "Thể loại",
      value: stats.totalGenres,
      icon: <ListMusic size={24} className="text-gray-900" />,
    },
    {
      label: "Người dùng",
      value: stats.totalUsers,
      icon: <Users size={24} className="text-gray-900" />,
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {lastUpdate ? `Updated ${formatTime(lastUpdate)}` : "..."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
        {statsCards.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col p-6 bg-white border border-gray-200 hover:border-gray-900 transition-colors duration-300"
          >
            <div className="mb-4">
              {item.icon}
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1 tracking-tighter">{formatNumber(item.value)}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white border border-gray-200 p-8 mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
            Lượt Nghe Top 5 Bài Hát
          </h2>
        </div>
        <div className="h-[380px] w-full">
          {topSongs.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={topSongs} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  dy={15}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }}
                  tickFormatter={(value) => formatNumber(value)}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '0', border: '1px solid #e5e7eb', boxShadow: 'none', padding: '12px 16px' }}
                  formatter={(value) => [formatNumber(value), 'Lượt nghe']}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', fontSize: '13px' }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#0f172a' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 font-medium">Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Top Songs */}
        <div className="bg-white border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Top Bài Hát</h2>
          </div>
          {topSongs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <ul className="space-y-0">
              {topSongs.map((song, idx) => (
                <li
                  key={song.songId || idx}
                  className="group flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 px-2">
                    <div className="w-8 flex-shrink-0 text-gray-400 font-bold text-sm">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 font-bold text-base truncate">
                        {song.title || "—"}
                      </p>
                      <p className="text-xs text-gray-500 truncate font-medium uppercase tracking-wider mt-1">
                        {song.singerName || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end px-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {formatNumber(song.views)}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Lượt nghe</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Artists */}
        <div className="bg-white border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Top Nghệ Sĩ</h2>
          </div>
          {topArtists.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <ul className="space-y-0">
              {topArtists.map((artist, idx) => (
                <li
                  key={idx}
                  className="group flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 px-2">
                    <div className="w-8 flex-shrink-0 text-gray-400 font-bold text-sm">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 font-bold text-base truncate">
                        {artist.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate font-medium uppercase tracking-wider mt-1">
                        {artist.songs} Bài Hát
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end px-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {formatNumber(artist.listens)}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Lượt nghe</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recently Added Songs */}
      <div className="bg-white border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Bài Hát Mới Thêm</h2>
        </div>
        {recentSongs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="py-4 px-4 w-16">No.</th>
                  <th className="py-4 px-4">Bài hát</th>
                  <th className="py-4 px-4 text-right">Ngày thêm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSongs.map((song, idx) => (
                  <tr key={song.songId || idx} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-4 text-gray-400 font-bold text-sm">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="py-4 px-4">
                      <p className="text-gray-900 font-bold text-sm">{song.title || "—"}</p>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{song.singerName || "—"}</p>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-500 text-xs font-bold tracking-wider">
                      {song.createdAt ? formatDate(song.createdAt) : formatDate(song.releaseDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}