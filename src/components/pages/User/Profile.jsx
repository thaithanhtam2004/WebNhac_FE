import React from "react";
import { LogOut } from "lucide-react";

const Profile = () => {
  // Dữ liệu giả
  const user = {
    tennguoidung: "thuyen",
    email: "cus@gmail.com",
  };

  const handleChangePassword = () => {
    alert("Chức năng đổi mật khẩu sẽ được thêm sau!");
  };

  const handleLogout = () => {
    alert("Đăng xuất thành công!");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-start justify-start px-8 py-6">
      {/* Thanh trên cùng */}
      <div className="w-full flex justify-between items-center mb-10">
        {/* Thông tin người dùng */}
        <div>
          <h1 className="text-2xl font-bold mb-1">Thông tin cá nhân</h1>
          <p>
            <span className="font-semibold">Tên người dùng:</span>{" "}
            {user.tennguoidung}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
        </div>

        {/* Nút đăng xuất */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-red-700 transition"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>

      {/* Các nút thao tác khác */}
     
    </div>
  );
};

export default Profile;
