// src/components/pages/Admin/Albums.jsx
import { useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";
import AlbumForm from "../../ui/Admin/Album/AlbumForm";
import Pagination from "../../elements/Pagination";

export default function Albums() {
  const [albums, setAlbums] = useState([
    { id: 1, name: "Đánh đổi", artist: "Obito", year: 2024, description: "" },
    { id: 2, name: "99%", artist: "MCK", year: 2025, description: "" },
  ]);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Lọc theo tên album hoặc nghệ sĩ
  const filteredAlbums = albums.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.artist.toLowerCase().includes(search.toLowerCase())
  );

  // Phân trang
  const totalItems = filteredAlbums.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlbums = filteredAlbums.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Album</h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm album..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl shadow hover:bg-gray-800 transition"
            onClick={() => {
              setIsEdit(false);
              setEditingAlbum(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            Thêm album
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Năm</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mô tả</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAlbums.map((album, index) => (
              <tr key={album.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-center font-medium text-gray-700 align-middle">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-3 text-gray-700 font-medium align-middle">{album.name}</td>
                <td className="px-6 py-3 text-gray-500 align-middle">{album.artist}</td>
                <td className="px-6 py-3 text-gray-500 align-middle">{album.year}</td>
                <td className="px-6 py-3 text-gray-500 align-middle">
                  <div className="line-clamp-2">{album.description}</div>
                </td>
                <td className="px-6 py-3 text-center align-middle">
                  <div className="flex justify-center items-center gap-3">
                    <button
                      className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100 text-gray-700 hover:text-black transition"
                      onClick={() => {
                        setIsEdit(true);
                        setEditingAlbum(album);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                      onClick={() =>
                        setAlbums(albums.filter((a) => a.id !== album.id))
                      }
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {paginatedAlbums.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có album nào được tìm thấy
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />

      {/* Form */}
      {isFormOpen && (
        <AlbumForm
          isEdit={isEdit}
          album={editingAlbum}
          onClose={() => setIsFormOpen(false)}
          onSave={(newAlbum) => {
            if (isEdit) {
              setAlbums(albums.map((a) => (a.id === newAlbum.id ? newAlbum : a)));
            } else {
              setAlbums([...albums, { ...newAlbum, id: Date.now() }]);
            }
            setIsFormOpen(false);
          }}
        />
      )}
    </div>
  );
}
