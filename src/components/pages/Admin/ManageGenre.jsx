// src/pages/Admin/ManageGenre.jsx
import { useState, useEffect } from "react";
import { Plus, Edit, Trash } from "lucide-react";
import GenreForm from "../../ui/Admin/Genre/GenreForm";
import Pagination from "../../elements/Pagination";
import axios from "../../../configs/apiConfig";
import { useNotification } from "../../../hooks/useNotification";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";

export default function ManageGenre() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Hooks thông báo & xác nhận
  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // === Fetch genres ===
  const fetchGenres = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/genres");
      console.log("Fetched genres:", res.data);

      const genreData = res.data?.data || res.data || [];
      setGenres(Array.isArray(genreData) ? genreData : []);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách thể loại");
      showNotification("error", "Không thể tải danh sách thể loại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // === Delete genre ===
  const handleDelete = async (genreId) => {
    const ok = await confirm("Bạn có chắc muốn xóa thể loại này?");
    if (!ok) return;

    try {
      await axios.delete(`/genres/${genreId}`);
      await fetchGenres();
      showNotification("success", "Đã xóa thể loại thành công!");
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("error", "Lỗi khi xóa thể loại!");
    }
  };

  // === Filter + Pagination ===
  const filteredGenres = genres.filter((g) =>
    (g?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGenres = filteredGenres.slice(startIndex, startIndex + itemsPerPage);

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
            onClick={() => {
              setIsEdit(false);
              setEditingGenre(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            Thêm thể loại
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 w-12">STT</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên thể loại</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mô tả</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-600">Đang tải...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-red-500">{error}</td>
              </tr>
            ) : currentGenres.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-600">Không có dữ liệu</td>
              </tr>
            ) : (
              currentGenres.map((genre, index) => (
                <tr key={genre.genreId || index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-center font-medium text-gray-700">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-3 text-gray-700">{genre?.name || "—"}</td>
                  <td className="px-6 py-3 text-gray-500">{genre?.description || "—"}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100 text-gray-700 hover:text-black transition"
                        onClick={() => {
                          setIsEdit(true);
                          setEditingGenre(genre);
                          setIsFormOpen(true);
                        }}
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                        onClick={() => handleDelete(genre.genreId)}
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredGenres.length}
        onPageChange={setCurrentPage}
      />

      {/* Genre Form Modal */}
      {isFormOpen && (
        <GenreForm
          isEdit={isEdit}
          genre={editingGenre}
          onClose={() => {
            setIsFormOpen(false);
            fetchGenres();
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
