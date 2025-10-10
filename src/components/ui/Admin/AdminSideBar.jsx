import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Music,
  Users,
  UserCircle2,
  Disc,
  Tag,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: "/admin/songs", label: "Quản lý bài hát", icon: <Music className="w-5 h-5" /> },
    { to: "/admin/artists", label: "Quản lý ca sĩ", icon: <Users className="w-5 h-5" /> },
    { to: "/admin/genres", label: "Quản lý thể loại", icon: <Tag className="w-5 h-5" /> },
    { to: "/admin/albums", label: "Quản lý Album", icon: <Disc className="w-5 h-5" /> },
    { to: "/admin/listeners", label: "Quản lý người nghe", icon: <UserCircle2 className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    console.log("Đăng xuất...");
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-72"
      } bg-black text-gray-100 flex flex-col transition-all duration-500 ease-in-out shadow-2xl min-h-screen overflow-hidden`}
    >
      {/* Header */}
      <div className="relative flex items-center h-20 px-4 border-b border-gray-800 bg-black">
        {!isCollapsed && (
          <div className="flex-1 flex justify-center">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              3TMUSIC
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-4 p-2 rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-110"
        >
          {isCollapsed ? (
            <Menu className="w-6 h-6 text-cyan-300" />
          ) : (
            <ChevronLeft className="w-6 h-6 text-cyan-300" />
          )}
        </button>
      </div>

      {/* Admin info */}
      {!isCollapsed && (
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
      )}

      {/* Menu */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-gray-800/70 backdrop-blur-sm text-white shadow-lg shadow-cyan-500/20 scale-105 border border-cyan-500/50"
                  : "text-gray-300 hover:bg-gray-800/70 hover:text-white hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105"
              }`
            }
          >
            <div className="transform transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </div>
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-6 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-200 hover:text-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-400/20"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}