// src/components/ui/Admin/AdminSideBar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Music,
  Users,
  UserCircle2,
  Disc,
  Tag,
  LogOut,
  Brain,
} from "lucide-react";

export default function AdminSidebar() {
  const menuItems = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: "/admin/songs", label: "Quản lý bài hát", icon: <Music className="w-5 h-5" /> },
    { to: "/admin/artists", label: "Quản lý nghệ sĩ", icon: <Users className="w-5 h-5" /> },
    { to: "/admin/genres", label: "Quản lý thể loại", icon: <Tag className="w-5 h-5" /> },
    { to: "/admin/albums", label: "Quản lý album", icon: <Disc className="w-5 h-5" /> },
    { to: "/admin/listeners", label: "Quản lý người nghe", icon: <UserCircle2 className="w-5 h-5" /> },
    { to: "/admin/features", label: "Quản lý tính năng bài hát", icon: <Brain className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    console.log("Đăng xuất...");
    // TODO: Implement logout logic
  };

  return (
    <aside className="w-72 bg-black text-gray-100 flex flex-col shadow-2xl h-screen">
      {/* Header */}
      <div className="flex items-center justify-center h-20 border-b border-gray-800 bg-black">
        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          3TMUSIC
        </span>
      </div>

      {/* Admin info */}
      <div className="px-4 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <UserCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-cyan-300 text-base font-semibold">Admin Panel</p>
            <p className="font-semibold text-white text-lg">Xin chào, Admin</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold ${
                isActive
                  ? "bg-gray-800 text-white border border-cyan-500"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <div className="flex-shrink-0">{item.icon}</div>
            <span className="truncate flex-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-6 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
