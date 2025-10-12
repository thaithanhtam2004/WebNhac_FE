// src/components/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "../ui/Admin/AdminSideBar";
import { useState } from "react";

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar cố định */}
      <aside className="fixed top-0 left-0 h-screen">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </aside>

      {/* Nội dung chính có scroll */}
      <main
        className={`flex-1 min-h-screen bg-gray-50 overflow-y-auto transition-all duration-500 ${
          isCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
