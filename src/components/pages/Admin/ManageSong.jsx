import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Edit, Trash, Eye, X, Loader2, Filter, ArrowUpDown } from "lucide-react";
import axios from "../../../configs/apiConfig";
import { useNotification } from "../../../hooks/useNotification";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";
import SongForm from "../../ui/Admin/Song/SongForm";
import Pagination from "../../elements/Pagination";

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

// ✅ Sanitize HTML to prevent XSS
function sanitizeHtml(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

export default function ManageSong() {
  // State management
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Separate search term and debounced search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ New: Filter and sort states
  const [filterGenre, setFilterGenre] = useState("");
  const [filterArtist, setFilterArtist] = useState("");
  const [sortBy, setSortBy] = useState(""); // title, views, releaseDate
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  // Detail modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailSong, setDetailSong] = useState(null);

  // ✅ New: Loading state for individual delete
  const [deletingId, setDeletingId] = useState(null);

  // Constants
  const itemsPerPage = 10;

  // Custom hooks
  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // Fetch songs from backend
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/songs");
      const songData = res.data?.data || res.data || [];
      setSongs(Array.isArray(songData) ? songData : []);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách bài hát");
      showNotification("error", "Không thể tải danh sách bài hát");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // ✅ Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterGenre, filterArtist, sortBy, sortOrder]);

  // ✅ Optimized delete - Remove from state instead of re-fetch
  const handleDelete = async (songId) => {
    // ✅ Validate songId
    if (!songId) {
      showNotification("error", "ID bài hát không hợp lệ");
      return;
    }

    const ok = await confirm("Bạn có chắc muốn xóa bài hát này? Bài hát sẽ bị xóa vĩnh viễn và không thể khôi phục.");
    if (!ok) return;

    setDeletingId(songId);
    try {
      await axios.delete(`/songs/${songId}`);
      
      // ✅ Remove from state instead of re-fetching
      setSongs((prev) => prev.filter((s) => s.songId !== songId));
      showNotification("success", "Đã xóa bài hát thành công!");
      
      // ✅ Adjust pagination if needed
      const newTotal = songs.length - 1;
      const maxPage = Math.ceil(newTotal / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("error", err.response?.data?.message || "Lỗi khi xóa bài hát!");
    } finally {
      setDeletingId(null);
    }
  };

  // View detail handler
  const handleViewDetail = useCallback((song) => {
    setDetailSong(song);
    setIsDetailOpen(true);
  }, []);

  // Open form for adding new song
  const handleAddSong = useCallback(() => {
    setIsEdit(false);
    setEditingSong(null);
    setIsFormOpen(true);
  }, []);

  // Open form for editing song
  const handleEditSong = useCallback((song) => {
    setIsEdit(true);
    setEditingSong(song);
    setIsFormOpen(true);
  }, []);

  // Close form and refresh data
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    fetchSongs();
  }, []);

  // ✅ Get unique genres and artists for filters
  const { uniqueGenres, uniqueArtists } = useMemo(() => {
    const genres = new Set();
    const artists = new Set();
    
    songs.forEach((song) => {
      if (song.genreName) genres.add(song.genreName);
      if (song.singerName) artists.add(song.singerName);
    });

    return {
      uniqueGenres: Array.from(genres).sort(),
      uniqueArtists: Array.from(artists).sort(),
    };
  }, [songs]);

  // ✅ Optimized filtering and sorting with useMemo
  const filteredAndSortedSongs = useMemo(() => {
    let result = songs.filter((song) => {
      const matchSearch = (song?.title || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      
      const matchGenre = !filterGenre || song?.genreName === filterGenre;
      const matchArtist = !filterArtist || song?.singerName === filterArtist;

      return matchSearch && matchGenre && matchArtist;
    });

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let aVal, bVal;

        switch (sortBy) {
          case "title":
            aVal = (a.title || "").toLowerCase();
            bVal = (b.title || "").toLowerCase();
            break;
          case "views":
            aVal = a.views || 0;
            bVal = b.views || 0;
            break;
          case "releaseDate":
            aVal = new Date(a.releaseDate || 0).getTime();
            bVal = new Date(b.releaseDate || 0).getTime();
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
  }, [songs, debouncedSearch, filterGenre, filterArtist, sortBy, sortOrder]);

  // ✅ Optimized pagination with useMemo
  const currentSongs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSongs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedSongs, currentPage, itemsPerPage]);

  // ✅ Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterGenre("");
    setFilterArtist("");
    setSortBy("");
    setSortOrder("asc");
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const dateOnly = String(dateString).substring(0, 10);
      const [year, month, day] = dateOnly.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return "—";
    }
  };

  // Format number helper
  const formatNumber = (num) =>
    num || num === 0 ? num.toLocaleString("vi-VN") : "0";

  // ✅ Toggle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Render table body
  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-600" />
            <p className="text-gray-600 mt-2">Đang tải...</p>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-4 text-red-500">
            {error}
          </td>
        </tr>
      );
    }

    if (currentSongs.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-8 text-gray-600">
            {debouncedSearch || filterGenre || filterArtist ? (
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
              "Không có dữ liệu"
            )}
          </td>
        </tr>
      );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;

    return currentSongs.map((song, index) => (
      <tr
        key={song.songId || index}
        className="border-t hover:bg-gray-50 transition-colors"
      >
        <td className="px-4 py-3 text-center text-gray-700">
          {startIndex + index + 1}
        </td>
        <td className="px-6 py-3 text-gray-800 font-medium truncate max-w-[200px]">
          {song?.title || "—"}
        </td>
        <td className="px-6 py-3 text-gray-700 truncate max-w-[150px]">
          {song?.singerName || song?.singerId || "—"}
        </td>
        <td className="px-6 py-3 text-gray-700 truncate max-w-[120px]">
          {song?.genreName || song?.genreId || "—"}
        </td>
        <td className="px-6 py-3 text-center text-gray-700 whitespace-nowrap">
          {formatDate(song?.releaseDate)}
        </td>
        <td className="px-6 py-3 text-center text-gray-700 whitespace-nowrap">
          {formatNumber(song?.views)}
        </td>
        <td className="px-6 py-3">
          <div className="flex items-center justify-center gap-3">
            <button
              className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
              onClick={() => handleViewDetail(song)}
              title="Xem chi tiết"
            >
              <Eye className="w-5 h-5" />
            </button>

            <button
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 hover:text-black transition"
              onClick={() => handleEditSong(song)}
              title="Chỉnh sửa"
            >
              <Edit className="w-5 h-5" />
            </button>

            <button
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-red-50 text-red-600 hover:text-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleDelete(song.songId)}
              disabled={deletingId === song.songId}
              title="Xóa"
            >
              {deletingId === song.songId ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash className="w-5 h-5" />
              )}
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  // Render detail info items
  const detailInfoItems = detailSong
    ? [
        { label: "Tên bài hát", value: detailSong.title },
        {
          label: "Nghệ sĩ",
          value: detailSong.singerName || detailSong.singerId,
        },
        {
          label: "Thể loại",
          value: detailSong.genreName || detailSong.genreId,
        },
        {
          label: "Ngày phát hành",
          value: formatDate(detailSong.releaseDate),
        },
        {
          label: "Lượt nghe",
          value: formatNumber(detailSong.views),
          color: "text-indigo-600",
        },
      ]
    : [];

  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý bài hát</h1>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Tìm kiếm bài hát..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black w-64"
            />

            <button
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl shadow hover:bg-gray-800 transition"
              onClick={handleAddSong}
            >
              <Plus className="w-5 h-5" />
              Thêm bài hát
            </button>
          </div>
        </div>

        {/* ✅ Filter and Sort Section */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <Filter className="w-5 h-5 text-gray-600" />
          
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          >
            <option value="">Tất cả thể loại</option>
            {uniqueGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

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
              <option value="title">Tên bài hát</option>
              <option value="views">Lượt nghe</option>
              <option value="releaseDate">Ngày phát hành</option>
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

          {(searchTerm || filterGenre || filterArtist || sortBy) && (
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
          Hiển thị <span className="font-semibold">{currentSongs.length}</span> / {" "}
          <span className="font-semibold">{filteredAndSortedSongs.length}</span> bài hát
          {songs.length !== filteredAndSortedSongs.length && (
            <span className="text-gray-500"> (từ tổng {songs.length})</span>
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
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-1 hover:text-black"
                >
                  Tên bài hát
                  {sortBy === "title" && (
                    <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                Nghệ sĩ
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                Thể loại
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b">
                <button
                  onClick={() => handleSort("releaseDate")}
                  className="flex items-center gap-1 hover:text-black mx-auto"
                >
                  Ngày phát hành
                  {sortBy === "releaseDate" && (
                    <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b">
                <button
                  onClick={() => handleSort("views")}
                  className="flex items-center gap-1 hover:text-black mx-auto"
                >
                  Lượt nghe
                  {sortBy === "views" && (
                    <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </th>
              <th className="w-[150px] px-6 py-3 text-center text-sm font-semibold text-gray-900 border-b">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAndSortedSongs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAndSortedSongs.length}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Detail Modal */}
      {isDetailOpen && detailSong && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDetailOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                Chi tiết bài hát
              </h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Cover Image */}
              <div className="flex justify-center">
                {detailSong.coverUrl ? (
                  <img
                    src={detailSong.coverUrl}
                    alt={detailSong.title}
                    className="w-64 h-64 object-cover rounded-xl shadow-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/256?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-64 h-64 rounded-xl shadow-lg bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                    Không có ảnh
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailInfoItems.map(
                  ({ label, value, color = "text-gray-800" }) => (
                    <div key={label} className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">{label}</p>
                      <p className={`text-lg font-semibold ${color}`}>
                        {value || "—"}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Lyrics */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                  Lời bài hát
                </p>
                {detailSong.lyric || detailSong.lyrics ? (
                  <div className="bg-white p-4 rounded-lg shadow-sm max-h-96 overflow-y-auto">
                    <p
                      className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(detailSong.lyric || detailSong.lyrics),
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">
                    Chưa có lời bài hát
                  </p>
                )}
              </div>

              {/* Audio Player */}
              {detailSong.fileUrl && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    Phát nhạc
                  </p>
                  <audio
                    controls
                    className="w-full mt-3"
                    src={detailSong.fileUrl}
                    onError={(e) => {
                      console.error("Audio load error:", e);
                      showNotification("error", "Không thể phát nhạc");
                    }}
                  >
                    Trình duyệt không hỗ trợ phát nhạc
                  </audio>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  handleEditSong(detailSong);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
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

      {/* Song Form Modal */}
      {isFormOpen && (
        <SongForm
          isEdit={isEdit}
          song={editingSong}
          onClose={handleFormClose}
          onSuccess={(msg) => showNotification("success", msg)}
          onError={(msg) => showNotification("error", msg)}
        />
      )}

      {/* Notification and Confirm Dialog */}
      {NotificationUI}
      {ConfirmUI}
    </div>
  );
}