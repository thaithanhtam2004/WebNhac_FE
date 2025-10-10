import { Outlet } from "react-router-dom";
import AdminSidebar from "../ui/Admin/AdminSideBar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
