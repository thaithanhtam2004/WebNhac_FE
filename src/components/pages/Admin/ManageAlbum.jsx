import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Eye, X, Music } from "lucide-react";
import AlbumForm from "../../ui/Admin/Album/AlbumForm";
import Pagination from "../../elements/Pagination";
import axios from "../../../configs/apiConfig";
import { useNotification } from "../../../hooks/useNotification";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailAlbum, setDetailAlbum] = useState(null);
  const [albumSongs, setAlbumSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);

  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [songSearch, setSongSearch] = useState("");
  const [songPage, setSongPage] = useState(1);

  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  const itemsPerPage = 10;

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/albums");
      console.log("Fetched albums:", res.data);
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

  useEffect(() => {
    fetchAlbums();
  }, []);

  // 🎵 Fetch songs in album - ĐÃ CHỈNH SỬA ENCODE URL
  const fetchAlbumSongs = async (albumId) => {
    try {
      setLoadingSongs(true);
      
      if (!albumId) {
        console.error("Album ID is missing!");
        setAlbumSongs([]);
        return;
      }
      
      const cleanAlbumId = String(albumId).trim();
      // ✅ SỬ DỤNG encodeURIComponent để giải quyết lỗi 400 Bad Request
      const encodedAlbumId = encodeURIComponent(cleanAlbumId);

      const url = `/albums/${encodedAlbumId}/songs`;
      console.log("Request URL:", url);
      
      const res = await axios.get(url);
      console.log("Raw response:", res.data);
      
      // ✅ Xử lý đúng structure response
      let songsData;
      if (res.data?.data) {
        songsData = res.data.data;
      } else if (res.data?.songs) {
        songsData = res.data.songs;
      } else if (Array.isArray(res.data)) {
        songsData = res.data;
      } else {
        songsData = [];
      }

      console.log("Processed songs data:", songsData);
      setAlbumSongs(Array.isArray(songsData) ? songsData : []);
    } catch (err) {
      console.error("Fetch album songs error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error config:", err.config);
      setAlbumSongs([]);
      showNotification("error", err.response?.data?.message || "Không thể tải danh sách bài hát");
    } finally {
      setLoadingSongs(false);
    }
  };

  const handleViewDetail = async (album) => {
    console.log("Opening detail for album:", album);
    setDetailAlbum(album);
    setIsDetailOpen(true);
    
    // ✅ Đảm bảo lấy đúng albumId
    const albumId = album.albumId || album._id || album.id;
    console.log("Extracted album ID:", albumId);
    
    if (albumId) {
      await fetchAlbumSongs(albumId);
    } else {
      console.error("Cannot extract album ID from:", album);
      showNotification("error", "Không tìm thấy ID album");
    }
  };

  const handleDelete = async (albumId) => {
    const ok = await confirm("Bạn có chắc muốn xóa album này?");
    if (!ok) return;

    try {
      await axios.delete(`/albums/${albumId}`);
      await fetchAlbums();
      showNotification("success", "Đã xóa album thành công!");
    } catch (err) {
      console.error("Delete album error:", err);
      showNotification("error", "Không thể xóa album");
    }
  };

  const handleRemoveSongFromAlbum = async (songId) => {
    const ok = await confirm("Bạn có chắc muốn xóa bài hát này khỏi album?");
    if (!ok) return;

    try {
      const albumId = detailAlbum.albumId || detailAlbum._id || detailAlbum.id;
      await axios.delete(`/albums/${albumId}/songs/${songId}`);
      await fetchAlbumSongs(albumId);
      showNotification("success", "Đã xóa bài hát khỏi album!");
    } catch (err) {
      console.error("Remove song error:", err);
      showNotification("error", "Không thể xóa bài hát");
    }
  };

  const handleOpenAddSong = async () => {
    try {
      const res = await axios.get("/songs");
      const allSongs = res.data?.data || res.data || [];
      
      const currentSongIds = albumSongs.map(s => s.songId || s._id);
      const available = allSongs.filter(s => !currentSongIds.includes(s.songId || s._id));
      
      setAvailableSongs(available);
      setSelectedSongs([]);
      setSongSearch("");
      setSongPage(1);
      setIsAddSongOpen(true);
    } catch (err) {
      console.error("Fetch songs error:", err);
      showNotification("error", "Không thể tải danh sách bài hát");
    }
  };

  // ➕ Thêm bài hát vào album
  const handleAddSongsToAlbum = async () => {
    if (selectedSongs.length === 0) {
      showNotification("error", "Vui lòng chọn ít nhất 1 bài hát");
      return;
    }

    try {
      const albumId = detailAlbum.albumId || detailAlbum._id || detailAlbum.id;
      
      console.log("=== ADDING SONGS ===");
      console.log("Selected songs:", selectedSongs);
      console.log("Album ID:", albumId);
      
      const response = await axios.post(`/albums/${albumId}/songs`, {
        songIds: selectedSongs
      });
      
      console.log("Add response:", response.data);
      
      // Đóng modal trước
      setIsAddSongOpen(false);
      
      // Refresh danh sách bài hát
      console.log("Refreshing song list...");
      await fetchAlbumSongs(albumId);
      
      showNotification("success", `Đã thêm ${selectedSongs.length} bài hát vào album!`);
    } catch (err) {
      console.error("=== ADD SONGS ERROR ===");
      console.error("Error:", err);
      console.error("Response:", err.response?.data);
      showNotification("error", err.response?.data?.message || "Không thể thêm bài hát");
    }
  };

  const filteredAlbums = albums.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.singerName?.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlbums = filteredAlbums.slice(startIndex, startIndex + itemsPerPage);

  // ✅ Hàm chỉ lấy năm
  const formatReleaseYear = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).getFullYear() || "—";
    } catch {
      return "—";
    }
  };

  // Giữ lại formatFullDate
  const formatFullDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const dateOnly = String(dateString).substring(0, 10);
      const [year, month, day] = dateOnly.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return "—";
    }
  };

  const truncateText = (text, len = 50) =>
    text?.length > len ? text.substring(0, len) + "..." : text || "—";

  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Album</h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm album..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
          />
          <button
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl shadow hover:bg-gray-800 transition"
            onClick={() => {
              setIsEdit(false);
              setEditingAlbum(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5" /> Thêm album
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 w-12">STT</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên Album</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nghệ sĩ</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Năm</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mô tả</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-600">Đang tải...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-red-500">{error}</td>
              </tr>
            ) : paginatedAlbums.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-600 italic">Không có album nào</td>
              </tr>
            ) : (
              paginatedAlbums.map((album, index) => (
                <tr key={album.albumId || album.id || index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-700 font-medium">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-3 text-gray-700">{album?.name || "—"}</td>
                  <td className="px-6 py-3 text-gray-700">{album?.singerName || "—"}</td>
                  <td className="px-6 py-3 text-center text-gray-700">
                    {formatReleaseYear(album?.releaseDate)}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {truncateText(album?.description, 60)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetail(album)}
                        className="p-2 border rounded-full bg-white shadow-sm hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEdit(true);
                          setEditingAlbum(album);
                          setIsFormOpen(true);
                        }}
                        className="p-2 border rounded-full bg-white shadow-sm hover:bg-gray-100 text-gray-700 hover:text-black transition"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(album.albumId || album.id || album._id)}
                        className="p-2 border rounded-full bg-white shadow-sm hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                        title="Xóa"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredAlbums.length}
        onPageChange={setCurrentPage}
      />

      {/* Modal Chi tiết Album */}
      {isDetailOpen && detailAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết Album</h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {detailAlbum.coverUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={detailAlbum.coverUrl}
                      alt={detailAlbum.name}
                      className="w-48 h-48 object-cover rounded-xl shadow-lg"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/192?text=No+Image";
                      }}
                    />
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tên Album</p>
                    <p className="text-2xl font-bold text-gray-800">{detailAlbum.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nghệ sĩ</p>
                    <p className="text-lg font-semibold text-gray-800">{detailAlbum.singerName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Năm phát hành</p>
                    <p className="text-gray-800 font-semibold">{formatReleaseYear(detailAlbum.releaseDate)}</p>
                  </div>
                  {detailAlbum.description && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Mô tả</p>
                      <p className="text-gray-700">{detailAlbum.description}</p>
                    </div>
                  )}
                </div>
              </div>

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
                  <p className="text-center py-8 text-gray-600">Đang tải...</p>
                ) : albumSongs.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 italic">Chưa có bài hát nào trong album</p>
                ) : (
                  <div className="space-y-2">
                    {albumSongs.map((song, index) => (
                      <div
                        key={song.songId || index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-3">
                            {/* HIỂN THỊ trackNumber (ưu tiên trackNumber từ DB, nếu không có thì dùng index) */}
                          <span className="text-sm font-medium text-gray-500 w-6">
                            {song.trackNumber || index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-800">{song.title || "—"}</p>
                            <p className="text-sm text-gray-600">{song.singerName || song.singerId || "—"}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSongFromAlbum(song.songId || song._id)}
                          className="p-2 hover:bg-red-50 rounded-full text-red-600 transition"
                          title="Xóa khỏi album"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsEdit(true);
                  setEditingAlbum(detailAlbum);
                  setIsFormOpen(true);
                }}
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

      {/* Modal Thêm bài hát vào Album - IMPROVED */}
      {isAddSongOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Thêm bài hát vào Album</h3>
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
              <p className="text-sm text-gray-600 mt-2">
                Tổng số: <span className="font-semibold">{availableSongs.length}</span> bài hát
              </p>
            </div>

            {/* Song List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {(() => {
                const filteredSongs = availableSongs.filter(song => {
                  const searchLower = songSearch.toLowerCase();
                  return (
                    song.title?.toLowerCase().includes(searchLower) ||
                    song.singerName?.toLowerCase().includes(searchLower)
                  );
                });

                const songsPerPage = 10;
                const startIdx = (songPage - 1) * songsPerPage;
                const paginatedSongs = filteredSongs.slice(startIdx, startIdx + songsPerPage);
                const totalPages = Math.ceil(filteredSongs.length / songsPerPage);

                if (filteredSongs.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Music className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 italic">
                        {songSearch ? "Không tìm thấy bài hát nào" : "Không có bài hát nào để thêm"}
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
                            paginatedSongs.every(song =>
                              selectedSongs.includes(song.songId || song._id)
                            )
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newIds = paginatedSongs
                                .map(s => s.songId || s._id)
                                .filter(id => !selectedSongs.includes(id));
                              setSelectedSongs([...selectedSongs, ...newIds]);
                            } else {
                              const pageIds = paginatedSongs.map(s => s.songId || s._id);
                              setSelectedSongs(selectedSongs.filter(id => !pageIds.includes(id)));
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
                                  setSelectedSongs(selectedSongs.filter(id => id !== songId));
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
                                  e.target.src = "https://via.placeholder.com/48?text=♪";
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{song.title}</p>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setSongPage(p => Math.max(1, p - 1))}
                          disabled={songPage === 1}
                          className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          ‹ Trước
                        </button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (songPage <= 3) {
                              pageNum = i + 1;
                            } else if (songPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = songPage - 2 + i;
                            }
                            
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
                          })}
                        </div>

                        <button
                          onClick={() => setSongPage(p => Math.min(totalPages, p + 1))}
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
                    Đã chọn: <span className="font-bold text-lg text-black">{selectedSongs.length}</span> bài hát
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

      {isFormOpen && (
        <AlbumForm
          isEdit={isEdit}
          album={editingAlbum}
          onClose={() => {
            setIsFormOpen(false);
            fetchAlbums();
          }}
          onSuccess={(msg) => showNotification("success", msg)}
          onError={(msg) => showNotification("error", msg)}
        />
      )}

      {NotificationUI}
      {ConfirmUI}
    </div>
  );
}