// src/components/pages/Admin/Dashboard.jsx
import { useState, useEffect } from "react";
import { Music, User, Album, ListMusic, Users, TrendingUp, Clock } from "lucide-react";
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

  // === Fetch tất cả dữ liệu thống kê ===
  useEffect(() => {
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

        // 5 bài hát mới nhất
        if (Array.isArray(songs)) {
          const recentSongsList = [...songs]
            .sort((a, b) => {
              const dateA = new Date(a.releaseDate || 0);
              const dateB = new Date(b.releaseDate || 0);
              return dateB - dateA;
            })
            .slice(0, 5);
          setRecentSongs(recentSongsList);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

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

  // === Stats cards config ===
  const statsCards = [
    {
      label: "Bài hát",
      value: stats.totalSongs,
      icon: <Music className="w-8 h-8 text-indigo-500" />,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Nghệ sĩ",
      value: stats.totalSingers,
      icon: <User className="w-8 h-8 text-pink-500" />,
      color: "bg-pink-100 text-pink-700",
    },
    {
      label: "Album",
      value: stats.totalAlbums,
      icon: <Album className="w-8 h-8 text-yellow-500" />,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Thể loại",
      value: stats.totalGenres,
      icon: <ListMusic className="w-8 h-8 text-green-500" />,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Người dùng",
      value: stats.totalUsers,
      icon: <Users className="w-8 h-8 text-blue-500" />,
      color: "bg-blue-100 text-blue-700",
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
        <h1 className="text-2xl font-bold text-gray-800">Thống kê tổng quan</h1>
        <p className="text-gray-600 mt-1">Tổng quan về hệ thống quản lý âm nhạc</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {statsCards.map((item, idx) => (
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
            <TrendingUp className="w-5 h-5 text-indigo-500 mr-2" />
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
                  <span className="font-bold text-indigo-600 ml-3 whitespace-nowrap">
                    {formatNumber(song.views)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Artists */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
            <User className="w-5 h-5 text-pink-500 mr-2" />
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
                  <span className="font-bold text-pink-600 ml-3 whitespace-nowrap">
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
        <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
          <Clock className="w-5 h-5 text-green-500 mr-2" />
          Bài Hát Mới Thêm Gần Đây
        </h2>
        {recentSongs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recentSongs.map((song, idx) => (
              <li
                key={song.songId || idx}
                className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium truncate">
                    {song.title || "—"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {song.singerName || "—"}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className="text-sm text-gray-400 block">
                    {formatDate(song.releaseDate)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatNumber(song.views)} lượt nghe
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}