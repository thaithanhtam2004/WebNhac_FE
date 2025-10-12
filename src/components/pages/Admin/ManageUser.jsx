// src/components/pages/Admin/Listeners.jsx
import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import Pagination from "../../elements/Pagination";

export default function Listeners() {
  const [users, setUsers] = useState([
    { id: 1, name: "Nguyễn Văn A", email: "vana@example.com", createdAt: "2024-01-15", isActive: true },
    { id: 2, name: "Trần Thị B", email: "thib@example.com", createdAt: "2024-03-22", isActive: false },
    { id: 3, name: "Lê Văn C", email: "vanc@example.com", createdAt: "2024-06-10", isActive: true },
  ]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Lọc theo tên hoặc email
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Phân trang
  const totalItems = filteredUsers.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Toggle trạng thái
  const toggleStatus = (id) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, isActive: !u.isActive } : u
      )
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Người nghe</h1>

        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
          }}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 w-12">
                STT
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-center font-medium text-gray-700">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-3 text-gray-700 font-medium">{user.name}</td>
                <td className="px-6 py-3 text-gray-500">{user.email}</td>
                <td className="px-6 py-3 text-gray-500">{user.createdAt}</td>
                <td className="px-6 py-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.isActive ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center items-center gap-3">
                    <button
                      className={`p-2 rounded-full border shadow-sm transition ${
                        user.isActive
                          ? "bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      }`}
                      onClick={() => toggleStatus(user.id)}
                    >
                      {user.isActive ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <Unlock className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {currentUsers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 italic">
                  Không có người dùng nào được tìm thấy
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
