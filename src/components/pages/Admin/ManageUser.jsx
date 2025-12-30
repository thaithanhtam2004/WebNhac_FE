import { useState, useEffect, useMemo, useCallback } from "react";
import { Lock, Unlock, Loader2, Filter, ArrowUpDown, Users } from "lucide-react";
import Pagination from "../../elements/Pagination";
import axios from "../../../configs/apiConfig";
import { useNotification } from "../../../hooks/useNotification";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";

// Debounce hook
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState(""); 
  const [sortOrder, setSortOrder] = useState("asc");

  const itemsPerPage = 10;
  const { showNotification, NotificationUI } = useNotification();
  const { confirm, ConfirmUI } = useConfirmDialog();

  // === Fetch Users ===
  // ✅ FIX: useCallback dependency rỗng để hàm này không bị tạo lại liên tục
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (error) {
      console.error(error);
      // Lưu ý: Nếu showNotification thay đổi liên tục, nó sẽ dùng phiên bản cũ, nhưng an toàn ko crash
      showNotification("error", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, []); 

  // ✅ FIX: useEffect dependency rỗng để chỉ chạy 1 lần khi mount
  useEffect(() => { 
    fetchUsers(); 
  }, []);

  // Reset trang khi filter thay đổi
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filterStatus, sortBy, sortOrder]);

  // === Toggle Status ===
  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? "khóa" : "mở khóa";
    const ok = await confirm(`Bạn có chắc muốn ${action} tài khoản này không?`);
    if (!ok) return;

    setActionLoading(userId);
    try {
      await axios.patch(`/users/${userId}/status`, { isActive: !currentStatus });

      setUsers((prev) => prev.map((u) => u.userId === userId ? { ...u, isActive: !currentStatus } : u));
      showNotification("success", `Đã ${action} tài khoản thành công`);
    } catch (error) {
      showNotification("error", error.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterStatus("");
    setSortBy("");
    setSortOrder("asc");
  }, []);

  // Logic Filter & Sort
  const filteredUsers = useMemo(() => {
    let result = users.filter(user => {
      const search = debouncedSearch.toLowerCase();
      const matchesSearch = (user.name?.toLowerCase().includes(search) || user.email?.toLowerCase().includes(search) || user.phone?.includes(search));
      const matchesFilter = !filterStatus || (filterStatus === 'active' ? user.isActive : !user.isActive);
      return matchesSearch && matchesFilter;
    });

    if (sortBy) {
        result.sort((a, b) => {
            let valA = a[sortBy] || '', valB = b[sortBy] || '';
            if (sortBy === 'createdAt') { valA = new Date(valA).getTime(); valB = new Date(valB).getTime(); }
            else { valA = valA.toString().toLowerCase(); valB = valB.toString().toLowerCase(); }
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return result;
  }, [users, debouncedSearch, filterStatus, sortBy, sortOrder]);

  const paginatedUsers = useMemo(() => {
      return filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Helper format date
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
            <input 
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm" 
                placeholder="Tìm kiếm..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
            />
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-center justify-between">
                <div><p className="text-sm text-blue-600 font-medium">Tổng</p><p className="text-2xl font-bold text-blue-700">{users.length}</p></div>
                <Users className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center justify-between">
                <div><p className="text-sm text-green-600 font-medium">Active</p><p className="text-2xl font-bold text-green-700">{users.filter(u=>u.isActive).length}</p></div>
                <Unlock className="w-10 h-10 text-green-400 opacity-50" />
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center justify-between">
                <div><p className="text-sm text-red-600 font-medium">Locked</p><p className="text-2xl font-bold text-red-700">{users.filter(u=>!u.isActive).length}</p></div>
                <Lock className="w-10 h-10 text-red-400 opacity-50" />
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <Filter className="w-5 h-5 text-gray-600" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </select>
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none">
              <option value="">Sắp xếp theo...</option>
              <option value="name">Tên</option>
              <option value="email">Email</option>
              <option value="createdAt">Ngày tạo</option>
            </select>
            {sortBy && (
              <button onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")} className="px-3 py-2 border bg-white rounded-lg hover:bg-gray-100 text-sm font-medium">
                {sortOrder === "asc" ? "↑ Tăng" : "↓ Giảm"}
              </button>
            )}
          </div>
          {(searchTerm || filterStatus || sortBy) && <button onClick={handleClearFilters} className="ml-auto text-sm text-red-600 hover:underline">Xóa bộ lọc</button>}
        </div>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-sm w-[60px] text-center">STT</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-sm cursor-pointer" onClick={()=> {setSortBy('name'); setSortOrder(sortOrder==='asc'?'desc':'asc')}}>Tên <ArrowUpDown size={14} className="inline ml-1"/></th>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Email</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-sm">SĐT</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-sm cursor-pointer text-center" onClick={()=> {setSortBy('createdAt'); setSortOrder(sortOrder==='asc'?'desc':'asc')}}>Ngày tạo</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-sm text-center">Trạng thái</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-sm text-center">Hành động</th>
                </tr>
            </thead>
            <tbody>
                {loading ? <tr><td colSpan="7" className="text-center p-8"><Loader2 className="animate-spin mx-auto text-gray-500 w-8 h-8"/></td></tr> : 
                 paginatedUsers.length === 0 ? <tr><td colSpan="7" className="text-center p-8 text-gray-500">Không tìm thấy người dùng nào</td></tr> :
                 paginatedUsers.map((user, idx) => (
                    <tr key={user.userId} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-center text-gray-500 text-sm">{(currentPage-1)*itemsPerPage + idx + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 text-sm">{user.name}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{user.phone || '-'}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm text-center">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.isActive ? <><Unlock size={10}/> Hoạt động</> : <><Lock size={10}/> Bị khóa</>}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button 
                                onClick={() => handleToggleStatus(user.userId, user.isActive)}
                                disabled={actionLoading === user.userId}
                                className={`p-2 rounded-full border transition shadow-sm ${user.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                                title={user.isActive ? "Khóa tài khoản" : "Mở khóa"}
                            >
                                {actionLoading === user.userId ? <Loader2 size={16} className="animate-spin"/> : user.isActive ? <Lock size={16}/> : <Unlock size={16}/>}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {filteredUsers.length > 0 && (
        <Pagination currentPage={currentPage} totalItems={filteredUsers.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
      )}

      {NotificationUI}
      {ConfirmUI}
    </div>
  );
}