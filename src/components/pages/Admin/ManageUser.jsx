import { useState, useEffect } from "react";
import { Lock, Unlock } from "lucide-react";
import Pagination from "../../elements/Pagination";
import axios from "../../../configs/apiConfig";
import { useNotification } from "../../../hooks/useNotification";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // === Fetch users ===
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/users");
      const data = res.data?.data || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showNotification("error", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // === Khóa / Mở khóa người dùng ===
  const handleToggleStatus = async (userId, isActive) => {
    const action = isActive ? "khóa" : "mở khóa";
    const ok = await confirm(`Bạn có chắc muốn ${action} tài khoản này không?`);
    if (!ok) return;

    try {
      await axios.patch(`/users/${userId}/status`, { isActive: !isActive });
      showNotification("success", `Đã ${action} tài khoản thành công`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showNotification("error", `Không thể ${action} tài khoản`);
    }
  };

  // === Lọc + Phân trang ===
  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.phone].some((field) =>
      (field || "").toLowerCase().includes(search.toLowerCase())
    )
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // === Format ngày ===
  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>

        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full table-fixed border border-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-900 font-semibold">
            <tr>
              <th className="px-4 py-3 text-center w-[60px]">STT</th>
              <th className="px-6 py-3 text-left w-[180px]">Tên người dùng</th>
              <th className="px-6 py-3 text-left w-[240px]">Email</th>
              <th className="px-6 py-3 text-left w-[150px]">Số điện thoại</th>
              <th className="px-6 py-3 text-center w-[140px]">Ngày tạo</th>
              <th className="px-6 py-3 text-center w-[120px]">Trạng thái</th>
              <th className="px-6 py-3 text-center w-[120px]">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-600">
                  Đang tải...
                </td>
              </tr>
            ) : currentUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-600">
                  Không có người dùng
                </td>
              </tr>
            ) : (
              currentUsers.map((user, index) => (
                <tr
                  key={user.userId || index}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="text-center px-4 py-3 text-gray-700 font-medium">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-3 text-gray-800 font-medium truncate">
                    {user.name || "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-600 truncate">
                    {user.email || "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-600 truncate">
                    {user.phone || "—"}
                  </td>
                  <td className="text-center px-6 py-3 text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="text-center px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="text-center px-6 py-3">
                    <button
                      onClick={() =>
                        handleToggleStatus(user.userId, user.isActive)
                      }
                      className={`p-2 rounded-full border transition ${
                        user.isActive
                          ? "text-red-600 border-red-300 hover:bg-red-50"
                          : "text-green-600 border-green-300 hover:bg-green-50"
                      }`}
                      title={
                        user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"
                      }
                    >
                      {user.isActive ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <Unlock className="w-5 h-5" />
                      )}
                    </button>
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
        totalItems={filteredUsers.length}
        onPageChange={setCurrentPage}
      />

      {/* Confirm & Notification */}
      {NotificationUI}
      {ConfirmUI}
    </div>
  );
}