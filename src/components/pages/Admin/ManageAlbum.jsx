import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Edit, Trash, Eye, X, Music, Loader2, Filter, ArrowUpDown } from "lucide-react";
import AlbumForm from "../../ui/Admin/Album/AlbumForm";
import Pagination from "../../elements/Pagination";
import axios from "../../../configs/apiConfig";
import { useNotification } from "../../../hooks/useNotification";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";

// ✅ Custom hook for debounced value
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function Albums() {
  // === State Management ===
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Separate search term and debounced search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ New: Filter and sort states
  const [sortBy, setSortBy] = useState(""); // name, year, songCount
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [filterArtist, setFilterArtist] = useState("");

  // === Form States ===
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  // === Detail Modal States ===
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailAlbum, setDetailAlbum] = useState(null);
  const [albumSongs, setAlbumSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);

  // === "Add Song" Modal States ===
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [songSearch, setSongSearch] = useState("");
  const [songPage, setSongPage] = useState(1);

  // ✅ New: Loading states for individual actions
  const [deletingId, setDeletingId] = useState(null);
  const [removingSongId, setRemovingSongId] = useState(null);

  // === Constants ===
  const itemsPerPage = 10;

  // === Custom Hooks ===
  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // === Data Fetching ===

  /**
   * Tải danh sách tất cả album
   */
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/albums");
      const data = res.data?.data || res.data || [];
      setAlbums(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Fetch albums error:", err);
      setError("Không thể tải danh sách album");
      showNotification("error", "Không thể tải danh sách album");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tải danh sách bài hát thuộc một album cụ thể
   */
  const fetchAlbumSongs = async (albumId) => {
    try {
      setLoadingSongs(true);
      if (!albumId) {
        console.error("Album ID is missing!");
        setAlbumSongs([]);
        return;
      }

      const cleanAlbumId = String(albumId).trim();
      const encodedAlbumId = encodeURIComponent(cleanAlbumId);
      const url = `/albums/${encodedAlbumId}/songs`;

      const res = await axios.get(url);

      let songsData;
      if (res.data?.data) songsData = res.data.data;
      else if (res.data?.songs) songsData = res.data.songs;
      else if (Array.isArray(res.data)) songsData = res.data;
      else songsData = [];

      setAlbumSongs(Array.isArray(songsData) ? songsData : []);
    } catch (err) {
      console.error("Fetch album songs error:", err);
      setAlbumSongs([]);
      showNotification(
        "error",
        err.response?.data?.message || "Không thể tải danh sách bài hát"
      );
    } finally {
      setLoadingSongs(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  // ✅ Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterArtist, sortBy, sortOrder]);

  // === Event Handlers ===

  /**
   * Mở modal chi tiết và tải bài hát của album
   */
  const handleViewDetail = useCallback(async (album) => {
    setDetailAlbum(album);
    setIsDetailOpen(true);

    const albumId = album.albumId || album._id || album.id;

    if (albumId) {
      await fetchAlbumSongs(albumId);
    } else {
      console.error("Cannot extract album ID from:", album);
      showNotification("error", "Không tìm thấy ID album");
    }
  }, []);

  /**
   * ✅ Optimized delete - Remove from state instead of re-fetch
   */
  const handleDelete = async (albumId) => {
    if (!albumId) {
      showNotification("error", "ID album không hợp lệ");
      return;
    }

    const ok = await confirm("Bạn có chắc muốn xóa album này?");
    if (!ok) return;

    setDeletingId(albumId);
    try {
      await axios.delete(`/albums/${albumId}`);
      
      // ✅ Remove from state instead of re-fetching
      setAlbums((prev) => prev.filter((a) => {
        const id = a.albumId || a._id || a.id;
        return id !== albumId;
      }));
      showNotification("success", "Đã xóa album thành công!");
      
      // ✅ Adjust pagination if needed
      const newTotal = albums.length - 1;
      const maxPage = Math.ceil(newTotal / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (err) {
      console.error("Delete album error:", err);
      showNotification("error", err.response?.data?.message || "Không thể xóa album");
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * ✅ Optimized remove song - Update local state
   */
  const handleRemoveSongFromAlbum = async (songId) => {
    const ok = await confirm("Bạn có chắc muốn xóa bài hát này khỏi album?");
    if (!ok) return;

    setRemovingSongId(songId);
    try {
      const albumId = detailAlbum.albumId || detailAlbum._id || detailAlbum.id;
      await axios.delete(`/albums/${albumId}/songs/${songId}`);
      
      // ✅ Update local state instead of re-fetching
      setAlbumSongs((prev) => prev.filter((s) => {
        const id = s.songId || s._id;
        return id !== songId;
      }));
      showNotification("success", "Đã xóa bài hát khỏi album!");
    } catch (err) {
      console.error("Remove song error:", err);
      showNotification("error", err.response?.data?.message || "Không thể xóa bài hát");
    } finally {
      setRemovingSongId(null);
    }
  };

  /**
   * Mở modal "Thêm bài hát" và tải danh sách bài hát có sẵn
   * ✅ CẬP NHẬT: Thêm logic lọc bài hát theo Ca sĩ
   */
  const handleOpenAddSong = useCallback(async () => {
    try {
      const res = await axios.get("/songs");
      const allSongs = res.data?.data || res.data || [];

      // 1. Lọc bài đã có trong album
      const currentSongIds = albumSongs.map((s) => s.songId || s._id);
      let available = allSongs.filter(
        (s) => !currentSongIds.includes(s.songId || s._id)
      );

      // ✅ 2. [LOGIC MỚI] Chỉ lấy bài hát CÙNG CA SĨ với Album
      if (detailAlbum && detailAlbum.singerId) {
         available = available.filter(s => String(s.singerId) === String(detailAlbum.singerId));
      }

      setAvailableSongs(available);
      setSelectedSongs([]);
      setSongSearch("");
      setSongPage(1);
      setIsAddSongOpen(true);
    } catch (err) {
      console.error("Fetch songs error:", err);
      showNotification("error", "Không thể tải danh sách bài hát");
    }
  }, [albumSongs, detailAlbum]); // ✅ Thêm detailAlbum vào dependency

  /**
   * Xử lý thêm các bài hát đã chọn vào album
   */
  const handleAddSongsToAlbum = async () => {
    if (selectedSongs.length === 0) {
      showNotification("error", "Vui lòng chọn ít nhất 1 bài hát");
      return;
    }

    try {
      const albumId = detailAlbum.albumId || detailAlbum._id || detailAlbum.id;

      await axios.post(`/albums/${albumId}/songs`, {
        songIds: selectedSongs,
      });

      setIsAddSongOpen(false);
      await fetchAlbumSongs(albumId); // Reload songs in album
      showNotification(
        "success",
        `Đã thêm ${selectedSongs.length} bài hát vào album!`
      );
    } catch (err) {
      console.error("Add songs error:", err);
      showNotification(
        "error",
        err.response?.data?.message || "Không thể thêm bài hát"
      );
    }
  };

  const handleAddAlbum = useCallback(() => {
    setIsEdit(false);
    setEditingAlbum(null);
    setIsFormOpen(true);
  }, []);

  const handleEditAlbum = useCallback((album) => {
    setIsEdit(true);
    setEditingAlbum(album);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    fetchAlbums();
  }, []);

  const handleEditFromDetail = useCallback(() => {
    setIsDetailOpen(false);
    handleEditAlbum(detailAlbum);
  }, [detailAlbum]);

  // ✅ Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterArtist("");
    setSortBy("");
    setSortOrder("asc");
  }, []);

  // ✅ Get unique artists for filter
  const uniqueArtists = useMemo(() => {
    const artists = new Set();
    albums.forEach((album) => {
      if (album.singerName) artists.add(album.singerName);
    });
    return Array.from(artists).sort();
  }, [albums]);

  // ✅ Optimized filtering and sorting with useMemo
  const filteredAndSortedAlbums = useMemo(() => {
    let result = albums.filter((album) => {
      const matchSearch = 
        (album?.name || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (album?.singerName || "").toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchArtist = !filterArtist || album?.singerName === filterArtist;

      return matchSearch && matchArtist;
    });

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let aVal, bVal;

        switch (sortBy) {
          case "name":
            aVal = (a.name || "").toLowerCase();
            bVal = (b.name || "").toLowerCase();
            break;
          case "year":
            aVal = a.releaseDate ? new Date(a.releaseDate).getFullYear() : 0;
            bVal = b.releaseDate ? new Date(b.releaseDate).getFullYear() : 0;
            break;
          case "songCount":
            aVal = a.songCount || 0;
            bVal = b.songCount || 0;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [albums, debouncedSearch, filterArtist, sortBy, sortOrder]);

  // ✅ Optimized pagination with useMemo
  const currentAlbums = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAlbums.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedAlbums, currentPage, itemsPerPage]);

  // ✅ Toggle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // === Helper Functions ===

  /**
   * Lấy năm từ chuỗi ngày tháng
   */
  const formatReleaseYear = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).getFullYear() || "—";
    } catch {
      return "—";
    }
  };

  /**
   * Rút gọn văn bản
   */
  const truncateText = (text, len = 50) =>
    text?.length > len ? text.substring(0, len) + "..." : text || "—";

  // === JSX Return ===
  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Album</h1>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Tìm kiếm album..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black w-64"
            />

            <button
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl shadow hover:bg-gray-800 transition"
              onClick={handleAddAlbum}
            >
              <Plus className="w-5 h-5" />
              Thêm album
            </button>
          </div>
        </div>

        {/* ✅ Filter and Sort Section */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <Filter className="w-5 h-5 text-gray-600" />
          
          <select
            value={filterArtist}
            onChange={(e) => setFilterArtist(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          >
            <option value="">Tất cả nghệ sĩ</option>
            {uniqueArtists.map((artist) => (
              <option key={artist} value={artist}>
                {artist}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">Sắp xếp theo</option>
              <option value="name">Tên album</option>
              <option value="year">Năm phát hành</option>
              <option value="songCount">Số bài hát</option>
            </select>

            {sortBy && (
              <button
                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
              >
                {sortOrder === "asc" ? "↑ Tăng" : "↓ Giảm"}
              </button>
            )}
          </div>

          {(searchTerm || filterArtist || sortBy) && (
            <button
              onClick={handleClearFilters}
              className="ml-auto px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold">{currentAlbums.length}</span> / {" "}
          <span className="font-semibold">{filteredAndSortedAlbums.length}</span> album
          {albums.length !== filteredAndSortedAlbums.length && (
            <span className="text-gray-500"> (từ tổng {albums.length})</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-[60px] px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">
                STT
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 hover:text-black"
                >
                  Tên Album
                  {sortBy === "name" && (
                    <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                Nghệ sĩ
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b">
                <button
                  onClick={() => handleSort("year")}
                  className="flex items-center gap-1 hover:text-black mx-auto"
                >
                  Năm
                  {sortBy === "year" && (
                    <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                Mô tả
              </th>
              <th className="w-[150px] px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-600" />
                  <p className="text-gray-600 mt-2">Đang tải...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : currentAlbums.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-600">
                  {debouncedSearch || filterArtist ? (
                    <div>
                      <p className="text-lg mb-2">Không tìm thấy kết quả</p>
                      <button
                        onClick={handleClearFilters}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  ) : (
                    "Không có album nào"
                  )}
                </td>
              </tr>
            ) : (
              currentAlbums.map((album, index) => {
                const albumId = album.albumId || album.id || album._id;
                const startIndex = (currentPage - 1) * itemsPerPage;
                
                return (
                  <tr
                    key={albumId || index}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-gray-700">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-3 text-gray-800 font-medium truncate max-w-[200px]">
                      {album?.name || "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-700 truncate max-w-[150px]">
                      {album?.singerName || "—"}
                    </td>
                    <td className="px-6 py-3 text-center text-gray-700">
                      {formatReleaseYear(album?.releaseDate)}
                    </td>
                    <td className="px-6 py-3 text-gray-600 truncate max-w-[300px]">
                      {truncateText(album?.description, 60)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewDetail(album)}
                          className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditAlbum(album)}
                          className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 hover:text-black transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(albumId)}
                          disabled={deletingId === albumId}
                          className="p-2 rounded-full bg-white border border-gray-300 hover:bg-red-50 text-red-600 hover:text-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xóa"
                        >
                          {deletingId === albumId ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAndSortedAlbums.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAndSortedAlbums.length}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Modal: Chi tiết Album */}
      {isDetailOpen && detailAlbum && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDetailOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết Album</h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Album Cover */}
                <div className="flex-shrink-0">
                  {detailAlbum.coverUrl ? (
                    <img
                      src={detailAlbum.coverUrl}
                      alt={detailAlbum.name}
                      className="w-48 h-48 object-cover rounded-xl shadow-lg"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/192?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-xl shadow-lg bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                      Không có ảnh
                    </div>
                  )}
                </div>

                {/* Album Info */}
                <div className="flex-1 space-y-3">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Tên Album</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {detailAlbum.name || "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Nghệ sĩ</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {detailAlbum.singerName || "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Năm phát hành</p>
                    <p className="text-gray-800 font-semibold">
                      {formatReleaseYear(detailAlbum.releaseDate)}
                    </p>
                  </div>
                  {detailAlbum.description && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Mô tả</p>
                      <p className="text-gray-700">{detailAlbum.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Song List in Album */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Danh sách bài hát ({albumSongs.length})
                  </h3>
                  <button
                    onClick={handleOpenAddSong}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm bài hát
                  </button>
                </div>

                {loadingSongs ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-600" />
                    <p className="text-gray-600 mt-2">Đang tải...</p>
                  </div>
                ) : albumSongs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 italic">
                      Chưa có bài hát nào trong album
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {albumSongs.map((song, index) => {
                      const songId = song.songId || song._id;
                      return (
                        <div
                          key={songId || index}
                          className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500 w-6">
                              {song.trackNumber || index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-800">
                                {song.title || "—"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {song.singerName || song.singerId || "—"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveSongFromAlbum(songId)}
                            disabled={removingSongId === songId}
                            className="p-2 hover:bg-red-50 rounded-full text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Xóa khỏi album"
                          >
                            {removingSongId === songId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={handleEditFromDetail}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa Album
              </button>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Thêm bài hát vào Album */}
      {isAddSongOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                Thêm bài hát vào Album
              </h3>
              <button
                onClick={() => setIsAddSongOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài hát theo tên hoặc nghệ sĩ..."
                  value={songSearch}
                  onChange={(e) => {
                    setSongSearch(e.target.value);
                    setSongPage(1);
                  }}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <Music className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              
              {/* ✅ UI UPDATE: Dòng thông báo đang lọc theo ca sĩ */}
              <p className="text-sm text-gray-600 mt-2">
                Tổng số: <span className="font-semibold">{availableSongs.length}</span> bài hát
                {detailAlbum && detailAlbum.singerName && (
                  <span className="text-blue-600 ml-1">
                    (Đang lọc theo ca sĩ: <b>{detailAlbum.singerName}</b>)
                  </span>
                )}
              </p>
            </div>

            {/* Song List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {(() => {
                const filteredSongs = availableSongs.filter((song) => {
                  const searchLower = songSearch.toLowerCase();
                  return (
                    song.title?.toLowerCase().includes(searchLower) ||
                    song.singerName?.toLowerCase().includes(searchLower)
                  );
                });

                const songsPerPage = 10;
                const startIdx = (songPage - 1) * songsPerPage;
                const paginatedSongs = filteredSongs.slice(
                  startIdx,
                  startIdx + songsPerPage
                );
                const totalPages = Math.ceil(
                  filteredSongs.length / songsPerPage
                );

                if (filteredSongs.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Music className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 italic">
                        {songSearch
                          ? "Không tìm thấy bài hát nào"
                          : "Không có bài hát nào phù hợp của ca sĩ này"}
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Select All Checkbox */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                        <input
                          type="checkbox"
                          checked={
                            paginatedSongs.length > 0 &&
                            paginatedSongs.every((song) =>
                              selectedSongs.includes(song.songId || song._id)
                            )
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newIds = paginatedSongs
                                .map((s) => s.songId || s._id)
                                .filter((id) => !selectedSongs.includes(id));
                              setSelectedSongs([...selectedSongs, ...newIds]);
                            } else {
                              const pageIds = paginatedSongs.map(
                                (s) => s.songId || s._id
                              );
                              setSelectedSongs(
                                selectedSongs.filter(
                                  (id) => !pageIds.includes(id)
                                )
                              );
                            }
                          }}
                          className="w-4 h-4 text-black focus:ring-2 focus:ring-black rounded"
                        />
                        <span className="font-medium text-gray-700">
                          Chọn tất cả trang này ({paginatedSongs.length} bài)
                        </span>
                      </label>
                    </div>

                    {/* Song Items */}
                    <div className="space-y-2">
                      {paginatedSongs.map((song) => {
                        const songId = song.songId || song._id;
                        const isSelected = selectedSongs.includes(songId);

                        return (
                          <label
                            key={songId}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                              isSelected
                                ? "bg-blue-50 border-2 border-blue-500"
                                : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSongs([...selectedSongs, songId]);
                                } else {
                                  setSelectedSongs(
                                    selectedSongs.filter((id) => id !== songId)
                                  );
                                }
                              }}
                              className="w-4 h-4 text-black focus:ring-2 focus:ring-black rounded"
                            />
                            {song.coverUrl && (
                              <img
                                src={song.coverUrl}
                                alt={song.title}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/48?text=♪";
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {song.title}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {song.singerName || song.singerId || "—"}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="flex-shrink-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                ✓ Đã chọn
                              </div>
                            )}
                          </label>
                        );
                      })}
                    </div>

                    {/* Pagination for "Add Song" modal */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setSongPage((p) => Math.max(1, p - 1))}
                          disabled={songPage === 1}
                          className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          ‹ Trước
                        </button>
                        <div className="flex gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) pageNum = i + 1;
                              else if (songPage <= 3) pageNum = i + 1;
                              else if (songPage >= totalPages - 2)
                                pageNum = totalPages - 4 + i;
                              else pageNum = songPage - 2 + i;

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setSongPage(pageNum)}
                                  className={`w-8 h-8 rounded-lg transition ${
                                    songPage === pageNum
                                      ? "bg-black text-white font-semibold"
                                      : "bg-gray-100 hover:bg-gray-200"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setSongPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={songPage === totalPages}
                          className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Sau ›
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Đã chọn:{" "}
                    <span className="font-bold text-lg text-black">
                      {selectedSongs.length}
                    </span>{" "}
                    bài hát
                  </p>
                  {selectedSongs.length > 0 && (
                    <button
                      onClick={() => setSelectedSongs([])}
                      className="text-sm text-red-600 hover:text-red-800 mt-1"
                    >
                      Bỏ chọn tất cả
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsAddSongOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddSongsToAlbum}
                    disabled={selectedSongs.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm {selectedSongs.length > 0 ? `(${selectedSongs.length})` : ""}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Form Thêm/Sửa Album */}
      {isFormOpen && (
        <AlbumForm
          isEdit={isEdit}
          album={editingAlbum}
          onClose={handleFormClose}
          onSuccess={(msg) => showNotification("success", msg)}
          onError={(msg) => showNotification("error", msg)}
        />
      )}

      {/* Notifications and Confirm Dialogs */}
      {NotificationUI}
      {ConfirmUI}
    </div>
  );
}