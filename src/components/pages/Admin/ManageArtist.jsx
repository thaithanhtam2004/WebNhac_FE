import { useState, useEffect } from "react";

import { Plus, Edit, Trash, Eye, X } from "lucide-react"; // Import Eye và X
import ArtistForm from "../../ui/Admin/Artist/ArtistForm";
import Pagination from "../../elements/Pagination";
import axios from "../../../configs/apiConfig";
import { useNotification } from "../../../hooks/useNotification";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";

export default function ManageSinger() {
  const [singers, setSingers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingSinger, setEditingSinger] = useState(null);
  
  // State cho modal chi tiết mới
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailSinger, setDetailSinger] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🧩 Hooks thông báo & xác nhận
  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // === Fetch singers ===
  const fetchSingers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/singers");
      const singerData = res.data?.data || res.data || [];
      setSingers(Array.isArray(singerData) ? singerData : []);
      setError(null);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Không thể tải danh sách nghệ sĩ");
      showNotification("error", "Không thể tải danh sách nghệ sĩ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSingers();
  }, []);

  // === Delete ===
  const handleDelete = async (singerId) => {
    const ok = await confirm("Bạn có chắc muốn xóa nghệ sĩ này?");
    if (!ok) return;

    try {
      await axios.delete(`/singers/${singerId}`);
      await fetchSingers();
      showNotification("success", "Đã xóa nghệ sĩ thành công!");
    } catch (err) {
      console.error("❌ Delete error:", err);
      showNotification("error", "Xóa thất bại!");
    }
  };

  // === View Detail ===
  const handleViewDetail = (singer) => {
    setDetailSinger(singer);
    setIsDetailOpen(true);
  };

  // === Filter & Pagination ===
  const filteredSingers = singers.filter((s) =>
    (s?.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSingers = filteredSingers.slice(startIndex, startIndex + itemsPerPage);

  // === Utils ===
  const truncateText = (text, max = 100) =>
    !text ? "—" : text.length <= max ? text : text.substring(0, max) + "...";

  // === Render ===
  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý nghệ sĩ</h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm nghệ sĩ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl shadow hover:bg-gray-800 transition"
            onClick={() => {
              setIsEdit(false);
              setEditingSinger(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            Thêm nghệ sĩ
          </button>
        </div>
        
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-center w-12 text-sm font-semibold text-gray-900">STT</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên nghệ sĩ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mô tả</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">Đang tải...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-red-500">{error}</td>
              </tr>
            ) : currentSingers.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-600">Không có dữ liệu</td>
              </tr>
            ) : (
              currentSingers.map((s, i) => (
                <tr key={s.singerId || i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-700">{startIndex + i + 1}</td>
                  <td className="px-6 py-3 text-gray-800 font-medium">{s.name}</td>
                  <td className="px-6 py-3 text-gray-600 text-sm">{truncateText(s.bio, 80)}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-3">
                      {/* Nút xem chi tiết */}
                      <button
                        className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                        onClick={() => handleViewDetail(s)}
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 hover:text-black transition"
                        onClick={() => {
                          setIsEdit(true);
                          setEditingSinger(s);
                          setIsFormOpen(true);
                        }}
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 rounded-full bg-white border border-gray-300 hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                        onClick={() => handleDelete(s.singerId)}
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
        totalItems={filteredSingers.length}
        onPageChange={setCurrentPage}
      />

      {/* Modal Chi tiết Nghệ sĩ */}
      {isDetailOpen && detailSinger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết nghệ sĩ: {detailSinger.name}</h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Ảnh đại diện */}
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-700 mb-3">Ảnh đại diện</p>
                {detailSinger.imageUrl ? (
                  <img
                    src={detailSinger.imageUrl}
                    alt={detailSinger.name}
                    className="w-48 h-48 object-cover rounded-full shadow-lg border-4 border-gray-100"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/192x192?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    Không có ảnh
                  </div>
                )}
                {/* Đã loại bỏ phần hiển thị URL ảnh ở đây */}
              </div>

              {/* Tên nghệ sĩ */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Tên nghệ sĩ</p>
                <p className="text-xl font-bold text-gray-800">
                  {detailSinger.name || "—"}
                </p>
              </div>

              {/* Mô tả / Tiểu sử */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                  Mô tả/Tiểu sử
                </p>
                {detailSinger.bio ? (
                  <div className="bg-white p-4 rounded-lg shadow-sm max-h-60 overflow-y-auto">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                      {detailSinger.bio}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-4">
                    Không có mô tả
                  </p>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsEdit(true);
                  setEditingSinger(detailSinger);
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


      {/* Form modal */}
      {isFormOpen && (
        <ArtistForm
          isEdit={isEdit}
          singer={editingSinger}
          onClose={() => {
            setIsFormOpen(false);
            fetchSingers();
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

