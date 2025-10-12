// src/components/pages/Admin/Songs.jsx
import { useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";
import SongForm from "../../ui/Admin/Song/SongForm";
import Pagination from "../../elements/Pagination";

export default function Songs() {
  const [songs, setSongs] = useState([
    // Sơn Tùng MTP (7 bài)
  { id: 1, name: "Chúng Ta Của Tương Lai", artist: "Sơn Tùng M-TP", album: "", genre: "Pop Ballad" },
  { id: 2, name: "Nơi Này Có Anh", artist: "Sơn Tùng M-TP", album: "", genre: "Pop Ballad" },
  { id: 3, name: "Chạy Ngay Đi", artist: "Sơn Tùng M-TP", album: "", genre: "Pop / Trap" },
  { id: 4, name: "Có Chắc Yêu Là Đây", artist: "Sơn Tùng M-TP", album: "", genre: "Pop / R&B" },
  { id: 5, name: "Hãy Trao Cho Anh", artist: "Sơn Tùng M-TP", album: "", genre: "Latin Pop / Hip-hop" },
  { id: 6, name: "Âm Thầm Bên Em", artist: "Sơn Tùng M-TP", album: "", genre: "Pop Ballad" },
  { id: 7, name: "Cơn Mưa Ngang Qua", artist: "Sơn Tùng M-TP", album: "", genre: "Pop Ballad" },

  // 🎧 Obito (5 bài)
  { id: 8, name: "Đánh Đổi", artist: "Obito", album: "Đánh Đổi", genre: "R&B / Trap Soul" },
  { id: 9, name: "Tự Sự", artist: "Obito", album: "Đánh Đổi", genre: "Hip-hop / Lo-fi Rap" },
  { id: 10, name: "Sài Gòn Ơi", artist: "Obito", album: "Đánh Đổi", genre: "Chill R&B / Pop" },
  { id: 11, name: "Hà Nội", artist: "Obito", album: "Đánh Đổi", genre: "Alternative R&B" },
  { id: 12, name: "Xuất Phát Điểm", artist: "Obito", album: "Đánh Đổi", genre: "Hip-hop / Rap" },

  // 🔥 LilWuyn (4 bài)
  { id: 13, name: "Free And Dump", artist: "LilWuyn", album: "", genre: "Trap / Rap" },
  { id: 14, name: "Thay Đổi", artist: "LilWuyn", album: "", genre: "Hip-hop / Conscious Rap" },
  { id: 15, name: "Mở Mắt", artist: "LilWuyn", album: "", genre: "Experimental Hip-hop" },
  { id: 16, name: "An", artist: "LilWuyn", album: "", genre: "Lo-fi Rap" },

  // 🎵 Wrxdie (2 bài)
  { id: 17, name: "Băng Qua Cầu Giấy", artist: "Wrxdie", album: "", genre: "Indie Pop / Chill R&B" },
  { id: 18, name: "Vinflow", artist: "Wrxdie", album: "", genre: "Alternative Pop / Hip-hop" },

  // 🧢 MCK (2 bài)
  { id: 19, name: "Anh Đã Ổn Hơn", artist: "MCK", album: "99%", genre: "Rap / Trap / R&B" },
  { id: 20, name: "Cuốn Cho Anh 1 Điếu Nữa Đi", artist: "MCK", album: "99%", genre: "R&B / Lo-fi Trap" },
  ]);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Tìm kiếm theo tên + ca sĩ
  const filteredSongs = songs.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase())
  );

  // Phân trang
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSongs = filteredSongs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý bài hát</h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm bài hát..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl shadow hover:bg-gray-800 transition"
            onClick={() => {
              setIsEdit(false);
              setEditingSong(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            Thêm bài hát
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 w-12">STT</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên bài hát</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nghệ sĩ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Album</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Thể loại</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentSongs.map((song, index) => (
              <tr key={song.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-center font-medium text-gray-700">
                  {startIndex + index + 1}
                </td>
                <td className="px-6 py-3 text-gray-700">{song.name}</td>
                <td className="px-6 py-3 text-gray-700">{song.artist}</td>
                <td className="px-6 py-3 text-gray-700">{song.album}</td>
                <td className="px-6 py-3 text-gray-700">{song.genre}</td>
                <td className="px-6 py-3 flex items-center justify-center gap-3">
                  <button
                    className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100 text-gray-700 hover:text-black transition"
                    onClick={() => {
                      setIsEdit(true);
                      setEditingSong(song);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-red-50 text-red-600 hover:text-red-800 transition">
                    <Trash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredSongs.length}
        onPageChange={setCurrentPage}
      />

      {/* Song Form Modal */}
      {isFormOpen && (
        <SongForm
          isEdit={isEdit}
          song={editingSong}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
