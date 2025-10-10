import { Outlet } from "react-router-dom";
import Sidebar from "../elements/SideBar";

export default function MainLayout() {
  return (
    <div className="flex h-screen text-white bg-gradient-to-br from-[#0a0f1f] via-[#0d1b2a] to-[#000]">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Khu vực hiển thị trang con */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
