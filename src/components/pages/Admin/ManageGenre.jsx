import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Edit, Trash, Eye, X, Loader2, Filter, ArrowUpDown } from "lucide-react";
import axios from "../../../configs/apiConfig";
import { useNotification } from "../../../hooks/useNotification";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";
import GenreForm from "../../ui/Admin/Genre/GenreForm";
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

export default function ManageGenre() {
  // === State Management ===
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Separate search term and debounced search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ New: Filter and sort states
  const [sortBy, setSortBy] = useState(""); // name, songCount
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc

  // === Form States ===
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);

  // === Detail Modal States ===
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailGenre, setDetailGenre] = useState(null);

  // ✅ New: Loading state for individual delete
  const [deletingId, setDeletingId] = useState(null);

  // === Constants ===
  const itemsPerPage = 10;

  // === Custom Hooks ===
  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // === Data Fetching ===
  const fetchGenres = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/genres");
      const genreData = res.data?.data || res.data || [];
      setGenres(Array.isArray(genreData) ? genreData : []);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách thể loại");
      showNotification("error", "Không thể tải danh sách thể loại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // ✅ Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortBy, sortOrder]);

  // === Event Handlers ===

  /**
   * ✅ Optimized delete - Remove from state instead of re-fetch
   */
  const handleDelete = async (genreId) => {
    // ✅ Validate genreId
    if (!genreId) {
      showNotification("error", "ID thể loại không hợp lệ");
      return;
    }

    const ok = await confirm("Bạn có chắc muốn xóa thể loại này?");
    if (!ok) return;

    setDeletingId(genreId);
    try {
      await axios.delete(`/genres/${genreId}`);
      
      // ✅ Remove from state instead of re-fetching
      setGenres((prev) => prev.filter((g) => g.genreId !== genreId));
      showNotification("success", "Đã xóa thể loại thành công!");
      
      // ✅ Adjust pagination if needed
      const newTotal = genres.length - 1;
      const maxPage = Math.ceil(newTotal / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("error", err.response?.data?.message || "Lỗi khi xóa thể loại!");
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Mở modal xem chi tiết thể loại
   */
  const handleViewDetail = useCallback((genre) => {
    setDetailGenre(genre);
    setIsDetailOpen(true);
  }, []);

  /**
   * Mở form để thêm thể loại mới
   */
  const handleAddGenre = useCallback(() => {
    setIsEdit(false);
    setEditingGenre(null);
    setIsFormOpen(true);
  }, []);

  /**
   * Mở form để chỉnh sửa thể loại
   */
  const handleEditGenre = useCallback((genre) => {
    setIsEdit(true);
    setEditingGenre(genre);
    setIsFormOpen(true);
  }, []);

  /**
   * Đóng form và tải lại danh sách
   */
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    fetchGenres();
  }, []);

  /**
   * Đóng modal chi tiết và mở form chỉnh sửa
   */
  const handleEditFromDetail = useCallback(() => {
    setIsDetailOpen(false);
    handleEditGenre(detailGenre);
  }, [detailGenre]);

  // ✅ Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSortBy("");
    setSortOrder("asc");
  }, []);

  // ✅ Optimized filtering and sorting with useMemo
  const filteredAndSortedGenres = useMemo(() => {
    let result = genres.filter((genre) => {
      const matchSearch = (genre?.name || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      
      return matchSearch;
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
  }, [genres, debouncedSearch, sortBy, sortOrder]);

  // ✅ Optimized pagination with useMemo
  const currentGenres = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedGenres.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedGenres, currentPage, itemsPerPage]);

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
   * Rút gọn văn bản
   */
  const truncateText = (text, max = 100) => {
    if (!text) return "—";
    return text.length <= max ? text : `${text.substring(0, max)}...`;
  };

  // === Render Functions ===

  /**
   * Render nội dung của bảng
   */
  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-600" />
            <p className="text-gray-600 mt-2">Đang tải...</p>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-4 text-red-500">
            {error}
          </td>
        </tr>
      );
    }

    if (currentGenres.length === 0) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-8 text-gray-600">
            {debouncedSearch ? (
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

    return currentGenres.map((genre, index) => (
      <tr
        key={genre.genreId || index}
        className="border-t hover:bg-gray-50 transition-colors"
      >
        <td className="px-4 py-3 text-center text-gray-700">
          {startIndex + index + 1}
        </td>
        <td className="px-6 py-3 text-gray-800 font-medium truncate max-w-[200px]">
          {genre.name || "—"}
        </td>
        <td className="px-6 py-3 text-gray-600 truncate max-w-[400px]">
          {truncateText(genre.description, 80)}
        </td>
        <td className="px-6 py-3">
          <div className="flex items-center justify-center gap-3">
            <button
              className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
              onClick={() => handleViewDetail(genre)}
              title="Xem chi tiết"
            >
              <Eye className="w-5 h-5" />
            </button>

            <button
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 hover:text-black transition"
              onClick={() => handleEditGenre(genre)}
              title="Chỉnh sửa"
            >
              <Edit className="w-5 h-5" />
            </button>

            <button
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-red-50 text-red-600 hover:text-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleDelete(genre.genreId)}
              disabled={deletingId === genre.genreId}
              title="Xóa"
            >
              {deletingId === genre.genreId ? (
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

  // === JSX Return ===
  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý thể loại</h1>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Tìm kiếm thể loại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black w-64"
            />

            <button
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl shadow hover:bg-gray-800 transition"
              onClick={handleAddGenre}
            >
              <Plus className="w-5 h-5" />
              Thêm thể loại
            </button>
          </div>
        </div>

        {/* ✅ Filter and Sort Section */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <Filter className="w-5 h-5 text-gray-600" />
          
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">Sắp xếp theo</option>
              <option value="name">Tên thể loại</option>
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

          {(searchTerm || sortBy) && (
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
          Hiển thị <span className="font-semibold">{currentGenres.length}</span> / {" "}
          <span className="font-semibold">{filteredAndSortedGenres.length}</span> thể loại
          {genres.length !== filteredAndSortedGenres.length && (
            <span className="text-gray-500"> (từ tổng {genres.length})</span>
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
                  Tên thể loại
                  {sortBy === "name" && (
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

          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAndSortedGenres.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAndSortedGenres.length}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Detail Modal */}
      {isDetailOpen && detailGenre && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDetailOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                Chi tiết thể loại
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
              {/* Genre Name */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Tên thể loại</p>
                <p className="text-xl font-bold text-gray-800">
                  {detailGenre.name || "—"}
                </p>
              </div>

              {/* Song Count (if available) */}
              {detailGenre.songCount !== undefined && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                  <p className="text-sm text-indigo-600 mb-1">Số bài hát</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {detailGenre.songCount || 0} bài
                  </p>
                </div>
              )}

              {/* Genre Description */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                  Mô tả
                </p>
                {detailGenre.description ? (
                  <div className="bg-white p-4 rounded-lg shadow-sm max-h-60 overflow-y-auto">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                      {detailGenre.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-4">
                    Không có mô tả
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={handleEditFromDetail}
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

      {/* Genre Form Modal */}
      {isFormOpen && (
        <GenreForm
          isEdit={isEdit}
          genre={editingGenre}
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