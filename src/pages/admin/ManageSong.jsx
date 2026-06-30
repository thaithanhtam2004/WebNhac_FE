import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "../../config/api";
import SongForm from "./SongForm";
import Pagination from "../../components/common/Pagination";
import { useNotification } from "../../hooks/useNotification";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useScrollLock } from "../../hooks/useScrollLock";

import {
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  X,
  Loader2,
  Info,
  HelpCircle,
} from "lucide-react";

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}


// Custom Select Component to replace native <select>
const CustomSelect = ({ value, options, onChange, placeholder = "Chọn..." }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div
      className="relative"
      tabIndex={0}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <div
        className="flex items-center justify-between gap-2 bg-transparent border-0 border-b-2 border-gray-300 hover:border-gray-500 focus-within:border-black py-1 cursor-pointer transition-colors px-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-900 text-xs font-bold uppercase tracking-widest select-none">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`w-3 h-3 text-gray-900 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="py-1">
            {options.map((opt) => (
              <li
                key={opt.value}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors ${value === opt.value ? 'text-black bg-gray-50' : 'text-gray-500'}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function ManageSong() {
  const [songs, setSongs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [sortBy, setSortBy] = useState("views_DESC");

  const [currentPage, setCurrentPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailSong, setDetailSong] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const itemsPerPage = 10;

  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();
  const lastViewedSongIdRef = useRef(null); // ✅ Lưu ID bài đã tăng view, tránh đếm lại

  // Ngăn cuộn trang và fix giật layout khi mở modal
  useScrollLock(isFormOpen || isDetailOpen || isHelpOpen);

  // Fetch songs
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const [sortCol, sortDir] = sortBy.split("_");
      const res = await axios.get("/songs", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          visibility: filterVisibility,
          sortBy: sortCol,
          order: sortDir,
        },
      });

      // BE trả về { success, data, pagination: { total, page, limit, totalPages } }
      const songData = res.data?.data || [];
      const total = res.data?.pagination?.total ?? songData.length;
      setSongs(Array.isArray(songData) ? songData : []);
      setTotalItems(total);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách bài hát");
      showNotification("error", "Không thể tải danh sách bài hát");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterVisibility, sortBy]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [debouncedSearch, filterVisibility, sortBy]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(songs.map((s) => s.songId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, songId) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, songId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== songId));
    }
  };

  const handleToggleVisibility = async (songId) => {
    const ok = await confirm(
      "Bạn có chắc chắn muốn thay đổi trạng thái hiển thị của bài hát này?",
    );
    if (!ok) return;
    try {
      await axios.patch(`/songs/${songId}/visibility`);
      fetchSongs();
      showNotification("success", "Đã cập nhật trạng thái hiển thị!");
    } catch (err) {
      console.error("Toggle error:", err);
      showNotification(
        "error",
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi khi cập nhật trạng thái!",
      );
    }
  };

  const handleBulkToggleVisibility = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm(
      `Bạn có chắc muốn thay đổi trạng thái hiển thị của ${selectedIds.length} bài hát đã chọn?`,
    );
    if (!ok) return;
    try {
      await axios.post(`/songs/bulk-visibility`, { songIds: selectedIds });
      showNotification(
        "success",
        `Đã cập nhật trạng thái của ${selectedIds.length} bài hát!`,
      );
      setSelectedIds([]);
      fetchSongs();
    } catch (err) {
      console.error("Bulk toggle error:", err);
      showNotification(
        "error",
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi khi cập nhật hàng loạt!",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm(
      `Bạn có chắc muốn xóa ${selectedIds.length} bài hát đã chọn?`,
    );
    if (!ok) return;

    setIsBulkDeleting(true);
    try {
      await axios.post(`/songs/bulk-delete`, { songIds: selectedIds });
      showNotification(
        "success",
        `Đã xóa ${selectedIds.length} bài hát thành công!`,
      );
      setSelectedIds([]);
      // ✅ Nếu xóa toàn bộ trang hiện tại, nhảy về trang trước
      if (selectedIds.length >= songs.length && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchSongs();
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      showNotification(
        "error",
        err.response?.data?.message || "Lỗi khi xóa hàng loạt!",
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDelete = async (songId) => {
    if (!songId) return;
    const ok = await confirm(
      "Bạn có chắc muốn xóa bài hát này? Bài hát sẽ bị xóa vĩnh viễn.",
    );
    if (!ok) return;

    setDeletingId(songId);
    try {
      await axios.delete(`/songs/${songId}`);
      showNotification("success", "Đã xóa bài hát thành công!");
      // ✅ Nếu xóa bài cuối cùng ở trang hiện tại, nhảy về trang trước
      if (songs.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchSongs();
      }
    } catch (err) {
      console.error("Delete error:", err);
      showNotification(
        "error",
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Lỗi khi xóa bài hát!",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetail = useCallback((song) => {
    setDetailSong(song);
    setIsDetailOpen(true);
  }, []);

  const handlePlayAudio = async (songId) => {
    // Admin nghe thử bài hát không tăng view
    console.log("Admin đang nghe thử bài hát:", songId);
  };

  const handleAddSong = useCallback(() => {
    setIsEdit(false);
    setEditingSong(null);
    setIsFormOpen(true);
  }, []);

  const handleEditSong = useCallback((song) => {
    setIsEdit(true);
    setEditingSong(song);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingSong(null);
    setIsEdit(false);
    fetchSongs();
  }, [fetchSongs]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterVisibility("all");
    setSortBy("views_DESC");
  }, []);

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

  const sanitizeHtml = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  };



  const renderTableBody = () => {
    if (loading && songs.length === 0) {
      return Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100">
          <td className="px-4 py-4 text-center">
            <div className="h-4 w-4 bg-gray-200 rounded mx-auto"></div>
          </td>
          <td className="px-4 py-4 text-center text-sm">
            <div className="h-4 w-6 bg-gray-200 rounded mx-auto"></div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded mr-3"></div>
              <div className="h-4 w-36 bg-gray-200 rounded"></div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
          </td>
          <td className="px-6 py-4 text-center">
            <div className="h-4 w-12 bg-gray-200 rounded-full mx-auto"></div>
          </td>
          <td className="px-6 py-4">
            <div className="flex justify-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            </div>
          </td>
        </tr>
      ));
    }
    if (error) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-4 text-red-500">
            {error}
          </td>
        </tr>
      );
    }
    if (songs.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="px-6 py-24 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <p className="text-gray-900 font-bold text-lg mb-1">Không tìm thấy kết quả</p>
              <p className="text-gray-500 text-sm mb-4">Không có bài hát nào khớp với tìm kiếm của bạn.</p>
            </div>
          </td>
        </tr>
      );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;

    return songs.map((song, index) => (
      <tr
        key={song.songId || index}
        className={`hover:bg-gray-50 transition border-b border-gray-100 group ${song.isHidden ? "opacity-50 bg-gray-50" : ""}`}
      >
        <td className="px-4 py-4 text-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-black focus:ring-black"
            checked={selectedIds.includes(song.songId)}
            onChange={(e) => handleSelectOne(e, song.songId)}
          />
        </td>
        <td className="px-4 py-4 text-center text-sm text-gray-500">
          {startIndex + index + 1}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            {song.coverUrl ? (
              <img
                src={song.coverUrl}
                alt="cover"
                className="w-10 h-10 rounded object-cover mr-3 shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<div class="w-10 h-10 rounded bg-gray-200 mr-3 flex items-center justify-center text-xs text-gray-400">No Img</div>';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded bg-gray-200 mr-3 flex items-center justify-center text-xs text-gray-500">
                No Img
              </div>
            )}
            <div className="flex flex-col max-w-[200px]">
              <span
                className="text-sm font-medium text-gray-900 truncate"
                title={song.title}
              >
                {song.title}
              </span>
            </div>
          </div>
        </td>
        <td
          className="px-6 py-4 text-sm text-gray-600 truncate max-w-[150px]"
          title={song.singerName}
        >
          {song.singerName || "—"}
        </td>
        <td className="px-6 py-4 text-center">
          <span className="font-bold text-gray-900 text-sm">
            {formatNumber(song.views)}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleToggleVisibility(song.songId)}
              className="text-gray-400 hover:text-gray-900 transition-colors outline-none"
              title={song.isHidden ? "Hiện bài hát" : "Ẩn bài hát"}
            >
              {song.isHidden ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => handleViewDetail(song)}
              className="text-gray-400 hover:text-gray-900 transition-colors outline-none"
              title="Xem chi tiết"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditSong(song)}
              className="text-gray-400 hover:text-gray-900 transition-colors outline-none"
              title="Sửa"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(song.songId)}
              disabled={deletingId === song.songId}
              className="text-gray-400 hover:text-red-600 transition-colors outline-none disabled:opacity-50"
              title="Xóa"
            >
              {deletingId === song.songId ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash className="w-4 h-4" />
              )}
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="relative pb-8">
      {/* 🚀 BULK ACTIONS FLOATING BAR */}
      <div className={`fixed bottom-6 right-6 z-40 flex items-center gap-4 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedIds.length > 0 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-16 scale-95 pointer-events-none"}`}>
        <div className="flex items-center gap-3 pr-4 border-r border-gray-700">
          <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
            {selectedIds.length}
          </div>
          <span className="font-semibold text-sm text-white">đã chọn</span>
        </div>
        <button onClick={handleBulkToggleVisibility} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors outline-none text-gray-300 hover:text-white">
          <EyeOff className="w-4 h-4" /> Đổi trạng thái
        </button>
        <button onClick={handleBulkDelete} disabled={isBulkDeleting} className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg text-sm font-semibold transition-colors outline-none">
          {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
          Xóa {selectedIds.length} bài hát
        </button>
        <button onClick={() => setSelectedIds([])} className="ml-2 p-2 hover:bg-gray-800 rounded-full transition-colors outline-none text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
              Quản lý Bài hát
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Tìm kiếm bài hát, nghệ sĩ..."
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-black text-sm placeholder-gray-400 font-medium text-black bg-transparent transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleAddSong}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white hover:bg-black transition-colors font-bold text-sm uppercase tracking-wider w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Thêm bài hát
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <div>
            Hiển thị <span className="text-gray-900">{songs.length}</span> /{" "}
            <span className="text-gray-900">{totalItems}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Sắp xếp:</span>
              <CustomSelect
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "views_DESC", label: "Lượt nghe (Cao - Thấp)" },
                  { value: "views_ASC", label: "Lượt nghe (Thấp - Cao)" }
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Trạng thái:</span>
              <CustomSelect
                value={filterVisibility}
                onChange={setFilterVisibility}
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "visible", label: "Bài hát đang hiện" },
                  { value: "hidden", label: "Bài hát bị ẩn" }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Sticky Bulk Actions Toolbar removed to use Floating bar above */}

        <div className="bg-white border border-gray-200 overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
            </div>
          )}
          <table className="min-w-full border-collapse">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="w-[40px] px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    className="rounded-sm border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                    checked={
                      songs.length > 0 && selectedIds.length === songs.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="w-[60px] px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Bài hát
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Nghệ sĩ</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Lượt nghe
                </th>
                <th className="w-[150px] px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center justify-center gap-1">
                    Thao tác
                    <button onClick={() => setIsHelpOpen(true)} className="text-gray-400 hover:text-gray-900 transition outline-none" title="Trợ giúp">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        )}

        {/* Detail Modal */}
        {isDetailOpen &&
          detailSong &&
          createPortal(
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsDetailOpen(false);
              }}
            >
              <div className="bg-white text-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col relative animate-fade-in overflow-hidden">
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 flex flex-col h-full min-h-0">
                  <div className="flex flex-col sm:flex-row gap-6 mb-6 flex-shrink-0">
                    {/* Left: Image */}
                    <div className="w-full sm:w-1/3">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                        {detailSong.coverUrl ? (
                          <img
                            src={detailSong.coverUrl}
                            alt={detailSong.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.classList.add('bg-gray-100'); e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">Không có ảnh</div>'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            Không có ảnh
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Info */}
                    <div className="w-full sm:w-2/3 flex flex-col justify-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {detailSong.title}
                      </h2>
                      <p className="text-lg text-gray-600 mb-4">
                        Nghệ sĩ: <span className="font-medium text-black">{detailSong.singerName || detailSong.singerId}</span>
                      </p>

                      <div className="space-y-2 text-sm text-gray-700">
                        <p>Lượt nghe: <span className="font-semibold">{formatNumber(detailSong.views)}</span></p>
                        <p>Thể loại: <span className="font-semibold">{detailSong.genreName || detailSong.genreId || "—"}</span></p>
                        <p>Ngày phát hành: <span className="font-semibold">{formatDate(detailSong.releaseDate)}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Player */}
                  {detailSong.fileUrl && (
                    <div className="mb-6 flex-shrink-0">
                      <audio
                        controls
                        className="w-full h-10 outline-none"
                        src={detailSong.fileUrl}
                        onPlay={() => handlePlayAudio(detailSong.songId)}
                      />
                    </div>
                  )}

                  {/* Lyrics */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-2 flex-shrink-0">
                      Lời bài hát
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex-1 overflow-y-auto custom-scrollbar">
                      {detailSong.lyric || detailSong.lyrics ? (
                        <p
                          className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(detailSong.lyric || detailSong.lyrics),
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                          Chưa có lời bài hát
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit Button Footer */}
                  <div className="mt-6 flex justify-end gap-4 border-t border-gray-100 pt-4 flex-shrink-0">
                    <button
                      onClick={() => {
                        setIsDetailOpen(false);
                        handleEditSong(detailSong);
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white hover:bg-black rounded-lg font-bold transition-all shadow-sm text-sm uppercase tracking-wider"
                    >
                      <Edit className="w-4 h-4" /> Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Help Modal */}
        {isHelpOpen &&
          createPortal(
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsHelpOpen(false);
              }}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">
                  Ý nghĩa các nút hành động
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex items-center justify-center shrink-0">
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Ẩn / Hiện bài hát</p>
                      <p className="text-xs text-gray-500 mt-0.5">Thay đổi trạng thái hiển thị của bài hát trên ứng dụng khách.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Xem chi tiết</p>
                      <p className="text-xs text-gray-500 mt-0.5">Xem toàn bộ thông tin, ảnh bìa lớn và nghe thử bài hát.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex items-center justify-center shrink-0">
                      <Edit className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Sửa thông tin</p>
                      <p className="text-xs text-gray-500 mt-0.5">Cập nhật tên, ca sĩ, thể loại, hoặc thay thế file nhạc/ảnh.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex items-center justify-center shrink-0">
                      <Trash className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Xóa bài hát</p>
                      <p className="text-xs text-gray-500 mt-0.5">Xóa vĩnh viễn bài hát và các file liên quan khỏi hệ thống.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t flex justify-end">
                  <button onClick={() => setIsHelpOpen(false)} className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-sm font-medium text-sm">
                    Đã hiểu
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        {isFormOpen &&
          createPortal(
            <SongForm
              isEdit={isEdit}
              song={editingSong}
              onClose={handleFormClose}
              onSuccess={(msg) => showNotification("success", msg)}
              onError={(msg) => showNotification("error", msg)}
            />,
            document.body,
          )}
      </div>
      {NotificationUI}
      {ConfirmUI}
    </div>
  );
};

