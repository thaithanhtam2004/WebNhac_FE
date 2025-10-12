// src/components/pages/Admin/Artists.jsx
import { useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";
import ArtistForm from "../../ui/Admin/Artist/ArtistForm";
import Pagination from "../../elements/Pagination";

export default function Artists() {
  const [artists, setArtists] = useState([
    {
      id: 1,
      name: "Sơn Tùng M-TP",
      description:
        "Ca sĩ, nhạc sĩ và nhà sản xuất âm nhạc hàng đầu V-pop, nổi tiếng với phong cách Pop, R&B và Trap hiện đại.",
    },
    {
      id: 2,
      name: "Obito",
      description:
        "Rapper trẻ tài năng, phong cách R&B và Hip-hop hiện đại, được biết đến qua các bản hit chill và cảm xúc.",
    },
    {
      id: 3,
      name: "Lil Wuyn",
      description:
        "Rapper nổi bật trong giới Underground, mang phong cách Rap, Trap và Hip-hop sâu sắc, ca từ ý nghĩa.",
    },
    {
      id: 4,
      name: "Wrxdie",
      description:
        "Ca sĩ trẻ theo đuổi phong cách Indie Pop và Chill R&B, âm nhạc mang màu sắc hiện đại và cảm xúc nhẹ nhàng.",
    },
    {
      id: 5,
      name: "MCK",
      description:
        "Rapper, ca sĩ và producer đa tài, kết hợp Rap, Trap và R&B, là một trong những gương mặt tiêu biểu của thế hệ Gen Z.",
    },
  ]);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Lọc theo tên hoặc mô tả
  const filteredArtists = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  // Dữ liệu sau khi phân trang
  const totalItems = filteredArtists.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArtists = filteredArtists.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý nghệ sĩ</h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm nghệ sĩ..."
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
              setEditingArtist(null);
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
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 w-12">
                STT
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-[200px]">
                Tên nghệ sĩ
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
            {currentArtists.map((artist, index) => (
              <tr key={artist.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-center font-medium text-gray-700">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-3 text-gray-700 font-medium">
                  {artist.name}
                </td>
                <td className="px-6 py-3 text-gray-500">{artist.description}</td>
                <td className="px-6 py-3 flex items-center justify-center gap-3">
                  <button
                    className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100 text-gray-700 hover:text-black transition"
                    onClick={() => {
                      setIsEdit(true);
                      setEditingArtist(artist);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                    onClick={() =>
                      setArtists(artists.filter((a) => a.id !== artist.id))
                    }
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}

            {currentArtists.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có nghệ sĩ nào được tìm thấy
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
        <ArtistForm
          isEdit={isEdit}
          artist={editingArtist}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
