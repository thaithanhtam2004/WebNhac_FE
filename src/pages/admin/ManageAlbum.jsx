import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "../../config/api";
import AlbumForm from "./AlbumForm";
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
  HelpCircle,
  Image as ImageIcon,
  Info,
} from "lucide-react";

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const formatDateToDisplay = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "—";
  }
};

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

export default function ManageAlbum() {
  const [albums, setAlbums] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [sortBy, setSortBy] = useState("createdAt_DESC");

  const [currentPage, setCurrentPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailAlbum, setDetailAlbum] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const itemsPerPage = 10;

  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // Ngăn cuộn trang khi mở modal
  useScrollLock(isFormOpen || isDetailOpen || isHelpOpen);

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      const [sortCol, sortDir] = sortBy.split("_");
      const res = await axios.get("/albums", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          visibility: "all", // Mặc định hiển thị tất cả
          sortBy: sortCol,
          order: sortDir,
        },
      });

      const data = res.data?.data || [];
      const total = res.data?.pagination?.total ?? data.length;
      setAlbums(Array.isArray(data) ? data : []);
      setTotalItems(total);
    } catch (err) {
      console.error("Fetch error:", err);
      showNotification("error", "Không thể tải danh sách album");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, sortBy]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [debouncedSearch, sortBy]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(albums.map((a) => a.albumId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, albumId) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, albumId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== albumId));
    }
  };

  const handleToggleVisibility = async (albumId) => {
    const ok = await confirm("Bạn có chắc chắn muốn thay đổi trạng thái hiển thị của album này?");
    if (!ok) return;
    try {
      await axios.patch(`/albums/${albumId}/visibility`);
      fetchAlbums();
      showNotification("success", "Đã cập nhật trạng thái hiển thị!");
    } catch (err) {
      console.error("Toggle error:", err);
      showNotification("error", err.response?.data?.message || err.response?.data?.error || "Lỗi khi cập nhật trạng thái!");
    }
  };

  const handleBulkToggleVisibility = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm(`Bạn có chắc muốn thay đổi trạng thái hiển thị của ${selectedIds.length} album đã chọn?`);
    if (!ok) return;
    try {
      await axios.patch("/albums/bulk-visibility", { albumIds: selectedIds });
      fetchAlbums();
      setSelectedIds([]);
      showNotification("success", `Đã cập nhật trạng thái của ${selectedIds.length} album!`);
    } catch (err) {
      console.error("Bulk toggle error:", err);
      showNotification("error", err.response?.data?.message || err.response?.data?.error || "Lỗi thao tác hàng loạt!");
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!albumId) return;
    const ok = await confirm("Bạn có chắc chắn muốn xóa album này không? Dữ liệu sẽ bị xóa vĩnh viễn.");
    if (!ok) return;

    setDeletingId(albumId);
    try {
      await axios.delete(`/albums/${albumId}`);
      showNotification("success", "Xóa album thành công!");
      if (albums.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchAlbums();
      }
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("error", error.response?.data?.message || error.response?.data?.error || "Lỗi khi xóa album!");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm(`Bạn có chắc muốn xóa vĩnh viễn ${selectedIds.length} album đã chọn?`);
    if (!ok) return;

    setIsBulkDeleting(true);
    try {
      await axios.post("/albums/bulk-delete", { albumIds: selectedIds });
      showNotification("success", `Đã xóa thành công ${selectedIds.length} album!`);
      setSelectedIds([]);
      if (selectedIds.length >= albums.length && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchAlbums();
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      showNotification("error", err.response?.data?.message || err.response?.data?.error || "Lỗi khi xóa hàng loạt!");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleAddAlbum = () => {
    setEditingAlbum(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEditAlbum = (album) => {
    setEditingAlbum(album);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchAlbums();
  };

  const openDetail = (album) => {
    setDetailAlbum(album);
    setIsDetailOpen(true);
  };

  const renderTableBody = () => {
    if (albums.length === 0 && !loading) {
      return (
        <tr>
          <td colSpan="7" className="px-6 py-24 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <p className="text-gray-900 font-bold text-lg mb-1">Không tìm thấy kết quả</p>
              <p className="text-gray-500 text-sm mb-4">Không có album nào khớp với tìm kiếm của bạn.</p>
            </div>
          </td>
        </tr>
      );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;

    return albums.map((album, index) => {
      const isSelected = selectedIds.includes(album.albumId);
      const isHidden = album.isHidden === 1 || album.isHidden === true;

      return (
        <tr key={album.albumId} className={`hover:bg-gray-50 transition border-b border-gray-100 group ${isHidden ? "opacity-50 bg-gray-50" : ""}`}>
          <td className="px-4 py-4 text-center">
             <input type="checkbox" checked={isSelected} onChange={(e) => handleSelectOne(e, album.albumId)} className="rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
          </td>
          <td className="px-4 py-4 text-center">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-250 mx-auto shadow-sm cursor-pointer" onClick={() => openDetail(album)}>
              {album.coverUrl ? (
                <img src={album.coverUrl} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex flex-col cursor-pointer group" onClick={() => openDetail(album)}>
              <span className={`text-sm font-semibold ${isHidden ? "text-gray-500 line-through" : "text-gray-900"} group-hover:text-black transition-colors truncate max-w-[200px]`} title={album.name}>
                {album.name}
              </span>
              <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">
                {album.singerName || "Nghệ sĩ chưa rõ"}
              </span>
            </div>
          </td>
          <td className="px-6 py-4 text-center text-sm text-gray-600">
            {formatDateToDisplay(album.releaseDate)}
          </td>
          <td className="px-6 py-4 text-center">
             <span className="font-bold text-gray-900 text-sm">{(album.totalViews || 0).toLocaleString()}</span>
          </td>
          <td className="px-6 py-4 text-center">
             <span className="font-bold text-gray-905 text-sm">{album.songCount || 0}</span>
          </td>
          <td className="px-6 py-4 text-center">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleToggleVisibility(album.albumId)}
                className="text-gray-400 hover:text-gray-900 transition-colors outline-none"
                title={isHidden ? "Hiện album" : "Ẩn album"}
              >
                {isHidden ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => openDetail(album)}
                className="text-gray-400 hover:text-gray-900 transition-colors outline-none"
                title="Xem chi tiết"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditAlbum(album)}
                className="text-gray-400 hover:text-gray-900 transition-colors outline-none"
                title="Sửa"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteAlbum(album.albumId)}
                disabled={deletingId === album.albumId}
                className="text-gray-400 hover:text-red-600 transition-colors outline-none disabled:opacity-50"
                title="Xóa"
              >
                {deletingId === album.albumId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash className="w-4 h-4" />
                )}
              </button>
            </div>
          </td>
        </tr>
      );
    });
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
           Xóa {selectedIds.length} album
         </button>
         <button onClick={() => setSelectedIds([])} className="ml-2 p-2 hover:bg-gray-800 rounded-full transition-colors outline-none text-gray-400 hover:text-white">
           <X className="w-4 h-4" />
         </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
              Quản lý Album
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Tìm kiếm album..."
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
              onClick={handleAddAlbum}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white hover:bg-black transition-colors font-bold text-sm uppercase tracking-wider w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Thêm album
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <div>
            Hiển thị <span className="text-gray-900">{albums.length}</span> /{" "}
            <span className="text-gray-900">{totalItems}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Sắp xếp:</span>
              <CustomSelect
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "createdAt_DESC", label: "Mới nhất" },
                  { value: "createdAt_ASC", label: "Cũ nhất" },
                  { value: "name_ASC", label: "A-Z" },
                  { value: "name_DESC", label: "Z-A" },
                  { value: "totalViews_DESC", label: "Lượt nghe nhiều nhất" }
                ]}
              />
            </div>
          </div>
        </div>

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
                    checked={albums.length > 0 && selectedIds.length === albums.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="w-[80px] px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Cover
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Album
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Phát hành
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Lượt nghe
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Số bài
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
        {isDetailOpen && detailAlbum && createPortal(
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
                  {/* Left: Cover */}
                  <div className="w-full sm:w-1/3">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      {detailAlbum.coverUrl ? (
                        <img
                          src={detailAlbum.coverUrl}
                          alt={detailAlbum.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add('bg-gray-100');
                            e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">Không có ảnh</div>';
                          }}
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                      {detailAlbum.name}
                      {(detailAlbum.isHidden === 1 || detailAlbum.isHidden === true) && (
                        <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">ĐÃ ẨN</span>
                      )}
                    </h2>
                    <p className="text-lg text-gray-600 mb-4">
                      Nghệ sĩ: <span className="font-medium text-black">{detailAlbum.singerName || "Nghệ sĩ chưa rõ"}</span>
                    </p>

                    <div className="space-y-2 text-sm text-gray-700">
                      <p>Ngày phát hành: <span className="font-semibold text-gray-950">{formatDateToDisplay(detailAlbum.releaseDate)}</span></p>
                      <p>Số bài hát: <span className="font-semibold text-gray-950">{detailAlbum.songCount || 0} bài</span></p>
                      <p>Lượt nghe: <span className="font-semibold text-gray-950">{(detailAlbum.totalViews || 0).toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-2 flex-shrink-0">
                    Mô tả album
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex-1 overflow-y-auto custom-scrollbar">
                    {detailAlbum.description ? (
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                        {detailAlbum.description}
                      </p>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                        Chưa có thông tin mô tả
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-4 border-t border-gray-100 pt-4 flex-shrink-0">
                  <button
                    onClick={() => {
                      setIsDetailOpen(false);
                      handleEditAlbum(detailAlbum);
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
        {isHelpOpen && createPortal(
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
                    <p className="font-semibold text-gray-800 text-sm">Ẩn / Hiện album</p>
                    <p className="text-xs text-gray-500 mt-0.5">Thay đổi trạng thái hiển thị của album trên ứng dụng khách.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Xem chi tiết</p>
                    <p className="text-xs text-gray-500 mt-0.5">Xem mô tả, danh sách bài hát và thống kê chi tiết của album.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <Edit className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Sửa thông tin</p>
                    <p className="text-xs text-gray-500 mt-0.5">Cập nhật tên album, nghệ sĩ, ngày phát hành và ảnh bìa mới.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <Trash className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Xóa album</p>
                    <p className="text-xs text-gray-500 mt-0.5">Xóa vĩnh viễn album khỏi hệ thống nếu không chứa bài hát nào.</p>
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

        {isFormOpen && (
          <AlbumForm
            isEdit={isEdit}
            album={editingAlbum}
            onClose={handleFormClose}
            onSuccess={(msg) => showNotification("success", msg)}
            onError={(msg) => showNotification("error", msg)}
          />
        )}

        {NotificationUI}
        {ConfirmUI}
      </div>
    </div>
  );
}
