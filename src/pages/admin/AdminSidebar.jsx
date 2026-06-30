import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Music,
  Users,
  UserCircle2,
  Disc,
  Tag,
  LogOut,
  Brain,
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" /> },
    { to: "/admin/songs", label: "Quản lý bài hát", icon: <Music className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" /> },
    { to: "/admin/artists", label: "Quản lý nghệ sĩ", icon: <Users className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" /> },
    { to: "/admin/genres", label: "Quản lý thể loại", icon: <Tag className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" /> },
    { to: "/admin/albums", label: "Quản lý album", icon: <Disc className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" /> },
    { to: "/admin/listeners", label: "Quản lý người dùng", icon: <UserCircle2 className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" /> },
    { to: "/admin/classify", label: "Phân lớp bài hát", icon: <Brain className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" /> },
    { to: "/", label: "Trang chủ", icon: <Home className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-72"
      } bg-black border-r border-gray-800 text-gray-400 flex flex-col h-screen select-none transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative shadow-2xl z-50`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-8 z-50 w-7 h-7 bg-white text-black border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 hover:scale-110 transition-all duration-300 shadow-md cursor-pointer outline-none"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Header / Brand */}
      <div className="flex items-center justify-center h-20 border-b border-gray-900 shrink-0">
        <span className={`font-black tracking-[0.25em] bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent uppercase select-none transition-all duration-500 ${isCollapsed ? "text-sm scale-75" : "text-xl scale-100"}`}>
          {isCollapsed ? "3T" : "3TMUSIC"}
        </span>
      </div>

      {/* Admin Profile Card */}
      <div className={`px-5 py-6 border-b border-gray-900 shrink-0 transition-all duration-500 overflow-hidden ${isCollapsed ? "items-center px-0 flex justify-center" : ""}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center border border-gray-800 text-white shrink-0 shadow-inner">
            <UserCircle2 className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 opacity-100 animate-fade-in transition-opacity duration-300">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Hệ thống quản trị
              </p>
              <p className="font-bold text-white text-sm truncate mt-0.5 tracking-wide">
                Administrator
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            title={isCollapsed ? item.label : ""}
            className={({ isActive }) =>
              `group flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 outline-none ${
                isActive
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] translate-x-1"
                  : "bg-transparent text-gray-400 hover:text-white hover:bg-gray-900 hover:translate-x-1"
              } ${isCollapsed ? "justify-center px-0" : ""}`
            }
          >
            <div className={`shrink-0 transition-all duration-300 ${isCollapsed ? "mx-auto" : ""}`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="truncate flex-1 animate-fade-in">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-900 shrink-0">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Đăng xuất" : ""}
          className={`flex items-center justify-center gap-3 w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] text-red-400 transition-all duration-300 outline-none ${isCollapsed ? "px-0" : "px-4"}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}