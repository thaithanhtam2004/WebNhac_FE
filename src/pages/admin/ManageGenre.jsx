import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "../../config/api";
import GenreForm from "./GenreForm";
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

export default function ManageGenre() {
  const [genres, setGenres] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [sortBy, setSortBy] = useState("name_ASC");

  const [currentPage, setCurrentPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailGenre, setDetailGenre] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const itemsPerPage = 10;

  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // Ngăn cuộn trang khi mở modal
  useScrollLock(isFormOpen || isDetailOpen || isHelpOpen);

  const fetchGenres = useCallback(async () => {
    try {
      setLoading(true);
      const [sortCol, sortDir] = sortBy.split("_");
      const res = await axios.get("/genres", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          visibility: "all", // Lược bỏ lọc trạng thái hiển thị riêng biệt
          sortBy: sortCol,
          order: sortDir,
        },
      });

      const data = res.data?.data || [];
      const total = res.data?.pagination?.total ?? data.length;
      setGenres(Array.isArray(data) ? data : []);
      setTotalItems(total);
    } catch (err) {
      console.error("Fetch error:", err);
      showNotification("error", "Không thể tải danh sách thể loại");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, sortBy]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [debouncedSearch, sortBy]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(genres.map((g) => g.genreId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, genreId) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, genreId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== genreId));
    }
  };

  const handleToggleVisibility = async (genreId) => {
    const ok = await confirm("Bạn có chắc chắn muốn thay đổi trạng thái hiển thị của thể loại này?");
    if (!ok) return;
    try {
      await axios.patch(`/genres/${genreId}/visibility`);
      fetchGenres();
      showNotification("success", "Đã cập nhật trạng thái hiển thị!");
    } catch (err) {
      console.error("Toggle error:", err);
      showNotification("error", err.response?.data?.message || err.response?.data?.error || "Lỗi khi cập nhật trạng thái!");
    }
  };

  const handleBulkToggleVisibility = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm(`Bạn có chắc muốn thay đổi trạng thái hiển thị của ${selectedIds.length} thể loại đã chọn?`);
    if (!ok) return;
    try {
      await axios.patch("/genres/bulk-visibility", { genreIds: selectedIds });
      fetchGenres();
      setSelectedIds([]);
      showNotification("success", `Đã cập nhật trạng thái của ${selectedIds.length} thể loại!`);
    } catch (err) {
      console.error("Bulk toggle error:", err);
      showNotification("error", err.response?.data?.message || err.response?.data?.error || "Lỗi thao tác hàng loạt!");
    }
  };

  const handleDeleteGenre = async (genreId) => {
    if (!genreId) return;
    const ok = await confirm("Bạn có chắc chắn muốn xóa thể loại này không? Dữ liệu sẽ bị xóa vĩnh viễn.");
    if (!ok) return;

    setDeletingId(genreId);
    try {
      await axios.delete(`/genres/${genreId}`);
      showNotification("success", "Xóa thể loại thành công!");
      if (genres.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchGenres();
      }
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("error", error.response?.data?.message || error.response?.data?.error || "Lỗi khi xóa thể loại!");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm(`Bạn có chắc muốn xóa vĩnh viễn ${selectedIds.length} thể loại đã chọn?`);
    if (!ok) return;

    setIsBulkDeleting(true);
    try {
      await axios.post("/genres/bulk-delete", { genreIds: selectedIds });
      showNotification("success", `Đã xóa thành công ${selectedIds.length} thể loại!`);
      setSelectedIds([]);
      if (selectedIds.length >= genres.length && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchGenres();
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      showNotification("error", err.response?.data?.message || err.response?.data?.error || "Lỗi khi xóa hàng loạt!");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleAddGenre = () => {
    setEditingGenre(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEditGenre = (genre) => {
    setEditingGenre(genre);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchGenres();
  };

  const openDetail = (genre) => {
    setDetailGenre(genre);
    setIsDetailOpen(true);
  };

  const renderTableBody = () => {
    if (genres.length === 0 && !loading) {
      return (
        <tr>
          <td colSpan="6" className="px-6 py-24 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <p className="text-gray-900 font-bold text-lg mb-1">Không tìm thấy kết quả</p>
              <p className="text-gray-500 text-sm mb-4">Không có thể loại nào khớp với tìm kiếm của bạn.</p>
            </div>
          </td>
        </tr>
      );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;

    return genres.map((genre, index) => {
      const isSelected = selectedIds.includes(genre.genreId);
      const isHidden = genre.isHidden === 1 || genre.isHidden === true;

      return (
        <tr key={genre.genreId} className={`hover:bg-gray-50 transition border-b border-gray-100 group ${isHidden ? "opacity-50 bg-gray-50" : ""}`}>
          <td className="px-4 py-4 text-center">
             <input type="checkbox" checked={isSelected} onChange={(e) => handleSelectOne(e, genre.genreId)} className="rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
          </td>
          <td className="px-4 py-4 text-center text-sm text-gray-500">
            {startIndex + index + 1}
          </td>
          <td className="px-6 py-4">
            <span className={`text-sm font-semibold cursor-pointer group-hover:text-black transition-colors ${isHidden ? "text-gray-500 line-through" : "text-gray-900"}`} onClick={() => openDetail(genre)}>
              {genre.name}
            </span>
          </td>
          <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[300px]" title={genre.description}>
            {genre.description || "—"}
          </td>
          <td className="px-6 py-4 text-center">
             <span className="font-bold text-gray-900 text-sm">{genre.songCount || 0}</span>
          </td>
          <td className="px-6 py-4 text-center">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleToggleVisibility(genre.genreId)}
                className="text-gray-400 hover:text-gray-900 transition-colors outline-none"
                title={isHidden ? "Hiện thể loại" : "Ẩn thể loại"}
              >
                {isHidden ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => openDetail(genre)}
                className="text-gray-400 hover:text-gray-900 transition-colors outline-none"
                title="Xem chi tiết"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditGenre(genre)}
                className="text-gray-400 hover:text-gray-900 transition-colors outline-none"
                title="Sửa"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteGenre(genre.genreId)}
                disabled={deletingId === genre.genreId}
                className="text-gray-400 hover:text-red-600 transition-colors outline-none disabled:opacity-50"
                title="Xóa"
              >
                {deletingId === genre.genreId ? (
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
           Xóa {selectedIds.length} thể loại
         </button>
         <button onClick={() => setSelectedIds([])} className="ml-2 p-2 hover:bg-gray-800 rounded-full transition-colors outline-none text-gray-400 hover:text-white">
           <X className="w-4 h-4" />
         </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
              Quản lý Thể loại
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Tìm kiếm thể loại..."
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
              onClick={handleAddGenre}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white hover:bg-black transition-colors font-bold text-sm uppercase tracking-wider w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Thêm thể loại
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <div>
            Hiển thị <span className="text-gray-900">{genres.length}</span> /{" "}
            <span className="text-gray-900">{totalItems}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Sắp xếp:</span>
              <CustomSelect
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "name_ASC", label: "Tên (A-Z)" },
                  { value: "name_DESC", label: "Tên (Z-A)" }
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
                    checked={genres.length > 0 && selectedIds.length === genres.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="w-[60px] px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Thể loại
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Mô tả
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Số bài hát
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
        {isDetailOpen && detailGenre && createPortal(
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
                <div className="mb-6 flex-shrink-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    {detailGenre.name}
                    {detailGenre.isHidden === 1 && (
                      <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">ĐÃ ẨN</span>
                    )}
                  </h2>
                  <div className="inline-block bg-gray-100 px-4 py-1.5 rounded-full text-xs font-bold text-gray-600">
                    TỔNG CỘNG: {detailGenre.songCount || 0} BÀI HÁT
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-2 flex-shrink-0">
                    Mô tả thể loại
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex-1 overflow-y-auto custom-scrollbar">
                    {detailGenre.description ? (
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                        {detailGenre.description}
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
                      handleEditGenre(detailGenre);
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
                    <p className="font-semibold text-gray-800 text-sm">Ẩn / Hiện thể loại</p>
                    <p className="text-xs text-gray-500 mt-0.5">Thay đổi trạng thái hiển thị của thể loại trên ứng dụng khách.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Xem chi tiết</p>
                    <p className="text-xs text-gray-500 mt-0.5">Xem thông tin chi tiết và thống kê thể loại.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <Edit className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Sửa thông tin</p>
                    <p className="text-xs text-gray-500 mt-0.5">Cập nhật tên thể loại và mô tả chi tiết.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <Trash className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Xóa thể loại</p>
                    <p className="text-xs text-gray-500 mt-0.5">Xóa vĩnh viễn thể loại khỏi hệ thống nếu không chứa bài hát nào.</p>
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
          <GenreForm
            isEdit={isEdit}
            genre={editingGenre}
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
