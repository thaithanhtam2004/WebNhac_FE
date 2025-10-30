import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Eye, X } from "lucide-react";
import SongForm from "../../ui/Admin/Song/SongForm";
import Pagination from "../../elements/Pagination";
import axios from "../../../configs/apiConfig";
import { useNotification } from "../../../hooks/useNotification";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";

export default function ManageSong() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  // State cho modal chi tiết
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailSong, setDetailSong] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Hooks thông báo & xác nhận
  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // === Fetch songs from backend ===
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/songs");
      console.log("Fetched songs:", res.data);

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

  // === Delete song ===
  const handleDelete = async (songId) => {
    const ok = await confirm("Bạn có chắc muốn xóa bài hát này?");
    if (!ok) return;

    try {
      await axios.delete(`/songs/${songId}`);
      await fetchSongs();
      showNotification("success", "Đã xóa bài hát thành công!");
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("error", "Lỗi khi xóa bài hát!");
    }
  };

  // === Xem chi tiết ===
  const handleViewDetail = (song) => {
    setDetailSong(song);
    setIsDetailOpen(true);
  };

  // === Filter + Pagination ===
  const filteredSongs = songs.filter((s) =>
    (s?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSongs = filteredSongs.slice(startIndex, startIndex + itemsPerPage);

  // === Format helpers ===
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

  const formatNumber = (num) =>
    num || num === 0 ? num.toLocaleString("vi-VN") : "0";

  const truncateUrl = (url) => {
    if (!url) return "—";
    const maxLength = 30;
    return url.length <= maxLength ? url : url.substring(0, maxLength) + "...";
  };

  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý bài hát</h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm bài hát..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl shadow hover:bg-gray-800 transition"
            onClick={() => {
              setIsEdit(false);
              setEditingSong(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            Thêm bài hát
          </button>
        </div>
      </div>

      {/* Table */}
        <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-auto max-h-[70vh]">
            <table className="table-fixed w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                <th className="w-[60px] px-2 py-3 text-center text-sm font-semibold text-gray-900 border-b">STT</th>
                <th className="w-[220px] px-3 py-3 text-left text-sm font-semibold text-gray-900 border-b">Tên bài hát</th>
                <th className="w-[180px] px-3 py-3 text-left text-sm font-semibold text-gray-900 border-b">Nghệ sĩ</th>
                <th className="w-[160px] px-3 py-3 text-left text-sm font-semibold text-gray-900 border-b">Thể loại</th>
                <th className="w-[130px] px-3 py-3 text-center text-sm font-semibold text-gray-900 border-b">Ngày phát hành</th>
                <th className="w-[120px] px-3 py-3 text-center text-sm font-semibold text-gray-900 border-b">Lượt nghe</th>
                <th className="w-[150px] px-3 py-3 text-center text-sm font-semibold text-gray-900 border-b">Hành động</th>
                </tr>
            </thead>

            <tbody>
                {loading ? (
                <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-600">Đang tải...</td>
                </tr>
                ) : error ? (
                <tr>
                    <td colSpan="7" className="text-center py-4 text-red-500">{error}</td>
                </tr>
                ) : currentSongs.length === 0 ? (
                <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-600">Không có dữ liệu</td>
                </tr>
                ) : (
                currentSongs.map((song, index) => (
                    <tr
                    key={song.songId || index}
                    className="border-t hover:bg-gray-50 transition-colors"
                    >
                    <td className="px-2 py-3 text-center text-gray-700">
                        {startIndex + index + 1}
                    </td>

                    <td className="px-3 py-3 text-gray-800 font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap w-[220px]">
                        {song?.title || "—"}
                    </td>

                    <td className="px-3 py-3 text-gray-700 truncate overflow-hidden text-ellipsis whitespace-nowrap w-[180px]">
                        {song?.singerName || song?.singerId || "—"}
                    </td>

                    <td className="px-3 py-3 text-gray-700 truncate overflow-hidden text-ellipsis whitespace-nowrap w-[160px]">
                        {song?.genreName || song?.genreId || "—"}
                    </td>

                    <td className="px-3 py-3 text-center text-gray-700 whitespace-nowrap w-[130px]">
                        {formatDate(song?.releaseDate)}
                    </td>

                    <td className="px-3 py-3 text-center text-gray-700 whitespace-nowrap w-[120px]">
                        {formatNumber(song?.views)}
                    </td>

                    <td className="px-3 py-3 w-[150px]">
                        <div className="flex items-center justify-center gap-2">
                        <button
                            className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                            onClick={() => handleViewDetail(song)}
                            title="Xem chi tiết"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <button
                            className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100 text-gray-700 hover:text-black transition"
                            onClick={() => {
                            setIsEdit(true);
                            setEditingSong(song);
                            setIsFormOpen(true);
                            }}
                            title="Chỉnh sửa"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                        <button
                            className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                            onClick={() => handleDelete(song.songId)}
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
        </div>


      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredSongs.length}
        onPageChange={setCurrentPage}
      />

      {/* Modal Chi tiết bài hát */}
      {isDetailOpen && detailSong && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết bài hát</h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Ảnh bìa */}
              {detailSong.coverUrl && (
                <div className="flex justify-center">
                  <img
                    src={detailSong.coverUrl}
                    alt={detailSong.title}
                    className="w-64 h-64 object-cover rounded-xl shadow-lg"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/256?text=No+Image";
                    }}
                  />
                </div>
              )}

              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Tên bài hát</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {detailSong.title || "—"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Nghệ sĩ</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {detailSong.singerName || detailSong.singerId || "—"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Thể loại</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {detailSong.genreName || detailSong.genreId || "—"}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Ngày phát hành</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatDate(detailSong.releaseDate)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Lượt nghe</p>
                  <p className="text-lg font-semibold text-indigo-600">
                    {formatNumber(detailSong.views)}
                  </p>
                </div>
              </div>

              {/* Lời bài hát */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                  Lời bài hát
                </p>
                {detailSong.lyric || detailSong.lyrics ? (
                  <div className="bg-white p-4 rounded-lg shadow-sm max-h-96 overflow-y-auto">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                      {detailSong.lyric || detailSong.lyrics}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">
                    Chưa có lời bài hát
                  </p>
                )}
              </div>

              {/* File nhạc (Giữ lại thẻ audio, bỏ URL) */}
              {detailSong.fileUrl && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Phát nhạc</p>
                  {/* Audio player */}
                  <audio
                    controls
                    className="w-full mt-3"
                    src={detailSong.fileUrl}
                  >
                    Trình duyệt không hỗ trợ phát nhạc
                  </audio>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsEdit(true);
                  setEditingSong(detailSong);
                  setIsFormOpen(true);
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
          onClose={() => {
            setIsFormOpen(false);
            fetchSongs();
          }}
          onSuccess={(msg) => showNotification("success", msg)}
          onError={(msg) => showNotification("error", msg)}
        />
      )}

      {/* Notification + Confirm */}
      {NotificationUI}
      {ConfirmUI}
    </div>
  );
}