import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Eye, X } from "lucide-react";
import axios from "../../../configs/apiConfig";
import { useNotification } from "../../../hooks/useNotification";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";
import GenreForm from "../../ui/Admin/Genre/GenreForm";
import Pagination from "../../elements/Pagination";

export default function ManageGenre() {
  // === State Management ===
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // === Form States ===
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);

  // === Detail Modal States ===
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailGenre, setDetailGenre] = useState(null);

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

  // === Event Handlers ===

  /**
   * Xử lý xóa thể loại
   */
  const handleDelete = async (genreId) => {
    const ok = await confirm("Bạn có chắc muốn xóa thể loại này?");
    if (!ok) return;

    try {
      await axios.delete(`/genres/${genreId}`);
      await fetchGenres();
      showNotification("success", "Đã xóa thể loại thành công!");
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("error", "Xóa thất bại!");
    }
  };

  /**
   * Mở modal xem chi tiết thể loại
   */
  const handleViewDetail = (genre) => {
    setDetailGenre(genre);
    setIsDetailOpen(true);
  };

  /**
   * Mở form để thêm thể loại mới
   */
  const handleAddGenre = () => {
    setIsEdit(false);
    setEditingGenre(null);
    setIsFormOpen(true);
  };

  /**
   * Mở form để chỉnh sửa thể loại
   */
  const handleEditGenre = (genre) => {
    setIsEdit(true);
    setEditingGenre(genre);
    setIsFormOpen(true);
  };

  /**
   * Đóng form và tải lại danh sách
   */
  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchGenres();
  };

  /**
   * Đóng modal chi tiết và mở form chỉnh sửa
   */
  const handleEditFromDetail = () => {
    setIsDetailOpen(false);
    handleEditGenre(detailGenre);
  };

  // === Logic Lọc và Phân trang ===
  const filteredGenres = genres.filter((genre) =>
    (genre?.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGenres = filteredGenres.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
          <td colSpan="4" className="text-center py-4 text-gray-600">
            Đang tải...
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
          <td colSpan="4" className="text-center py-4 text-gray-600">
            Không có dữ liệu
          </td>
        </tr>
      );
    }

    return currentGenres.map((genre, index) => (
      <tr
        key={genre.genreId || index}
        className="border-t hover:bg-gray-50 transition-colors"
      >
        <td className="w-[60px] px-4 py-3 text-center text-gray-700">
          {startIndex + index + 1}
        </td>
        <td className="w-[220px] px-6 py-3 text-gray-800 font-medium truncate">
          {genre.name || "—"}
        </td>
        {/* Cập nhật: Bỏ text-sm để đồng bộ cỡ chữ */}
        <td className="w-[500px] px-6 py-3 text-gray-600 truncate">
          {truncateText(genre.description, 80)}
        </td>
        <td className="w-[150px] px-6 py-3">
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
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-red-50 text-red-600 hover:text-red-800 transition"
              onClick={() => handleDelete(genre.genreId)}
              title="Xóa"
            >
              <Trash className="w-5 h-5" />
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý thể loại</h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm thể loại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
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

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        {/* Cập nhật: Bỏ text-sm khỏi table */}
        <table className="table-fixed min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-[60px] px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">
                STT
              </th>
              <th className="w-[220px] px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                Tên thể loại
              </th>
              <th className="w-[500px] px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">
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
      <Pagination
        currentPage={currentPage}
        totalItems={filteredGenres.length}
        onPageChange={setCurrentPage}
      />

      {/* Detail Modal */}
      {isDetailOpen && detailGenre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                Chi tiết thể loại: {detailGenre.name}
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