// src/components/pages/Admin/Dashboard.jsx
import { useState, useEffect } from "react";
import { Music, User, Album, ListMusic, Users, TrendingUp, Clock, RefreshCw } from "lucide-react";
import axios from "../../../configs/apiConfig";

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

  // === Stats cards config ===
  const statsCards = [
    {
      label: "Tổng số bài hát",
      value: stats.totalSongs,
      color: "bg-indigo-100 text-indigo-700",
      icon: <Music size={28} />,
    },
    {
      label: "Tổng số nghệ sĩ",
      value: stats.totalSingers,
      color: "bg-pink-100 text-pink-700",
      icon: <User size={28} />,
    },
    {
      label: "Tổng số album",
      value: stats.totalAlbums,
      color: "bg-yellow-100 text-yellow-700",
      icon: <Album size={28} />,
    },
    {
      label: "Tổng số thể loại",
      value: stats.totalGenres,
      color: "bg-green-100 text-green-700",
      icon: <ListMusic size={28} />,
    },
    {
      label: "Tổng số người dùng",
      value: stats.totalUsers,
      color: "bg-blue-100 text-blue-700",
      icon: <Users size={28} />,
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Thống kê tổng quan</h1>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Cập nhật lúc: {formatTime(lastUpdate)}
              </span>
            )}
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {statsCards.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 ${item.color}`}
          >
            <div className="mb-3">{item.icon}</div>
            <p className="text-sm font-medium text-center">{item.label}</p>
            <p className="text-3xl font-bold mt-2">{formatNumber(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Top Songs */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <TrendingUp size={20} className="text-indigo-600" />
            Top Bài Hát Nhiều Lượt Nghe
          </h2>
          {topSongs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
          ) : (
            <ul className="space-y-3">
              {topSongs.map((song, idx) => (
                <li
                  key={song.songId || idx}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-gray-400 font-bold text-sm w-6">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-800 font-medium truncate">
                        {song.title || "—"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {song.singerName || "—"}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-black ml-3 whitespace-nowrap">
                    {formatNumber(song.views)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Artists */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <User size={20} className="text-pink-600" />
            Top Nghệ Sĩ
          </h2>
          {topArtists.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
          ) : (
            <ul className="space-y-3">
              {topArtists.map((artist, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-gray-400 font-bold text-sm w-6">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-800 font-medium truncate">
                        {artist.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {artist.songs} bài hát
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-black ml-3 whitespace-nowrap">
                    {formatNumber(artist.listens)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recently Added Songs */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <Clock size={20} className="text-green-600" />
          Bài Hát Mới Thêm Gần Đây
        </h2>
        {recentSongs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
        ) : (
          <ul className="space-y-3">
            {recentSongs.map((song, idx) => (
              <li
                key={song.songId || idx}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-gray-400 font-bold text-sm w-6">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-800 font-medium truncate">
                      {song.title || "—"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {song.singerName || "—"}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-600 ml-3 whitespace-nowrap">
                  {song.createdAt 
                    ? formatDate(song.createdAt)
                    : formatDate(song.releaseDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}