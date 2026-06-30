import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "../../config/api";
import Pagination from "../../components/common/Pagination";
import { useNotification } from "../../hooks/useNotification";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useScrollLock } from "../../hooks/useScrollLock";

import {
  Lock,
  Unlock,
  Trash,
  X,
  Loader2,
  HelpCircle,
  User,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  Info,
} from "lucide-react";

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const formatDateToDisplay = (dateString) => {
  if (!dateString) return "Chưa cập nhật";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Chưa cập nhật";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return "Chưa cập nhật";
  }
};

// Custom Select Component to replace native <select>
const CustomSelect = ({ value, options, onChange, placeholder = "Chọn..." }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div
      className="relative"
      tabIndex={0}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <div
        className="flex items-center justify-between gap-2 bg-transparent border-0 border-b-2 border-gray-300 hover:border-gray-500 focus-within:border-black py-1 cursor-pointer transition-colors px-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-900 text-xs font-bold uppercase tracking-widest select-none">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`w-3 h-3 text-gray-900 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="py-1">
            {options.map((opt) => (
              <li
                key={opt.value}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors ${value === opt.value ? 'text-black bg-gray-50' : 'text-gray-500'}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt_DESC");

  const [currentPage, setCurrentPage] = useState(1);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const itemsPerPage = 10;

  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // Ngăn cuộn trang khi mở modal
  useScrollLock(isDetailOpen || isHelpOpen);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [sortCol, sortDir] = sortBy.split("_");
      const res = await axios.get("/users", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          status: filterStatus,
          sortBy: sortCol,
          order: sortDir,
        },
      });

      const data = res.data?.data || [];
      const total = res.data?.pagination?.total ?? data.length;
      setUsers(Array.isArray(data) ? data : []);
      setTotalItems(total);
    } catch (err) {
      console.error("Fetch error:", err);
      showNotification("error", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterStatus, sortBy]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [debouncedSearch, filterStatus, sortBy]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(users.map((u) => u.userId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleToggleStatus = async (user) => {
    const isLocked = user.isActive === 0 || user.isActive === false;
    const ok = await confirm(`Bạn có chắc chắn muốn ${isLocked ? "mở khóa" : "khóa"} tài khoản này?`);
    if (!ok) return;
    try {
      await axios.patch(`/users/${user.userId}/status`, { isActive: !user.isActive });
      fetchUsers();
      showNotification("success", `Đã ${isLocked ? "mở khóa" : "khóa"} tài khoản thành công!`);
    } catch (err) {
      console.error("Toggle error:", err);
      showNotification("error", err.response?.data?.message || err.response?.data?.error || "Lỗi cập nhật trạng thái!");
    }
  };

  const handleBulkLock = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm(`Bạn có chắc muốn KHÓA ${selectedIds.length} tài khoản đã chọn?`);
    if (!ok) return;
    try {
      await axios.patch("/users/bulk-status", { userIds: selectedIds, isActive: false });
      fetchUsers();
      setSelectedIds([]);
      showNotification("success", `Đã khóa ${selectedIds.length} tài khoản!`);
    } catch (err) {
      console.error("Bulk lock error:", err);
      showNotification("error", err.response?.data?.message || err.response?.data?.error || "Lỗi khóa hàng loạt!");
    }
  };

  const handleBulkUnlock = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm(`Bạn có chắc muốn MỞ KHÓA ${selectedIds.length} tài khoản đã chọn?`);
    if (!ok) return;
    try {
      await axios.patch("/users/bulk-status", { userIds: selectedIds, isActive: true });
      fetchUsers();
      setSelectedIds([]);
      showNotification("success", `Đã mở khóa ${selectedIds.length} tài khoản!`);
    } catch (err) {
      console.error("Bulk unlock error:", err);
      showNotification("error", err.response?.data?.message || err.response?.data?.error || "Lỗi mở khóa hàng loạt!");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!id) return;
    const ok = await confirm("CẢNH BÁO: Xóa người dùng sẽ xóa vĩnh viễn dữ liệu liên quan. Bạn có chắc chắn muốn xóa?");
    if (!ok) return;

    setDeletingId(id);
    try {
      await axios.delete(`/users/${id}`);
      showNotification("success", "Xóa tài khoản thành công!");
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("error", error.response?.data?.message || error.response?.data?.error || "Lỗi khi xóa tài khoản!");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm(`CẢNH BÁO: Xóa vĩnh viễn ${selectedIds.length} tài khoản đã chọn. Bạn có chắc chắn không?`);
    if (!ok) return;

    setIsBulkDeleting(true);
    try {
      await axios.post("/users/bulk-delete", { userIds: selectedIds });
      showNotification("success", `Đã xóa thành công ${selectedIds.length} tài khoản!`);
      setSelectedIds([]);
      if (selectedIds.length >= users.length && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchUsers();
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      showNotification("error", err.response?.data?.message || err.response?.data?.error || "Lỗi khi xóa hàng loạt!");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const openDetail = (user) => {
    setDetailUser(user);
    setIsDetailOpen(true);
  };

  const renderTableBody = () => {
    if (users.length === 0 && !loading) {
      return (
        <tr>
          <td colSpan="7" className="px-6 py-24 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <p className="text-gray-900 font-bold text-lg mb-1">Không tìm thấy kết quả</p>
              <p className="text-gray-500 text-sm mb-4">Không có người dùng nào khớp với tìm kiếm của bạn.</p>
            </div>
          </td>
        </tr>
      );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;

    return users.map((user, index) => {
      const isSelected = selectedIds.includes(user.userId);
      const isLocked = user.isActive === 0 || user.isActive === false;

      return (
        <tr key={user.userId} className={`hover:bg-gray-50 transition border-b border-gray-100 group ${isLocked ? "opacity-60 bg-red-50/10" : ""}`}>
          <td className="px-4 py-4 text-center">
             <input type="checkbox" checked={isSelected} onChange={(e) => handleSelectOne(e, user.userId)} className="rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
          </td>
          <td className="px-4 py-4 text-center text-sm text-gray-500">
            {startIndex + index + 1}
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => openDetail(user)}>
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 text-gray-500">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className={`text-sm font-semibold ${isLocked ? "text-gray-500 line-through" : "text-gray-900"} group-hover:text-black transition-colors flex items-center gap-2`}>
                   {user.name}
                   {isLocked && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black no-underline">ĐÃ KHÓA</span>}
                </span>
                <span className="text-xs text-gray-500 block mt-0.5">{user.email}</span>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 text-center text-sm text-gray-600">
            {user.phone || "—"}
          </td>
          <td className="px-6 py-4 text-center">
             <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">{user.roleName || "USER"}</span>
          </td>
          <td className="px-6 py-4 text-center text-sm text-gray-500">
             {formatDateToDisplay(user.createdAt)}
          </td>
          <td className="px-6 py-4 text-center">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleToggleStatus(user)}
                className="text-gray-400 hover:text-gray-950 transition-colors outline-none"
                title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
              >
                {isLocked ? (
                  <Unlock className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => openDetail(user)}
                className="text-gray-400 hover:text-gray-900 transition-colors outline-none"
                title="Xem chi tiết"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteUser(user.userId)}
                disabled={deletingId === user.userId}
                className="text-gray-400 hover:text-red-600 transition-colors outline-none disabled:opacity-50"
                title="Xóa tài khoản"
              >
                {deletingId === user.userId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash className="w-4 h-4" />
                )}
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="relative pb-8">
      {/* 🚀 BULK ACTIONS FLOATING BAR */}
      <div className={`fixed bottom-6 right-6 z-40 flex items-center gap-4 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedIds.length > 0 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-16 scale-95 pointer-events-none"}`}>
         <div className="flex items-center gap-3 pr-4 border-r border-gray-700">
           <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
             {selectedIds.length}
           </div>
           <span className="font-semibold text-sm text-white">đã chọn</span>
         </div>
         <button onClick={handleBulkLock} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors outline-none text-yellow-400 hover:text-yellow-300">
           <Lock className="w-4 h-4" /> Khóa
         </button>
         <button onClick={handleBulkUnlock} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors outline-none text-green-400 hover:text-green-300">
           <Unlock className="w-4 h-4" /> Mở khóa
         </button>
         <div className="w-px h-6 bg-gray-700"></div>
         <button onClick={handleBulkDelete} disabled={isBulkDeleting} className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg text-sm font-semibold transition-colors outline-none">
           {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
           Xóa {selectedIds.length} tài khoản
         </button>
         <button onClick={() => setSelectedIds([])} className="ml-2 p-2 hover:bg-gray-800 rounded-full transition-colors outline-none text-gray-400 hover:text-white">
           <X className="w-4 h-4" />
         </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
              Quản lý Người dùng
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-black text-sm placeholder-gray-400 font-medium text-black bg-transparent transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <div>
            Hiển thị <span className="text-gray-900">{users.length}</span> /{" "}
            <span className="text-gray-900">{totalItems}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Sắp xếp:</span>
              <CustomSelect
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "createdAt_DESC", label: "Mới nhất" },
                  { value: "createdAt_ASC", label: "Cũ nhất" },
                  { value: "name_ASC", label: "Tên (A-Z)" },
                  { value: "name_DESC", label: "Tên (Z-A)" }
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Trạng thái:</span>
              <CustomSelect
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "active", label: "Đang hoạt động" },
                  { value: "inactive", label: "Đã khóa" }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
            </div>
          )}
          <table className="min-w-full border-collapse">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="w-[40px] px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    className="rounded-sm border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                    checked={users.length > 0 && selectedIds.length === users.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="w-[60px] px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Số điện thoại
                </th>
                <th className="w-[120px] px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Quyền hạn
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Ngày đăng ký
                </th>
                <th className="w-[150px] px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center justify-center gap-1">
                    Thao tác
                    <button onClick={() => setIsHelpOpen(true)} className="text-gray-400 hover:text-gray-900 transition outline-none" title="Trợ giúp">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        )}

        {/* Detail Modal */}
        {isDetailOpen && detailUser && createPortal(
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsDetailOpen(false);
            }}
          >
            <div className="bg-white text-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col relative animate-fade-in overflow-hidden">
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col h-full min-h-0">
                <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6 flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mb-4 border border-gray-200">
                    <User className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {detailUser.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      {detailUser.roleName || "USER"}
                    </span>
                    {(detailUser.isActive === 0 || detailUser.isActive === false) && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3 h-3" /> BỊ KHÓA
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4 text-sm text-gray-700 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Email liên hệ</p>
                      <p className="font-medium text-gray-900 mt-0.5">{detailUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Số điện thoại</p>
                      <p className="font-medium text-gray-900 mt-0.5">{detailUser.phone || "Chưa cung cấp"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Ngày đăng ký</p>
                      <p className="font-medium text-gray-900 mt-0.5">{formatDateToDisplay(detailUser.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Modal footer has been removed as locking/unlocking is now managed in the user list table actions. */}
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Help Modal */}
        {isHelpOpen && createPortal(
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsHelpOpen(false);
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2 flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5 text-gray-500" /> Hướng dẫn quản lý
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Khóa tài khoản</p>
                    <p className="text-xs text-gray-500 mt-0.5">Ngăn người dùng đăng nhập hệ thống tạm thời mà không mất dữ liệu lịch sử.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Xem chi tiết</p>
                    <p className="text-xs text-gray-500 mt-0.5">Xem email, số điện thoại, ngày đăng ký và trạng thái phân quyền.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <Trash className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Xóa tài khoản</p>
                    <p className="text-xs text-gray-500 mt-0.5">Xóa vĩnh viễn tài khoản người dùng khỏi cơ sở dữ liệu hệ thống.</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t flex justify-end">
                <button onClick={() => setIsHelpOpen(false)} className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-sm font-medium text-sm">
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
