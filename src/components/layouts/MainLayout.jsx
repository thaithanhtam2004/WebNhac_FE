import { Outlet } from "react-router-dom";
import Sidebar from "../elements/SideBar";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e1e1e] shadow-lg shadow-black/50 border-r border-gray-800">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="flex-1 bg-[#121212] p-6 overflow-y-auto">
        <div className="rounded-xl bg-[#1a1a1a] p-4 shadow-inner shadow-black/40">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
