// src/components/pages/Admin/Genres.jsx
import { useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";
import GenreForm from "../../ui/Admin/Genre/GenreForm";
import Pagination from "../../elements/Pagination";

export default function Genres() {
  const [genres, setGenres] = useState([
    { id: 1, name: "Pop / V-pop", description: "Nhạc trẻ, phổ biến, dễ nghe, giai điệu bắt tai" },
    { id: 2, name: "Pop Ballad", description: "Nhạc pop trữ tình, cảm xúc, giai điệu nhẹ nhàng" },
    { id: 3, name: "R&B / Chill R&B", description: "Nhạc tiết tấu chậm, pha soul và hip-hop, cảm xúc sâu lắng" },
    { id: 4, name: "Hip-hop / Rap / Trap", description: "Nhạc rap, trap, tiết tấu mạnh, flow tự do, năng động" },
    { id: 5, name: "Lo-fi / Indie Pop", description: "Nhạc nhẹ nhàng, chill, thường mang âm hưởng độc lập" },
  ]);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Lọc dữ liệu theo tìm kiếm
  const filteredGenres = genres.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filteredGenres.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGenres = filteredGenres.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý thể loại</h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm thể loại..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // reset khi tìm kiếm
            }}
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
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 w-12">
                STT
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-[200px]">
                Tên thể loại
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Mô tả
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {currentGenres.map((genre, index) => (
              <tr key={genre.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-center font-medium text-gray-700">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-3 text-gray-700 font-medium">{genre.name}</td>
                <td className="px-6 py-3 text-gray-500">{genre.description}</td>
                <td className="px-6 py-3 flex items-center justify-center gap-3">
                  <button
                    className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100 text-gray-700 hover:text-black transition"
                    onClick={() => {
                      setIsEdit(true);
                      setEditingGenre(genre);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                    onClick={() =>
                      setGenres(genres.filter((g) => g.id !== genre.id))
                    }
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}

            {currentGenres.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                  Không có thể loại nào được tìm thấy
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination hiển thị mọi lúc */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />

      {/* Genre Form Modal */}
      {isFormOpen && (
        <GenreForm
          isEdit={isEdit}
          genre={editingGenre}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
